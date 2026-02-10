/**
 * Main SDK client for AttentionMarket Agent Ads API.
 * Provides public methods: decide(), decideRaw(), track(), getPolicy(), signupAgent()
 */

import { HTTPClient } from './http.js';
import { createImpressionEvent, createClickEvent, generateUUID } from './utils.js';
import type {
  SDKConfig,
  DecideRequest,
  DecideFromContextRequest,
  DecideResponse,
  EventIngestRequest,
  EventIngestResponse,
  PolicyResponse,
  AgentSignupRequest,
  AgentSignupResponse,
  AdUnit,
  RequestOfferParams,
  RequestOfferFromContextParams,
  OfferResponse,
} from './types.js';
import type { CreateImpressionEventParams, CreateClickEventParams } from './utils.js';

// Default configuration (points to AttentionMarket production API)
// Developers can override with their own backend if self-hosting
const DEFAULT_BASE_URL = 'https://api.attentionmarket.ai/v1';
const DEFAULT_TIMEOUT_MS = 4000;
const DEFAULT_MAX_RETRIES = 2;

export class AttentionMarketClient {
  private http: HTTPClient;
  private agentId: string | undefined;
  private appId: string | undefined;

  constructor(config: SDKConfig) {
    this.agentId = config.agentId;
    this.appId = config.appId;
    // Validate configuration
    this.validateConfig(config);

    const httpConfig: {
      apiKey?: string;
      supabaseAnonKey?: string;
      baseUrl: string;
      timeoutMs: number;
      maxRetries: number;
    } = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
    };

    // Only add supabaseAnonKey if provided
    if (config.supabaseAnonKey !== undefined) {
      httpConfig.supabaseAnonKey = config.supabaseAnonKey;
    }

    this.http = new HTTPClient(httpConfig);
  }

  /**
   * Validate SDK configuration for security
   */
  private validateConfig(config: SDKConfig): void {
    // Validate base URL uses HTTPS
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    if (!baseUrl.startsWith('https://')) {
      throw new Error(
        'Security Error: baseUrl must use HTTPS. ' +
          'HTTP connections expose your API key to man-in-the-middle attacks. ' +
          `Received: ${baseUrl}`
      );
    }

    // Validate API key format (if provided)
    if (config.apiKey) {
      const apiKeyPattern = /^am_(live|test)_[a-zA-Z0-9]+$/;
      if (!apiKeyPattern.test(config.apiKey)) {
        console.warn(
          'Warning: API key does not match expected format (am_live_... or am_test_...). ' +
            'This may indicate an invalid or compromised key.'
        );
      }
    }
  }

  /**
   * Request a sponsored unit decision for an agent opportunity.
   * Returns the full DecideResponse including status, ttl_ms, and all units.
   */
  async decideRaw(
    request: DecideRequest,
    options?: { idempotencyKey?: string },
  ): Promise<DecideResponse> {
    const requestOptions: {
      body: DecideRequest;
      idempotencyKey?: string;
    } = { body: request };

    if (options?.idempotencyKey !== undefined) {
      requestOptions.idempotencyKey = options.idempotencyKey;
    }

    return await this.http.request<DecideResponse>('POST', '/v1/decide', requestOptions);
  }

  /**
   * Convenience wrapper around decideRaw().
   * Returns null if status is no_fill, otherwise returns the first ad unit.
   */
  async decide(
    request: DecideRequest,
    options?: { idempotencyKey?: string },
  ): Promise<AdUnit | null> {
    const response = await this.decideRaw(request, options);

    if (response.status === 'no_fill') {
      return null;
    }

    // Return first unit if available
    return response.units[0] ?? null;
  }

  /**
   * Simplified ad matching using conversation context and semantic search.
   * Automatically handles request construction, taxonomy fallback, and defaults.
   *
   * Returns AdResponse with convenient field access (creative, click_url, etc.)
   * plus tracking metadata for easy click tracking.
   *
   * Requires: agentId in SDKConfig constructor
   *
   * @example
   * const ad = await client.decideFromContext({
   *   userMessage: "My father passed away and I need help organizing his estate",
   *   placement: 'sponsored_suggestion'
   * });
   *
   * @throws {Error} If agentId was not provided in SDKConfig
   */
  async decideFromContext(
    params: DecideFromContextRequest,
    options?: { idempotencyKey?: string },
  ): Promise<import('./types.js').AdResponse | null> {
    // Validate agentId is available
    if (!this.agentId) {
      throw new Error(
        'decideFromContext() requires agentId to be set in SDKConfig. ' +
        'Either provide agentId in the constructor or use decide() directly.'
      );
    }

    // Limit conversation history to last 5 messages to avoid token overflow
    const historyLimit = 5;
    const history = params.conversationHistory || [];
    const limitedHistory = history.slice(-historyLimit);

    // Build context string from user message + limited history
    const contextParts = [...limitedHistory, params.userMessage];
    const context = contextParts.join('\n');

    // Use provided values or sensible defaults
    const country = params.country || 'US';
    const language = params.language || 'en';
    const platform = params.platform || 'web';
    const placementType = params.placement || 'sponsored_suggestion';

    // Build taxonomy from suggestedCategory or use fallback
    // Backend semantic matching doesn't strictly require valid taxonomy
    const taxonomy = params.suggestedCategory || 'unknown';

    // Build full DecideRequest with semantic context
    const request: DecideRequest = {
      request_id: generateUUID(),
      agent_id: this.agentId,
      placement: {
        type: placementType,
        surface: 'chat'
      },
      opportunity: {
        intent: {
          taxonomy,
          query: params.userMessage
        },
        context: {
          country,
          language,
          platform
        },
        constraints: {
          max_units: 1,
          allowed_unit_types: [placementType]
        },
        privacy: {
          data_policy: 'coarse_only'
        }
      },
      context,
      user_intent: params.userMessage
    };

    // Call decideRaw to get full response with metadata
    const response = await this.decideRaw(request, options);

    if (response.status === 'no_fill' || response.units.length === 0) {
      return null;
    }

    // Get first ad unit
    const adUnit = response.units[0];

    // Only support sponsored_suggestion for now (most common use case)
    if (!adUnit || adUnit.unit_type !== 'sponsored_suggestion') {
      return null;
    }

    // TypeScript now knows adUnit is of type sponsored_suggestion
    // Construct AdResponse with convenient field access
    const adResponse: import('./types.js').AdResponse = {
      request_id: response.request_id,
      decision_id: response.decision_id,
      creative: {
        title: adUnit.suggestion.title,
        body: adUnit.suggestion.body,
        cta: adUnit.suggestion.cta,
      },
      click_url: adUnit.suggestion.action_url,
      ...(adUnit.suggestion.tracking_url && { tracking_url: adUnit.suggestion.tracking_url }),
      tracking_token: adUnit.tracking.token,
      disclosure: adUnit.disclosure,
      _ad: adUnit,
    };

    return adResponse;
  }

  /**
   * Report an event (impression, click, action, conversion, feedback).
   */
  async track(event: EventIngestRequest): Promise<EventIngestResponse> {
    return await this.http.request<EventIngestResponse>('POST', '/v1/event', {
      body: event,
    });
  }

  /**
   * Convenience method to track an impression event.
   * Creates an impression event using createImpressionEvent() and calls track().
   */
  async trackImpression(
    params: Omit<CreateImpressionEventParams, 'occurred_at'> & { occurred_at?: string },
  ): Promise<EventIngestResponse> {
    const event = createImpressionEvent(params);
    return await this.track(event);
  }

  /**
   * Convenience method to track a click event.
   * Creates a click event using createClickEvent() and calls track().
   */
  async trackClick(
    params: Omit<CreateClickEventParams, 'occurred_at'> & { occurred_at?: string },
  ): Promise<EventIngestResponse> {
    const event = createClickEvent(params);
    return await this.track(event);
  }

  /**
   * Ultra-simple method to track a click from an ad returned by decideFromContext().
   * Automatically extracts all required fields from the ad object.
   *
   * @param ad - The ad object returned by decideFromContext()
   * @param options - Just click_context (what you showed the user)
   *
   * @example
   * ```typescript
   * const ad = await client.decideFromContext({ userMessage: "I need car insurance" });
   * if (ad) {
   *   await client.trackClickFromAd(ad, {
   *     click_context: "Progressive: Get 20% off - Compare quotes"
   *   });
   * }
   * ```
   */
  async trackClickFromAd(
    ad: import('./types.js').AdResponse,
    options: {
      click_context: string;
      metadata?: Record<string, unknown>;
      occurred_at?: string;
    },
  ): Promise<EventIngestResponse> {
    if (!this.agentId) {
      throw new Error('agentId is required for trackClickFromAd(). Set it in the constructor.');
    }

    const trackParams: any = {
      agent_id: this.agentId,
      request_id: ad.request_id,
      decision_id: ad.decision_id,
      unit_id: ad._ad.unit_id,
      tracking_token: ad.tracking_token,
      href: ad.click_url,
      click_context: options.click_context,
    };

    // Only add optional fields if they're provided
    if (options.metadata) {
      trackParams.metadata = options.metadata;
    }
    if (options.occurred_at) {
      trackParams.occurred_at = options.occurred_at;
    }

    return await this.trackClick(trackParams);
  }

  /**
   * Fetch default policy constraints and formatting requirements.
   */
  async getPolicy(): Promise<PolicyResponse> {
    return await this.http.request<PolicyResponse>('GET', '/v1/policy');
  }

  /**
   * Create or register an agent (optional helper).
   * Note: This endpoint is unauthenticated in v1.
   */
  static async signupAgent(
    request: AgentSignupRequest,
    options?: { baseUrl?: string },
  ): Promise<AgentSignupResponse> {
    // Create temporary HTTP client without authentication
    const http = new HTTPClient({
      baseUrl: options?.baseUrl ?? DEFAULT_BASE_URL,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      maxRetries: DEFAULT_MAX_RETRIES,
    });

    return await http.request<AgentSignupResponse>('POST', '/v1/agent-signup', {
      body: request,
    });
  }

  // ============================================================================
  // Intenture Network APIs (Intent-Key Based Matching)
  // ============================================================================

  /**
   * Validate intent-key format.
   * Format: vertical.category[.subcategory][.intent]
   * Examples: "coffee", "coffee.purchase", "legal.estate_planning.wills"
   */
  private validateIntentKey(intentKey: string): void {
    if (!intentKey || intentKey.trim().length === 0) {
      throw new Error('intentKey cannot be empty');
    }

    // Intent keys should be lowercase alphanumeric with dots and underscores
    const validPattern = /^[a-z0-9_]+(\.[a-z0-9_]+)*$/;
    if (!validPattern.test(intentKey)) {
      throw new Error(
        `Invalid intentKey format: "${intentKey}". ` +
        'Use lowercase letters, numbers, underscores, and dots only. ' +
        'Example: "coffee.purchase.delivery"'
      );
    }

    // Should have at least one segment
    const segments = intentKey.split('.');
    if (segments.length === 0) {
      throw new Error('intentKey must have at least one segment');
    }
  }

  /**
   * Validate placement ID is not empty
   */
  private validatePlacementId(placementId: string): void {
    if (!placementId || placementId.trim().length === 0) {
      throw new Error('placementId cannot be empty');
    }
  }

  /**
   * Validate revenue share percentage (0-50)
   */
  private validateRevenueShare(pct?: number): void {
    if (pct !== undefined) {
      if (typeof pct !== 'number' || isNaN(pct)) {
        throw new Error('revenueSharePct must be a number');
      }
      if (pct < 0 || pct > 50) {
        throw new Error(
          `revenueSharePct must be between 0 and 50, got ${pct}. ` +
          'Revenue share above 50% is not supported.'
        );
      }
    }
  }

  /**
   * Normalize and validate locale string
   */
  private normalizeLocale(locale?: string): string {
    if (!locale || locale.trim().length === 0) {
      return 'en';
    }

    const normalized = locale.trim();
    const languageCode = normalized.split('-')[0]?.toLowerCase();

    if (!languageCode || languageCode.length < 2) {
      return 'en';
    }

    return languageCode;
  }

  /**
   * Request an offer using explicit intent-key matching.
   *
   * Use this API when you have HIGH CONFIDENCE about user intent.
   * Intent-keys enable deterministic matching and agent-to-agent coordination.
   *
   * **Current Limitations:**
   * - Backend uses semantic matching (intentKey mapped to taxonomy field)
   * - `campaign_id` not yet available from backend (returns `unit_id` as placeholder)
   * - `click_url` equals `direct_url` (click redirector not implemented)
   * - Revenue share tracked but payouts not active (preview mode)
   *
   * @example
   * ```typescript
   * // User explicitly said "order coffee for delivery"
   * const offer = await client.requestOffer({
   *   placementId: 'order_card',
   *   intentKey: 'coffee.purchase.delivery',
   *   context: { geo: { city: 'SF', country: 'US' } }
   * });
   *
   * if (offer) {
   *   // Use tracked click URL for attribution
   *   window.open(offer.click_url);
   * }
   * ```
   *
   * @throws {Error} If agentId or appId not provided in SDKConfig
   * @throws {Error} If intentKey format is invalid
   * @throws {Error} If revenueSharePct out of range (0-50)
   */
  async requestOffer(
    params: RequestOfferParams,
    options?: { idempotencyKey?: string },
  ): Promise<OfferResponse | null> {
    // Validate required config
    if (!this.agentId) {
      throw new Error(
        'requestOffer() requires agentId in SDKConfig. ' +
        'Provide agentId in constructor: new AttentionMarketClient({ agentId: "agt_123", ... })'
      );
    }

    if (!this.appId) {
      throw new Error(
        'requestOffer() requires appId in SDKConfig. ' +
        'Provide appId in constructor: new AttentionMarketClient({ appId: "app_456", ... })'
      );
    }

    // Validate input parameters
    this.validateIntentKey(params.intentKey);
    this.validatePlacementId(params.placementId);
    this.validateRevenueShare(params.revenueSharePct);

    // Build context string for semantic fallback (if provided)
    const semanticContext = params.context?.semanticContext;

    // Extract and normalize geo/locale
    const country = params.context?.geo?.country || 'US';
    const language = this.normalizeLocale(params.context?.locale);

    // Log warning if revenue share requested (preview feature)
    if (params.sourceAgentId && console.warn) {
      console.warn(
        'Revenue share is in PREVIEW mode. ' +
        'sourceAgentId and revenueSharePct are logged for analytics but payouts are not active yet. ' +
        'Expected: Q2 2026'
      );
    }

    // Generate idempotency key if not provided (ensures retry safety)
    const idempotencyKey = options?.idempotencyKey || generateUUID();

    // Build DecideRequest with intent-key targeting
    // NOTE: Backend currently uses semantic matching; intentKey mapped to taxonomy field
    // TODO: Add dedicated intent_key field when backend supports intent-key matching
    const request: DecideRequest = {
      request_id: idempotencyKey,
      agent_id: this.agentId,
      placement: {
        type: 'sponsored_suggestion',  // Default placement type
        surface: params.placementId
      },
      opportunity: {
        intent: {
          taxonomy: params.intentKey,  // TEMPORARY: Maps to taxonomy until intent_key field added
          query: semanticContext || params.intentKey
        },
        context: {
          country,
          language,
          platform: 'web' as const,
          ...(params.context?.geo?.region ? { region: params.context.geo.region } : {}),
          ...(params.context?.geo?.city ? { city: params.context.geo.city } : {})
        },
        constraints: {
          max_units: 1,
          allowed_unit_types: ['sponsored_suggestion']
        },
        privacy: {
          data_policy: 'coarse_only'
        }
      },
      // Add semantic context if provided (for fallback matching)
      ...(semanticContext ? { context: semanticContext } : {}),
      user_intent: params.intentKey
    };

    // Call existing decide endpoint with idempotency key
    const response = await this.decideRaw(request, { idempotencyKey });

    // No fill
    if (response.status === 'no_fill' || response.units.length === 0) {
      return null;
    }

    // Convert AdUnit to OfferResponse
    const adUnit = response.units[0];

    // Only support sponsored_suggestion for now
    if (!adUnit || adUnit.unit_type !== 'sponsored_suggestion') {
      return null;
    }

    // Generate client-side impression_id (server doesn't provide one yet)
    const impressionId = generateUUID();

    // Determine actual match method used by backend
    const matchMethod = semanticContext ? 'hybrid' : 'semantic';

    return {
      offer_id: adUnit.unit_id,
      request_id: response.request_id,
      impression_id: impressionId,
      // LIMITATION: Backend doesn't return campaign_id yet - use unit_id as placeholder
      campaign_id: adUnit.unit_id,
      creative: {
        title: adUnit.suggestion.title,
        body: adUnit.suggestion.body,
        cta: adUnit.suggestion.cta
      },
      // LIMITATION: Click redirector not implemented yet
      // Both URLs are identical until /c/{token} endpoint is deployed
      click_url: adUnit.suggestion.action_url,
      direct_url: adUnit.suggestion.action_url,
      disclosure: {
        label: adUnit.disclosure.label,
        sponsor_name: adUnit.disclosure.sponsor_name
      },
      tracking_token: adUnit.tracking.token,
      match_info: {
        match_method: matchMethod,  // Accurately reports semantic or hybrid
        matched_intent_key: params.intentKey
      },
      // Revenue share: Logged for analytics but payouts not active
      ...(params.sourceAgentId ? {
        revenue_share: {
          status: 'preview' as const,
          source_agent_id: params.sourceAgentId,
          ...(params.revenueSharePct !== undefined ? { source_agent_pct: params.revenueSharePct } : {})
        }
      } : {}),
      ttl_ms: response.ttl_ms
    };
  }

  /**
   * Request an offer using semantic context matching.
   *
   * This is the fuzzy, discovery API for when you're NOT certain what
   * the user wants. Pass conversation context and let semantic search
   * figure out the best match.
   *
   * **Current Limitations:**
   * - `campaign_id` not yet available from backend (returns `unit_id` as placeholder)
   * - `click_url` equals `direct_url` (click redirector not implemented)
   * - Revenue share tracked but payouts not active (preview mode)
   * - Conversation history auto-limited to last 5 messages
   *
   * @example
   * ```typescript
   * const offer = await client.requestOfferFromContext({
   *   placementId: 'chat_suggestion',
   *   userMessage: "I'm so tired, long day at work...",
   *   conversationHistory: ["How was your day?", "Exhausting"],
   *   context: { geo: { city: 'NYC' } }
   * });
   *
   * if (offer) {
   *   console.log(`Maybe you'd like: ${offer.creative.title}`);
   * }
   * ```
   *
   * @throws {Error} If agentId was not provided in SDKConfig
   * @throws {Error} If revenueSharePct out of range (0-50)
   */
  async requestOfferFromContext(
    params: RequestOfferFromContextParams,
    options?: { idempotencyKey?: string },
  ): Promise<OfferResponse | null> {
    // Validate required config
    if (!this.agentId) {
      throw new Error(
        'requestOfferFromContext() requires agentId in SDKConfig. ' +
        'Provide agentId in constructor: new AttentionMarketClient({ agentId: "agt_123", ... })'
      );
    }

    if (!this.appId) {
      throw new Error(
        'requestOfferFromContext() requires appId in SDKConfig. ' +
        'Provide appId in constructor: new AttentionMarketClient({ appId: "app_456", ... })'
      );
    }

    // Validate input parameters
    this.validatePlacementId(params.placementId);
    this.validateRevenueShare(params.revenueSharePct);

    // Log warning if revenue share requested (preview feature)
    if (params.sourceAgentId && console.warn) {
      console.warn(
        'Revenue share is in PREVIEW mode. ' +
        'sourceAgentId and revenueSharePct are logged for analytics but payouts are not active yet. ' +
        'Expected: Q2 2026'
      );
    }

    // Limit conversation history to last 5 messages
    const historyLimit = 5;
    const history = params.conversationHistory || [];
    const limitedHistory = history.slice(-historyLimit);

    // Build context string from user message + limited history
    const contextParts = [...limitedHistory, params.userMessage];
    const context = contextParts.join('\n');

    // Use provided values or sensible defaults
    const country = params.context?.geo?.country || 'US';
    const language = this.normalizeLocale(params.context?.locale);
    const taxonomy = params.suggestedCategory || 'unknown';

    // Generate idempotency key if not provided (ensures retry safety)
    const idempotencyKey = options?.idempotencyKey || generateUUID();

    // Build full DecideRequest with semantic context
    const request: DecideRequest = {
      request_id: idempotencyKey,
      agent_id: this.agentId,
      placement: {
        type: 'sponsored_suggestion',
        surface: params.placementId
      },
      opportunity: {
        intent: {
          taxonomy,
          query: params.userMessage
        },
        context: {
          country,
          language,
          platform: 'web' as const,
          ...(params.context?.geo?.region ? { region: params.context.geo.region } : {}),
          ...(params.context?.geo?.city ? { city: params.context.geo.city } : {})
        },
        constraints: {
          max_units: 1,
          allowed_unit_types: ['sponsored_suggestion']
        },
        privacy: {
          data_policy: 'coarse_only'
        }
      },
      ...(context ? { context } : {}),
      user_intent: params.userMessage
    };

    // Call existing decide endpoint with idempotency key
    const response = await this.decideRaw(request, { idempotencyKey });

    // No fill
    if (response.status === 'no_fill' || response.units.length === 0) {
      return null;
    }

    // Convert AdUnit to OfferResponse
    const adUnit = response.units[0];

    // Only support sponsored_suggestion for now
    if (!adUnit || adUnit.unit_type !== 'sponsored_suggestion') {
      return null;
    }

    // Generate client-side impression_id (server doesn't provide one yet)
    const impressionId = generateUUID();

    // Extract similarity score if available
    const similarity = adUnit._score?.relevance;

    return {
      offer_id: adUnit.unit_id,
      request_id: response.request_id,
      impression_id: impressionId,
      // LIMITATION: Backend doesn't return campaign_id yet - use unit_id as placeholder
      campaign_id: adUnit.unit_id,
      creative: {
        title: adUnit.suggestion.title,
        body: adUnit.suggestion.body,
        cta: adUnit.suggestion.cta
      },
      // LIMITATION: Click redirector not implemented yet
      // Both URLs are identical until /c/{token} endpoint is deployed
      click_url: adUnit.suggestion.action_url,
      direct_url: adUnit.suggestion.action_url,
      disclosure: {
        label: adUnit.disclosure.label,
        sponsor_name: adUnit.disclosure.sponsor_name
      },
      tracking_token: adUnit.tracking.token,
      match_info: {
        match_method: 'semantic',  // Always semantic for this API
        ...(similarity !== undefined ? { similarity } : {})
      },
      // Revenue share: Logged for analytics but payouts not active
      ...(params.sourceAgentId ? {
        revenue_share: {
          status: 'preview' as const,
          source_agent_id: params.sourceAgentId,
          ...(params.revenueSharePct !== undefined ? { source_agent_pct: params.revenueSharePct } : {})
        }
      } : {}),
      ttl_ms: response.ttl_ms
    };
  }
}
