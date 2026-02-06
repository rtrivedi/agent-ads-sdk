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
  /** Full conversation context for semantic matching (optional) */
  context?: string;
  /** Detected or inferred user intent for semantic matching (optional) */
  user_intent?: string;
}

/**
 * Simplified request for semantic context-based ad matching.
 * Uses conversation context instead of manual taxonomy selection.
 *
 * The SDK automatically limits conversationHistory to the last 5 messages
 * to avoid token overflow. Only userMessage is required.
 *
 * @example
 * ```typescript
 * const ad = await client.decideFromContext({
 *   userMessage: "I need help with estate planning",
 *   conversationHistory: ["User: My father passed away recently"],
 *   placement: 'sponsored_suggestion'
 * });
 * ```
 */
export interface DecideFromContextRequest {
  /** The user's current message (required) */
  userMessage: string;

  /**
   * Optional conversation history (last few messages for context).
   * SDK automatically limits to last 5 messages to avoid token overflow.
   */
  conversationHistory?: string[];

  /** Ad placement type. Default: 'sponsored_suggestion' */
  placement?: PlacementType;

  /**
   * Optional category hint (e.g., 'legal', 'insurance', 'travel').
   * Used as fallback if semantic matching fails.
   */
  suggestedCategory?: string;

  /** User's country code. Default: 'US' */
  country?: string;

  /** User's language code. Default: 'en' */
  language?: string;

  /** User's platform. Default: 'web' */
  platform?: 'web' | 'ios' | 'android' | 'desktop' | 'voice' | 'other';
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
 * Scoring metadata for agent curation (Option C: Intelligent Integration)
 * Included in multi-ad responses to help agents choose the best ad
 */
export interface AdScore {
  relevance: number; // 0.0 - 1.0: How well ad matches intent
  composite: number; // bid × quality × relevance
  position: number;  // 1-indexed position in ranked results
}

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
      _score?: AdScore; // Optional: Included for multi-ad responses (agent curation)
    }
  | {
      unit_id: string;
      unit_type: 'sponsored_tool';
      disclosure: Disclosure;
      tracking: Tracking;
      tool: SponsoredTool;
      _score?: AdScore; // Optional: Included for multi-ad responses (agent curation)
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
  action_url: string;        // Real advertiser URL (display in web/GUI)
  tracking_url?: string;     // Optional: Server-side redirect for guaranteed tracking
  tracked_url?: string;      // Optional: Real URL with tracking param (for SMS/email)
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
  agentId?: string;          // Optional: Your agent ID for auto-filling requests
  supabaseAnonKey?: string;  // Optional: Supabase anon key (has default)
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}
