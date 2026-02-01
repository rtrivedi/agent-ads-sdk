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

export interface CreateClickEventParams {
  agent_id: string;
  request_id: string;
  decision_id: string;
  unit_id: string;
  tracking_token: string;
  href: string;
  occurred_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Helper to create a click event payload.
 *
 * @param params - Event parameters (snake_case to match API)
 * @returns EventIngestRequest ready to pass to client.track()
 */
export function createClickEvent(params: CreateClickEventParams): EventIngestRequest {
  const event: EventIngestRequest = {
    event_id: generateUUID(),
    occurred_at: params.occurred_at ?? generateTimestamp(),
    agent_id: params.agent_id,
    request_id: params.request_id,
    decision_id: params.decision_id,
    unit_id: params.unit_id,
    event_type: 'click',
    tracking_token: params.tracking_token,
  };

  // Include href in metadata
  if (params.metadata !== undefined) {
    event.metadata = {
      ...params.metadata,
      href: params.href,
    };
  } else {
    event.metadata = {
      href: params.href,
    };
  }

  return event;
}

// ============================================================================
// Security & Sanitization Helpers
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS attacks.
 *
 * Use this when displaying ad content (title, body, cta) in HTML contexts.
 *
 * @example
 * ```typescript
 * const safeTitle = escapeHTML(unit.suggestion.title);
 * element.innerHTML = safeTitle; // Safe from XSS
 * ```
 */
export function escapeHTML(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Sanitize and validate a URL to prevent XSS and phishing attacks.
 *
 * Blocks dangerous protocols like javascript:, data:, and file:.
 * Returns null if the URL is invalid or dangerous.
 *
 * @example
 * ```typescript
 * const safeURL = sanitizeURL(unit.suggestion.action_url);
 * if (safeURL) {
 *   window.open(safeURL, '_blank');
 * }
 * ```
 */
export function sanitizeURL(
  url: string,
  options?: {
    allowHttp?: boolean;
    allowTel?: boolean;
    allowMailto?: boolean;
  }
): string | null {
  const opts = {
    allowHttp: options?.allowHttp ?? false,
    allowTel: options?.allowTel ?? true,
    allowMailto: options?.allowMailto ?? true,
  };

  try {
    const trimmedURL = url.trim();

    // Block empty URLs
    if (!trimmedURL) {
      return null;
    }

    // Parse URL
    const parsedURL = new URL(trimmedURL);

    // Check protocol
    const protocol = parsedURL.protocol.toLowerCase();

    // Always block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];
    if (dangerousProtocols.includes(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`);
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
        console.warn('HTTP URL blocked. Use HTTPS or set allowHttp: true');
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
    console.warn(`Unknown URL protocol blocked: ${protocol}`);
    return null;
  } catch (error) {
    // Invalid URL format
    console.warn('Invalid URL format:', url);
    return null;
  }
}
