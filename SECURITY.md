# Security Policy

## Table of Contents

1. [Server-Side Only Usage](#server-side-only-usage)
2. [API Key Management](#api-key-management)
3. [Cross-Site Scripting (XSS) Prevention](#cross-site-scripting-xss-prevention)
4. [Content Security & Phishing](#content-security--phishing)
5. [Input Validation](#input-validation)
6. [Rate Limiting & Abuse Prevention](#rate-limiting--abuse-prevention)
7. [Reporting Security Issues](#reporting-security-issues)

---

## Server-Side Only Usage

🔴 **CRITICAL: This SDK MUST only be used server-side.**

Your API key provides full access to your account and billing. **Never use this SDK in client-side code** (browser, mobile apps, etc.).

### ✅ Safe Environments

- Node.js backend servers
- Serverless functions (AWS Lambda, Vercel Functions, Cloudflare Workers)
- Server-side rendering (Next.js getServerSideProps, SvelteKit load)

### ❌ Unsafe Environments

- Browser/frontend JavaScript
- Mobile apps (React Native, Flutter without backend proxy)
- Electron apps (renderer process)
- Browser extensions

### Client-Side Apps

If you need to show ads in a client-side app:

```typescript
// ✅ CORRECT: Backend API route
// /api/get-ad
export async function GET(request) {
  const client = new AttentionMarketClient({
    apiKey: process.env.ATTENTIONMARKET_API_KEY, // Server-side only
  });

  const unit = await client.decide({...});
  return Response.json(unit);
}

// ✅ CORRECT: Frontend fetches from your backend
const response = await fetch('/api/get-ad');
const unit = await response.json();
```

```typescript
// ❌ WRONG: API key exposed in browser
const client = new AttentionMarketClient({
  apiKey: 'am_live_...', // EXPOSED TO USERS!
});
```

---

## API Key Management

**IMPORTANT**: Never commit API keys to version control.

Your AttentionMarket API key (`am_live_...` or `am_test_...`) provides access to your agent's account and billing.

### Environment Variables

Store your API key in environment variables, not in code:

```bash
export ATTENTIONMARKET_API_KEY=am_live_...
export ATTENTIONMARKET_AGENT_ID=agt_01HV...
```

Then use it in your application:

```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
});
```

### .gitignore

Ensure your `.gitignore` includes:

```
.env
.env.local
.env.*.local
*.pem
*.key
credentials.json
```

### Production Deployments

- Use secure secret management (AWS Secrets Manager, GitHub Secrets, HashiCorp Vault)
- Rotate API keys periodically (at least every 90 days)
- Use `am_test_...` keys for development and testing
- Use `am_live_...` keys only in production environments
- Never log API keys (even partially masked)

---

## Cross-Site Scripting (XSS) Prevention

🔴 **CRITICAL: Ad content can contain malicious HTML/JavaScript.**

Advertisers could inject malicious code into ad titles, bodies, or CTAs. You **MUST** sanitize all ad content before displaying it.

### The Risk

```typescript
// ❌ DANGEROUS: Direct HTML injection
const unit = await client.decide({...});
document.getElementById('ad').innerHTML = unit.suggestion.title;
```

If `title` contains `<img src=x onerror=alert(document.cookie)>`, this executes JavaScript and steals cookies.

### Safe Rendering

**Option 1: Use SDK sanitization helpers** (Recommended)

```typescript
import { escapeHTML, sanitizeURL } from '@the_ro_show/agent-ads-sdk';

if (unit && unit.unit_type === 'sponsored_suggestion') {
  const safeTitle = escapeHTML(unit.suggestion.title);
  const safeBody = escapeHTML(unit.suggestion.body);
  const safeCTA = escapeHTML(unit.suggestion.cta);
  const safeURL = sanitizeURL(unit.suggestion.action_url);

  // Safe to inject
  document.getElementById('ad-title').innerHTML = safeTitle;
  document.getElementById('ad-body').innerHTML = safeBody;

  // For links, also validate URL scheme
  if (safeURL) {
    document.getElementById('ad-link').href = safeURL;
    document.getElementById('ad-link').textContent = safeCTA;
  }
}
```

**Option 2: Use textContent instead of innerHTML**

```typescript
// ✅ SAFE: Text-only rendering
document.getElementById('ad-title').textContent = unit.suggestion.title;
document.getElementById('ad-body').textContent = unit.suggestion.body;
```

**Option 3: Use a sanitization library**

```typescript
import DOMPurify from 'dompurify';

const safeHTML = DOMPurify.sanitize(unit.suggestion.title);
document.getElementById('ad').innerHTML = safeHTML;
```

### React/Vue/Angular

```typescript
// ✅ React (automatically escapes)
<div className="ad-title">{unit.suggestion.title}</div>

// ❌ React (dangerous)
<div dangerouslySetInnerHTML={{__html: unit.suggestion.title}} />

// ✅ Vue (automatically escapes)
<div>{{ unit.suggestion.title }}</div>

// ❌ Vue (dangerous)
<div v-html="unit.suggestion.title"></div>
```

---

## Content Security & Phishing

Ad content may contain:
- Phishing links (`action_url: "http://paypa1.com/login"`)
- Malicious file downloads (`action_url: "javascript:downloadMalware()"`)
- Social engineering attacks

### URL Validation

Always validate `action_url` before using it:

```typescript
import { sanitizeURL } from '@the_ro_show/agent-ads-sdk';

const safeURL = sanitizeURL(unit.suggestion.action_url);

if (!safeURL) {
  console.error('Invalid or dangerous URL:', unit.suggestion.action_url);
  // Don't render the ad
  return;
}

// Safe to use
window.open(safeURL, '_blank');
```

### Allowed URL schemes:
- ✅ `https://`
- ✅ `http://` (with warning)
- ✅ `tel:` (phone numbers)
- ✅ `mailto:` (email)
- ❌ `javascript:` (blocked)
- ❌ `data:` (blocked)
- ❌ `file:` (blocked)

### Content Security Policy (CSP)

Add CSP headers to your web app:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

---

## Input Validation

### User Input Sanitization

If you pass user input to the SDK (e.g., search queries), sanitize it first:

```typescript
// ✅ SAFE: Limit length and remove dangerous characters
function sanitizeQuery(userInput: string): string {
  return userInput
    .slice(0, 500) // Max length
    .replace(/[<>'"]/g, ''); // Remove HTML chars
}

const opportunity = createOpportunity({
  taxonomy: 'local_services.movers.quote',
  query: sanitizeQuery(userProvidedQuery),
  // ...
});
```

### Taxonomy Validation

Only use known, trusted taxonomies:

```typescript
const ALLOWED_TAXONOMIES = [
  'local_services.movers.quote',
  'local_services.restaurants.search',
  // ...your list
];

function validateTaxonomy(taxonomy: string): boolean {
  return ALLOWED_TAXONOMIES.includes(taxonomy);
}

// ✅ Validate before use
if (!validateTaxonomy(userTaxonomy)) {
  throw new Error('Invalid taxonomy');
}
```

---

## Rate Limiting & Abuse Prevention

### SDK-Side Limits

The SDK has **no built-in rate limiting**. You must implement this:

```typescript
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute',
});

async function getAd() {
  await limiter.removeTokens(1);
  return client.decide({...});
}
```

### Prevent Tracking Abuse

Don't allow users to trigger tracking events directly:

```typescript
// ❌ DANGEROUS: User controls tracking
app.post('/track-impression', async (req) => {
  await client.trackImpression(req.body); // User can fake metrics!
});

// ✅ SAFE: Server validates before tracking
app.post('/track-impression', async (req) => {
  const { unitId } = req.body;

  // Verify this unit was actually shown to this user
  if (!isValidImpressionForUser(req.session.userId, unitId)) {
    return res.status(403).json({ error: 'Invalid impression' });
  }

  await client.trackImpression({...});
});
```

### Request Deduplication

Prevent duplicate tracking:

```typescript
const impressionsSeen = new Set();

async function trackOnce(unitId: string) {
  if (impressionsSeen.has(unitId)) {
    return; // Already tracked
  }

  impressionsSeen.add(unitId);
  await client.trackImpression({...});
}
```

---

## Reporting Security Issues

If you discover a security vulnerability in this SDK, please email:

**security@attentionmarket.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your contact information (for follow-up)

**Do not:**
- Open public GitHub issues for security vulnerabilities
- Post on social media or forums
- Exploit the vulnerability

We will acknowledge your report within 48 hours and provide updates on the fix timeline.

---

## Security Checklist

Before deploying to production:

- [ ] API keys stored in environment variables (not code)
- [ ] SDK only used server-side (not in browser/mobile)
- [ ] All ad content sanitized before rendering (XSS prevention)
- [ ] URLs validated before use (phishing prevention)
- [ ] Rate limiting implemented (abuse prevention)
- [ ] User input validated and sanitized
- [ ] Error messages don't leak sensitive information
- [ ] HTTPS enforced for all API calls
- [ ] Dependencies regularly updated
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)

---

**Last Updated:** 2025-02-01
**SDK Version:** 0.1.1+
