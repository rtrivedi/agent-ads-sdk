/**
 * Main SDK client for AttentionMarket Agent Ads API.
 * Provides public methods: decide(), decideRaw(), track(), getPolicy(), signupAgent()
 */

import { HTTPClient } from './http.js';
import { createImpressionEvent, createClickEvent } from './utils.js';
import type {
  SDKConfig,
  DecideRequest,
  DecideResponse,
  EventIngestRequest,
  EventIngestResponse,
  PolicyResponse,
  AgentSignupRequest,
  AgentSignupResponse,
  AdUnit,
} from './types.js';
import type { CreateImpressionEventParams, CreateClickEventParams } from './utils.js';

const DEFAULT_BASE_URL = 'https://api.attentionmarket.ai';
const DEFAULT_TIMEOUT_MS = 4000;
const DEFAULT_MAX_RETRIES = 2;

export class AttentionMarketClient {
  private http: HTTPClient;

  constructor(config: SDKConfig) {
    this.http = new HTTPClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
    });
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

    return await http.request<AgentSignupResponse>('POST', '/v1/agent/signup', {
      body: request,
    });
  }
}
