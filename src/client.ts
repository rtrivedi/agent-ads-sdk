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
  ServiceResultRequest,
  ServiceResultResponse,
  GetServiceRequest,
  ServiceResponse,
  GetCategoriesParams,
  CategoryTaxonomyResponse,
} from './types.js';
import type { CreateImpressionEventParams, CreateClickEventParams } from './utils.js';

// Default configuration (points to AttentionMarket production API)
// Developers can override with their own backend if self-hosting
const DEFAULT_BASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1';
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
   * Infer taxonomy from user message using keyword matching
   * Returns best-guess taxonomy based on common patterns
   */
  private inferTaxonomy(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    // E-commerce / Business
    if (msg.match(/\b(ecommerce|e-commerce|online store|shopify|sell products?|product brand)\b/)) {
      return 'business.ecommerce.platform.trial';
    }
    if (msg.match(/\b(start.*business|launch.*business|business formation|llc|incorporate)\b/)) {
      return 'business.ecommerce.platform.trial'; // Many new businesses need e-commerce
    }

    // Insurance
    if (msg.match(/\b(car insurance|auto insurance|vehicle insurance)\b/)) {
      return 'insurance.auto.full_coverage.quote';
    }
    if (msg.match(/\b(health insurance|medical insurance)\b/)) {
      return 'insurance.health.individual.quote';
    }
    if (msg.match(/\b(life insurance)\b/)) {
      return 'insurance.life.term.quote';
    }
    if (msg.match(/\b(insurance)\b/)) {
      return 'insurance.auto.full_coverage.quote'; // Default to auto
    }

    // Finance
    if (msg.match(/\b(personal loan|debt consolidation|borrow money)\b/)) {
      return 'finance.loans.personal.apply';
    }
    if (msg.match(/\b(credit card)\b/)) {
      return 'finance.credit_cards.rewards.apply';
    }

    // Home Services
    if (msg.match(/\b(mover?s?|moving|relocat(e|ing))\b/)) {
      return 'home_services.moving.local.quote';
    }
    if (msg.match(/\b(plumber|plumbing|leak|pipe)\b/)) {
      return 'home_services.plumbing.emergency.quote';
    }
    if (msg.match(/\b(electrician|electrical|wiring)\b/)) {
      return 'home_services.electrical.repair.quote';
    }
    if (msg.match(/\b(clean(ing|er)|maid service)\b/)) {
      return 'home_services.cleaning.regular.book';
    }

    // Travel
    if (msg.match(/\b(hotel|lodging|accommodation)\b/)) {
      return 'travel.hotels.luxury.book';
    }
    if (msg.match(/\b(flight|plane ticket|airfare)\b/)) {
      return 'travel.flights.domestic.book';
    }

    // Legal
    if (msg.match(/\b(lawyer|attorney|legal help)\b/)) {
      return 'legal.general.consultation';
    }

    // Default fallback for business-related queries
    return 'business.ecommerce.platform.trial';
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
      const apiKeyPattern = /^am_(live|test)_[a-zA-Z0-9_]+$/;
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

    return await this.http.request<DecideResponse>('POST', '/decide', requestOptions);
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

    // Build taxonomy from suggestedCategory or infer from user message
    const taxonomy = params.suggestedCategory || this.inferTaxonomy(params.userMessage);

    // Validate Phase 1 parameters (Quality & Brand Safety)
    if (params.minQualityScore !== undefined) {
      if (typeof params.minQualityScore !== 'number' || params.minQualityScore < 0 || params.minQualityScore > 1) {
        throw new Error('minQualityScore must be a number between 0.0 and 1.0');
      }
    }

    if (params.allowedCategories !== undefined) {
      if (!Array.isArray(params.allowedCategories)) {
        throw new Error('allowedCategories must be an array');
      }
      if (params.allowedCategories.length === 0) {
        throw new Error('allowedCategories cannot be empty (would block all ads). Use blockedCategories to exclude specific categories, or omit to allow all.');
      }
      // Validate each category is string or number
      for (const cat of params.allowedCategories) {
        if (typeof cat !== 'string' && typeof cat !== 'number') {
          throw new Error(`allowedCategories must contain strings or numbers, found: ${typeof cat}`);
        }
      }
    }

    if (params.blockedCategories !== undefined) {
      if (!Array.isArray(params.blockedCategories)) {
        throw new Error('blockedCategories must be an array');
      }
      // Validate each category is string or number
      for (const cat of params.blockedCategories) {
        if (typeof cat !== 'string' && typeof cat !== 'number') {
          throw new Error(`blockedCategories must contain strings or numbers, found: ${typeof cat}`);
        }
      }
      // Warn if both allowed and blocked are set (allowed takes precedence)
      if (params.allowedCategories && params.allowedCategories.length > 0) {
        console.warn('[AttentionMarket] Both allowedCategories and blockedCategories specified. blockedCategories will be ignored.');
      }
    }

    if (params.blockedAdvertisers !== undefined) {
      if (!Array.isArray(params.blockedAdvertisers)) {
        throw new Error('blockedAdvertisers must be an array');
      }
      // Validate each advertiser ID is a string (UUIDs are strings)
      for (const id of params.blockedAdvertisers) {
        if (typeof id !== 'string' || id.trim().length === 0) {
          throw new Error('blockedAdvertisers must contain non-empty strings (advertiser IDs)');
        }
      }
    }

    // Validate Phase 2 parameters (Revenue Optimization)
    if (params.minCPC !== undefined) {
      if (typeof params.minCPC !== 'number' || params.minCPC < 0) {
        throw new Error('minCPC must be a non-negative number (cost-per-click in cents)');
      }
    }

    if (params.minRelevanceScore !== undefined) {
      if (typeof params.minRelevanceScore !== 'number' || params.minRelevanceScore < 0 || params.minRelevanceScore > 1) {
        throw new Error('minRelevanceScore must be a number between 0.0 and 1.0');
      }
    }

    if (params.optimizeFor && params.optimizeFor !== 'revenue' && params.optimizeFor !== 'relevance') {
      throw new Error('optimizeFor must be either "revenue" or "relevance"');
    }

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
      user_intent: params.userMessage,
      // Developer controls (Phase 1: Quality & Brand Safety)
      ...(params.minQualityScore !== undefined && { minQualityScore: params.minQualityScore }),
      ...(params.allowedCategories && { allowedCategories: params.allowedCategories }),
      ...(params.blockedCategories && { blockedCategories: params.blockedCategories }),
      ...(params.blockedAdvertisers && { blockedAdvertisers: params.blockedAdvertisers }),
      // Developer controls (Phase 2: Revenue Optimization)
      ...(params.minCPC !== undefined && { minCPC: params.minCPC }),
      ...(params.minRelevanceScore !== undefined && { minRelevanceScore: params.minRelevanceScore }),
      ...(params.optimizeFor && { optimizeFor: params.optimizeFor }),
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

    // CRITICAL: Auto-track impression (required for revenue as of v0.9.0)
    // Clicks without prior impressions will redirect but NOT earn revenue
    try {
      await this.track({
        event_id: `evt_${generateUUID()}`,
        event_type: 'impression',
        occurred_at: new Date().toISOString(),
        agent_id: this.agentId,
        unit_id: adUnit.unit_id,
        tracking_token: adUnit.tracking.token,
      } as EventIngestRequest);
    } catch (error) {
      // Log but don't fail the request if impression tracking fails
      console.warn('[AttentionMarket] Failed to auto-track impression:', error);
    }

    // TypeScript now knows adUnit is of type sponsored_suggestion
    // Construct AdResponse with convenient field access and new advertising exchange fields
    const adResponse: import('./types.js').AdResponse = {
      request_id: response.request_id,
      decision_id: response.decision_id,

      // NEW: Advertising exchange fields (v0.8.0+)
      advertiser_id: (adUnit as any).advertiser_id || 'unknown',
      ad_type: (adUnit as any).ad_type || 'link', // Default to 'link' for backward compatibility
      payout: (adUnit as any).payout || 0,

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

      // NEW: Recommendation ad fields (if applicable)
      ...((adUnit as any).suggestion?.teaser && { teaser: (adUnit as any).suggestion.teaser }),
      ...((adUnit as any).suggestion?.promo_code && { promo_code: (adUnit as any).suggestion.promo_code }),
      ...((adUnit as any).suggestion?.message && { message: (adUnit as any).suggestion.message }),

      // NEW: Service ad fields (if applicable)
      ...((adUnit as any).transaction_id && { transaction_id: (adUnit as any).transaction_id }),
      ...((adUnit as any).suggestion?.service_endpoint && { service_endpoint: (adUnit as any).suggestion.service_endpoint }),
      ...((adUnit as any).suggestion?.service_auth && { service_auth: (adUnit as any).suggestion.service_auth }),
      ...((adUnit as any).suggestion?.service_description && { service_description: (adUnit as any).suggestion.service_description }),
    };

    return adResponse;
  }

  /**
   * Report an event (impression, click, action, conversion, feedback).
   */
  async track(event: EventIngestRequest): Promise<EventIngestResponse> {
    return await this.http.request<EventIngestResponse>('POST', '/event', {
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
   * Send feedback on an ad's performance to earn conversion-validated bonuses.
   *
   * **How it works:**
   * - Send your prediction (positive/neutral/negative)
   * - After 7 days, system checks if user actually converted
   * - Correct positive prediction → +15% bonus
   * - Wrong positive prediction → -5% penalty
   * - Neutral/negative → no bonus/penalty (data only)
   *
   * **Anti-fraud:** Only accurate predictions earn money, spamming loses money.
   *
   * @param request - Feedback details (tracking_token, reaction, optional context)
   * @returns Promise with potential bonus amount and resolution date
   *
   * @example
   * ```typescript
   * const ad = await client.decideFromContext({ userMessage: "I need car insurance" });
   * if (ad) {
   *   // Show ad to user...
   *   // User clicks and seems interested
   *
   *   await client.sendFeedback({
   *     tracking_token: ad.tracking_token,
   *     reaction: 'positive',
   *     context: 'User asked follow-up questions about the product'
   *   });
   *   // Bonus resolved in 7 days based on actual conversion
   * }
   * ```
   */
  async sendFeedback(request: import('./types.js').FeedbackRequest): Promise<import('./types.js').FeedbackResponse> {
    return await this.http.request<import('./types.js').FeedbackResponse>('POST', '/feedback', { body: request });
  }

  /**
   * Fetch default policy constraints and formatting requirements.
   */
  async getPolicy(): Promise<PolicyResponse> {
    return await this.http.request<PolicyResponse>('GET', '/policy');
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

    return await http.request<AgentSignupResponse>('POST', '/agent-signup', {
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

  // ============================================================================
  // Advertising Exchange APIs (v0.8.0+)
  // ============================================================================

  /**
   * Request an agent-to-agent service for a specific task.
   *
   * This API returns service endpoint details for tasks that another agent
   * can perform (e.g., legal document drafting, data analysis, image generation).
   *
   * **Pay-per-completion billing:**
   * You earn money when the service completes successfully. Call `logServiceResult()`
   * after the service finishes to trigger payment.
   *
   * @example
   * ```typescript
   * // User needs a legal document drafted
   * const service = await client.getService({
   *   taskDescription: "Draft a non-disclosure agreement for a software contractor",
   *   geo: { country: 'US', region: 'CA' }
   * });
   *
   * if (service) {
   *   // Call the service endpoint
   *   const response = await fetch(service.service_endpoint, {
   *     method: 'POST',
   *     headers: {
   *       'Authorization': `Bearer ${service.service_auth}`,
   *       'Content-Type': 'application/json',
   *     },
   *     body: JSON.stringify({
   *       task: "Draft NDA",
   *       details: { ... }
   *     })
   *   });
   *
   *   const result = await response.json();
   *
   *   // Log completion (triggers payment if successful)
   *   await client.logServiceResult({
   *     transaction_id: service.transaction_id,
   *     success: response.ok,
   *     metadata: { result_summary: result }
   *   });
   * }
   * ```
   */
  async getService(
    params: GetServiceRequest
  ): Promise<ServiceResponse | null> {
    // Validate agentId is available
    if (!this.agentId) {
      throw new Error(
        'getService() requires agentId to be set in SDKConfig. ' +
        'Either provide agentId in the constructor or use decide() directly.'
      );
    }

    // Build DecideRequest for service ads
    const request: DecideRequest = {
      request_id: generateUUID(),
      agent_id: this.agentId,
      placement: {
        type: 'sponsored_suggestion',
        surface: 'service_request'
      },
      opportunity: {
        intent: {
          taxonomy: 'services.agent_to_agent',
          query: params.taskDescription
        },
        context: {
          country: params.geo?.country || 'US',
          language: 'en',
          platform: 'web' as const,
          ...(params.geo?.region && { region: params.geo.region }),
          ...(params.geo?.city && { city: params.geo.city }),
        },
        constraints: {
          max_units: 1,
          allowed_unit_types: ['sponsored_suggestion']
        },
        privacy: {
          data_policy: 'coarse_only'
        }
      },
      context: params.context || params.taskDescription,
      user_intent: params.taskDescription
    };

    // Call decide endpoint
    const response = await this.decideRaw(request);

    if (response.status === 'no_fill' || response.units.length === 0) {
      return null;
    }

    const adUnit = response.units[0] as any;

    // Only return if it's a service ad
    if (adUnit.ad_type !== 'service') {
      return null;
    }

    return {
      transaction_id: adUnit.transaction_id,
      service_endpoint: adUnit.suggestion?.service_endpoint || '',
      service_auth: adUnit.suggestion?.service_auth || '',
      service_description: adUnit.suggestion?.service_description || adUnit.suggestion.body,
      payout: adUnit.payout || 0,
      advertiser_id: adUnit.advertiser_id,
      disclosure: {
        label: adUnit.disclosure.label,
        sponsor_name: adUnit.disclosure.sponsor_name,
      },
    };
  }

  /**
   * Log the result of an agent-to-agent service completion.
   *
   * This triggers payment if the service completed successfully.
   * Part of the pay-per-completion billing model.
   *
   * @example
   * ```typescript
   * // After calling the service endpoint
   * const result = await client.logServiceResult({
   *   transaction_id: service.transaction_id,
   *   success: true,
   *   metadata: {
   *     execution_time_ms: 1500,
   *     result_summary: "NDA drafted successfully"
   *   }
   * });
   *
   * if (result.payment_triggered) {
   *   console.log(`Earned $${result.payment_amount}!`);
   * }
   * ```
   */
  async logServiceResult(
    params: ServiceResultRequest
  ): Promise<ServiceResultResponse> {
    return await this.http.request<ServiceResultResponse>(
      'POST',
      '/service-result',
      { body: params }
    );
  }

  /**
   * Get IAB Content Taxonomy categories.
   *
   * Returns the complete IAB Content Taxonomy 3.0 (704 categories across 38 top-level categories).
   * Supports filtering by tier level, parent category, or search term.
   *
   * Use this to discover available categories for `allowedCategories` and `blockedCategories` parameters.
   *
   * @param params - Optional filters (tier, parent_id, search)
   * @returns The IAB Content Taxonomy with categories
   *
   * @example Get all Tier 1 categories (38 top-level categories)
   * ```typescript
   * const tier1 = await client.getCategories({ tier: 1 });
   * console.log(`${tier1.total} top-level categories`);
   * tier1.categories.forEach(cat => console.log(`${cat.id}: ${cat.name}`));
   * ```
   *
   * @example Get all subcategories of "Automotive" (ID: 1)
   * ```typescript
   * const automotiveCategories = await client.getCategories({ parent_id: 1 });
   * console.log(`Found ${automotiveCategories.total} automotive subcategories`);
   * ```
   *
   * @example Search for insurance-related categories
   * ```typescript
   * const insuranceCategories = await client.getCategories({ search: 'insurance' });
   * insuranceCategories.categories.forEach(cat => {
   *   console.log(`${cat.id}: ${cat.full_path}`);
   * });
   * ```
   */
  async getCategories(
    params?: GetCategoriesParams
  ): Promise<CategoryTaxonomyResponse> {
    const queryParams = new URLSearchParams();

    if (params?.tier) {
      queryParams.append('tier', params.tier.toString());
    }
    if (params?.parent_id) {
      queryParams.append('parent_id', params.parent_id.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const url = `/categories${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    return await this.http.request<CategoryTaxonomyResponse>(
      'GET',
      url
    );
  }
}
