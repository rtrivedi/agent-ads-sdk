/**
 * Simple in-memory rate limiting for Supabase Edge Functions
 *
 * Note: This is a basic MVP implementation. For production at scale, use:
 * - Redis/Upstash for distributed rate limiting
 * - Cloudflare Rate Limiting
 * - API Gateway rate limiting
 */

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on function cold start)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit by IP address
 * Returns null if allowed, or Response object if rate limited
 */
export function checkRateLimit(
  req: Request,
  config: RateLimitConfig
): Response | null {
  // Get client IP from headers (Deno Deploy / Supabase Edge)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
             req.headers.get('x-real-ip') ||
             'unknown';

  const key = `${ip}:${new URL(req.url).pathname}`;
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    store.set(key, entry);
    return null; // Allowed
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return new Response(
      JSON.stringify({
        error: 'rate_limit_exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retry_after: retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString()
        }
      }
    );
  }

  // Increment counter
  entry.count++;
  store.set(key, entry);

  return null; // Allowed
}

/**
 * Pre-configured rate limit configs
 */
export const RateLimits = {
  // For signup endpoints (strict)
  SIGNUP: { windowMs: 60 * 1000, maxRequests: 5 },  // 5 per minute

  // For stats/dashboard endpoints (moderate)
  STATS: { windowMs: 60 * 1000, maxRequests: 60 },  // 60 per minute

  // For campaign creation (moderate)
  CAMPAIGN: { windowMs: 60 * 1000, maxRequests: 20 },  // 20 per minute

  // For ad serving (lenient)
  DECIDE: { windowMs: 60 * 1000, maxRequests: 1000 },  // 1000 per minute
};
