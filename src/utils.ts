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
