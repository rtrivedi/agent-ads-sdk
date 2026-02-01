/**
 * TypeScript types mirroring the AttentionMarket OpenAPI specification.
 * These types are the source of truth for the SDK API surface.
 */

// ============================================================================
// Agent Signup
// ============================================================================

export interface AgentSignupRequest {
  owner_email: string;
  agent_name: string;
  sdk?: 'typescript' | 'python' | 'other';
  environment?: 'test' | 'live';
  declared_placements?: PlacementType[];
  declared_capabilities?: string[];
}

export interface AgentSignupResponse {
  agent_id: string;
  api_key: string;
  test_api_key: string;
  created_at: string;
}

// ============================================================================
// Decide (Core Decision Endpoint)
// ============================================================================

export interface DecideRequest {
  request_id: string;
  agent_id: string;
  placement: Placement;
  opportunity: Opportunity;
}

export interface DecideResponse {
  request_id: string;
  decision_id: string;
  status: 'filled' | 'no_fill';
  ttl_ms: number;
  units: AdUnit[];
}

// ============================================================================
// Placement
// ============================================================================

export type PlacementType = 'sponsored_suggestion' | 'sponsored_block' | 'sponsored_tool';

export interface Placement {
  type: PlacementType;
  surface: string;
}

// ============================================================================
// Opportunity
// ============================================================================

export interface Opportunity {
  intent: Intent;
  context: Context;
  constraints: Constraints;
  privacy: Privacy;
}

export interface Intent {
  taxonomy: string;
  query?: string;
}

export interface Context {
  country: string;
  language: string;
  platform: 'web' | 'ios' | 'android' | 'desktop' | 'voice' | 'other';
  region?: string;
  city?: string;
}

export interface Constraints {
  max_units: number;
  allowed_unit_types: PlacementType[];
  blocked_categories?: string[];
  max_title_chars?: number;
  max_body_chars?: number;
}

export interface Privacy {
  data_policy: 'coarse_only' | 'none' | 'extended';
}

// ============================================================================
// Ad Units
// ============================================================================

/**
 * AdUnit is a discriminated union enforcing the OpenAPI oneOf constraint.
 * Either suggestion OR tool is required based on unit_type.
 */
export type AdUnit =
  | {
      unit_id: string;
      unit_type: 'sponsored_suggestion';
      disclosure: Disclosure;
      tracking: Tracking;
      suggestion: SponsoredSuggestion;
    }
  | {
      unit_id: string;
      unit_type: 'sponsored_tool';
      disclosure: Disclosure;
      tracking: Tracking;
      tool: SponsoredTool;
    };

export interface Disclosure {
  label: string;
  explanation: string;
  sponsor_name: string;
}

export interface Tracking {
  token: string;
  impression_url?: string;
  click_url?: string;
}

export interface SponsoredSuggestion {
  title: string;
  body: string;
  cta: string;
  action_url: string;
}

export interface SponsoredTool {
  tool_name: string;
  description: string;
  input_schema: Record<string, unknown>;
  call: ToolCall;
}

export interface ToolCall {
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
}

// ============================================================================
// Events
// ============================================================================

export type EventType = 'impression' | 'click' | 'action' | 'conversion' | 'dismiss' | 'hide_advertiser' | 'report';

export interface EventIngestRequest {
  event_id: string;
  occurred_at: string;
  agent_id: string;
  request_id: string;
  decision_id: string;
  unit_id: string;
  event_type: EventType;
  tracking_token: string;
  metadata?: Record<string, unknown>;
}

export interface EventIngestResponse {
  accepted: boolean;
}

// ============================================================================
// Policy
// ============================================================================

export interface PolicyResponse {
  version: string;
  disclosure: {
    required: boolean;
    label: string;
    require_sponsor_name: boolean;
  };
  defaults: {
    max_units_per_response: number;
    blocked_categories: string[];
  };
  unit_rules: Record<string, unknown>;
}

// ============================================================================
// Errors
// ============================================================================

export interface APIError {
  error: string;
  message: string;
  request_id: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// SDK Configuration
// ============================================================================

export interface SDKConfig {
  apiKey: string;
  supabaseAnonKey?: string; // Optional: Supabase anon key (has default)
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}
