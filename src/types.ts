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
  appId?: string;            // Optional: Your app ID (for Intenture APIs)
  supabaseAnonKey?: string;  // Optional: Supabase anon key (has default)
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

// ============================================================================
// Intenture Network APIs (Intent-Key Based)
// ============================================================================

/**
 * Request an offer using explicit intent-key matching.
 *
 * This is the deterministic, high-confidence API for when you KNOW what
 * the user wants. Use intentKey for exact matching instead of semantic search.
 *
 * @example
 * ```typescript
 * const offer = await client.requestOffer({
 *   placementId: 'chat_suggestion',
 *   intentKey: 'coffee.purchase.nearby',
 *   context: {
 *     geo: { city: 'NYC', country: 'US' }
 *   }
 * });
 * ```
 */
export interface RequestOfferParams {
  /** Placement identifier (e.g., 'chat_suggestion', 'inline_card') */
  placementId: string;

  /**
   * Intent key for matching (e.g., 'coffee', 'coffee.purchase', 'legal.estate_planning')
   * Uses hierarchical matching: tries exact match, then walks up taxonomy.
   */
  intentKey: string;

  /**
   * PREVIEW: Source agent for revenue share tracking (optional)
   *
   * When another agent refers traffic to you, they can include their
   * agent_id to track referrals. When revenue share is enabled (future),
   * the source agent will receive the specified percentage.
   *
   * @experimental Revenue share not active yet - logs for analytics only
   */
  sourceAgentId?: string;

  /**
   * PREVIEW: Revenue share percentage for source agent (0-50)
   * Only applies if sourceAgentId is provided.
   *
   * @experimental Revenue share not active yet
   */
  revenueSharePct?: number;

  /** Context for targeting and personalization */
  context?: {
    /** Geographic context */
    geo?: {
      country?: string;
      region?: string;
      city?: string;
      lat?: number;
      lng?: number;
    };

    /** Locale for language/region targeting */
    locale?: string;

    /**
     * Optional semantic context for fallback matching.
     * If exact intent-key match fails, system will try semantic matching
     * using this context within the intent-key category.
     */
    semanticContext?: string;

    /**
     * User context identifier for deduplication (optional)
     * Use a session hash or similar - NO PII
     */
    userContextId?: string;
  };

  /** Constraints for filtering offers */
  constraints?: {
    /** Minimum CPC in micros (e.g., 1000000 = $1.00) */
    minCpcMicros?: number;

    /** Block specific campaigns from being returned */
    blockCampaignIds?: string[];
  };
}

/**
 * Request an offer using semantic context matching.
 *
 * This is the fuzzy, discovery API for when you're NOT certain what
 * the user wants. Pass conversation context and let semantic search
 * figure out the best match.
 *
 * @example
 * ```typescript
 * const offer = await client.requestOfferFromContext({
 *   placementId: 'chat_suggestion',
 *   userMessage: "I'm so tired, long day...",
 *   conversationHistory: ["How was work?", "Exhausting"],
 *   context: { geo: { city: 'NYC' } }
 * });
 * ```
 */
export interface RequestOfferFromContextParams {
  /** Placement identifier */
  placementId: string;

  /** User's current message */
  userMessage: string;

  /**
   * Optional conversation history for context.
   * SDK automatically limits to last 5 messages.
   */
  conversationHistory?: string[];

  /**
   * PREVIEW: Source agent for revenue share tracking (optional)
   * @experimental Revenue share not active yet
   */
  sourceAgentId?: string;

  /**
   * PREVIEW: Revenue share percentage (0-50)
   * @experimental Revenue share not active yet
   */
  revenueSharePct?: number;

  /** Context for targeting */
  context?: {
    geo?: {
      country?: string;
      region?: string;
      city?: string;
    };
    locale?: string;
    userContextId?: string;
  };

  /** Optional category hint as fallback */
  suggestedCategory?: string;
}

/**
 * Offer response (intent-key or semantic matching)
 */
export interface OfferResponse {
  /** Unique offer identifier */
  offer_id: string;

  /** Request that generated this offer */
  request_id: string;

  /** Impression identifier for tracking */
  impression_id: string;

  /** Campaign that won the auction */
  campaign_id: string;

  /** Creative content */
  creative: {
    title: string;
    body: string;
    cta: string;
  };

  /** Click URL for tracking */
  click_url: string;

  /** Direct landing URL (no tracking) */
  direct_url: string;

  /** Disclosure information */
  disclosure: {
    label: string;
    sponsor_name: string;
  };

  /**
   * Tracking token for manual impression/click tracking.
   * Only needed if you use direct_url instead of click_url.
   */
  tracking_token: string;

  /** Match metadata */
  match_info: {
    /** How was this matched: 'intent_key' | 'semantic' | 'hybrid' */
    match_method: 'intent_key' | 'semantic' | 'hybrid';

    /** For semantic matches: similarity score (0-1) */
    similarity?: number;

    /** Intent key that matched (may differ from request if hierarchical) */
    matched_intent_key?: string;
  };

  /**
   * Revenue share information (preview)
   * @experimental Not active yet
   */
  revenue_share?: {
    status: 'preview' | 'active';
    source_agent_id?: string;
    source_agent_pct?: number;
  };

  /** Time-to-live in milliseconds */
  ttl_ms: number;
}
