/**
 * Utility functions for the AttentionMarket SDK.
 * Includes UUID generation, opportunity helpers, and event builders.
 */

import { randomUUID } from 'node:crypto';
import type { EventIngestRequest, Opportunity } from './types.js';

/**
 * Generate a UUID v4 for use as event_id, request_id, etc.
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Generate an ISO 8601 timestamp for the current moment.
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// Opportunity Helper
// ============================================================================

export interface CreateOpportunityParams {
  // Required
  taxonomy: string;
  country: string;
  language: string;
  platform: 'web' | 'ios' | 'android' | 'desktop' | 'voice' | 'other';

  // Optional
  query?: string;
  region?: string;
  city?: string;

  // Optional overrides (with defaults)
  constraints?: {
    max_units?: number;
    allowed_unit_types?: ('sponsored_suggestion' | 'sponsored_block' | 'sponsored_tool')[];
    blocked_categories?: string[];
    max_title_chars?: number;
    max_body_chars?: number;
  };
  privacy?: {
    data_policy?: 'coarse_only' | 'none' | 'extended';
  };
}

/**
 * Create a valid Opportunity object with safe defaults.
 *
 * Defaults:
 * - constraints.max_units = 1
 * - constraints.allowed_unit_types = ['sponsored_suggestion']
 * - privacy.data_policy = 'coarse_only'
 */
export function createOpportunity(params: CreateOpportunityParams): Opportunity {
  const opportunity: Opportunity = {
    intent: {
      taxonomy: params.taxonomy,
    },
    context: {
      country: params.country,
      language: params.language,
      platform: params.platform,
    },
    constraints: {
      max_units: params.constraints?.max_units ?? 1,
      allowed_unit_types: params.constraints?.allowed_unit_types ?? ['sponsored_suggestion'],
    },
    privacy: {
      data_policy: params.privacy?.data_policy ?? 'coarse_only',
    },
  };

  // Add optional intent fields
  if (params.query !== undefined) {
    opportunity.intent.query = params.query;
  }

  // Add optional context fields
  if (params.region !== undefined) {
    opportunity.context.region = params.region;
  }
  if (params.city !== undefined) {
    opportunity.context.city = params.city;
  }

  // Add optional constraint fields
  if (params.constraints?.blocked_categories !== undefined) {
    opportunity.constraints.blocked_categories = params.constraints.blocked_categories;
  }
  if (params.constraints?.max_title_chars !== undefined) {
    opportunity.constraints.max_title_chars = params.constraints.max_title_chars;
  }
  if (params.constraints?.max_body_chars !== undefined) {
    opportunity.constraints.max_body_chars = params.constraints.max_body_chars;
  }

  return opportunity;
}

// ============================================================================
// Event Helpers
// ============================================================================

export interface CreateImpressionEventParams {
  agent_id: string;
  request_id: string;
  decision_id: string;
  unit_id: string;
  tracking_token: string;
  occurred_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Helper to create an impression event payload.
 *
 * @param params - Event parameters (snake_case to match API)
 * @returns EventIngestRequest ready to pass to client.track()
 */
export function createImpressionEvent(params: CreateImpressionEventParams): EventIngestRequest {
  const event: EventIngestRequest = {
    event_id: generateUUID(),
    occurred_at: params.occurred_at ?? generateTimestamp(),
    agent_id: params.agent_id,
    request_id: params.request_id,
    decision_id: params.decision_id,
    unit_id: params.unit_id,
    event_type: 'impression',
    tracking_token: params.tracking_token,
  };

  if (params.metadata !== undefined) {
    event.metadata = params.metadata;
  }

  return event;
}

// ============================================================================
// Security & Sanitization Helpers
// ============================================================================

/**
 * HTML escape map - created once to avoid recreation on each call
 */
const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

/**
 * Regex for matching HTML special characters - created once for performance
 */
const HTML_ESCAPE_REGEX = /[&<>"'`\/]/g;

/**
 * Maximum URL length to prevent DoS attacks
 */
const MAX_URL_LENGTH = 2048;

/**
 * Dangerous URL protocols that must always be blocked
 */
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'file:', 'vbscript:', 'blob:'];

/**
 * Options for URL sanitization
 */
export interface SanitizeURLOptions {
  /**
   * Allow HTTP URLs (default: false, HTTPS only)
   */
  allowHttp?: boolean;
  /**
   * Allow tel: links (default: true)
   */
  allowTel?: boolean;
  /**
   * Allow mailto: links (default: true)
   */
  allowMailto?: boolean;
  /**
   * Callback for validation warnings (instead of console.warn)
   */
  onWarning?: (message: string, context: { url?: string; protocol?: string }) => void;
}

/**
 * Escape HTML special characters to prevent XSS attacks.
 *
 * Handles null/undefined safely by returning empty string.
 * Escapes: & < > " ' / `
 *
 * Use this when displaying ad content (title, body, cta) in HTML contexts.
 *
 * @param text - Text to escape (can be null/undefined)
 * @returns Escaped HTML string (empty string if input is null/undefined)
 *
 * @example
 * ```typescript
 * const safeTitle = escapeHTML(unit.suggestion.title);
 * element.innerHTML = safeTitle; // Safe from XSS
 *
 * escapeHTML(null); // Returns ''
 * escapeHTML('<script>alert(1)</script>'); // Returns '&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
export function escapeHTML(text: string | null | undefined): string {
  // Handle null/undefined safely
  if (text == null) {
    return '';
  }

  return text.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPES[char] || char);
}

/**
 * Sanitize and validate a URL to prevent XSS and phishing attacks.
 *
 * Handles null/undefined safely by returning null.
 * Blocks dangerous protocols like javascript:, data:, file:, blob:, vbscript:.
 * Validates URL length to prevent DoS attacks (max 2048 chars).
 * Handles protocol-relative URLs (//example.com).
 *
 * @param url - URL to sanitize (can be null/undefined)
 * @param options - Sanitization options
 * @returns Sanitized URL string, or null if invalid/dangerous
 *
 * @example
 * ```typescript
 * const safeURL = sanitizeURL(unit.suggestion.action_url);
 * if (safeURL) {
 *   window.open(safeURL, '_blank');
 * }
 *
 * sanitizeURL(null); // Returns null
 * sanitizeURL('javascript:alert(1)'); // Returns null (blocked)
 * sanitizeURL('https://example.com'); // Returns 'https://example.com'
 * sanitizeURL('http://example.com', { allowHttp: true }); // Returns 'http://example.com'
 * ```
 */
export function sanitizeURL(
  url: string | null | undefined,
  options?: SanitizeURLOptions
): string | null {
  // Handle null/undefined safely
  if (url == null) {
    return null;
  }

  const opts = {
    allowHttp: options?.allowHttp ?? false,
    allowTel: options?.allowTel ?? true,
    allowMailto: options?.allowMailto ?? true,
    onWarning: options?.onWarning ?? undefined,
  };

  try {
    const trimmedURL = url.trim();

    // Block empty URLs
    if (!trimmedURL) {
      return null;
    }

    // Validate URL length to prevent DoS
    if (trimmedURL.length > MAX_URL_LENGTH) {
      opts.onWarning?.('URL exceeds maximum length', { url: trimmedURL });
      return null;
    }

    // Handle protocol-relative URLs (//example.com)
    let parsedURL: URL;
    if (trimmedURL.startsWith('//')) {
      // Protocol-relative URLs need a base URL to parse
      try {
        parsedURL = new URL(trimmedURL, 'https://dummy-base.com');
        // Convert to absolute HTTPS URL
        return `https:${trimmedURL}`;
      } catch {
        opts.onWarning?.('Invalid protocol-relative URL', { url: trimmedURL });
        return null;
      }
    }

    // Parse URL
    parsedURL = new URL(trimmedURL);

    // Check protocol
    const protocol = parsedURL.protocol.toLowerCase();

    // Always block dangerous protocols
    if (DANGEROUS_PROTOCOLS.includes(protocol)) {
      opts.onWarning?.('Blocked dangerous URL protocol', { url: trimmedURL, protocol });
      return null;
    }

    // Allow HTTPS
    if (protocol === 'https:') {
      return trimmedURL;
    }

    // Conditionally allow HTTP
    if (protocol === 'http:') {
      if (opts.allowHttp) {
        return trimmedURL;
      } else {
        opts.onWarning?.('HTTP URL blocked. Use HTTPS or set allowHttp: true', {
          url: trimmedURL,
          protocol
        });
        return null;
      }
    }

    // Conditionally allow tel:
    if (protocol === 'tel:') {
      return opts.allowTel ? trimmedURL : null;
    }

    // Conditionally allow mailto:
    if (protocol === 'mailto:') {
      return opts.allowMailto ? trimmedURL : null;
    }

    // Block unknown protocols
    opts.onWarning?.('Unknown URL protocol blocked', { url: trimmedURL, protocol });
    return null;
  } catch (error) {
    // Invalid URL format
    opts.onWarning?.('Invalid URL format', { url });
    return null;
  }
}
