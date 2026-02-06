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

  constructor(config: SDKConfig) {
    this.agentId = config.agentId;
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
  ): Promise<AdUnit | null> {
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

    return await this.decide(request, options);
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
}
