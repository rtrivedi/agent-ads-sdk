/**
 * Mock AttentionMarket Client for Testing
 *
 * Use this client during development to test your integration without real advertiser data.
 * Returns realistic mock ad units for common taxonomies.
 */

import type {
  DecideRequest,
  DecideResponse,
  AdUnit,
  EventIngestRequest,
  EventIngestResponse,
  PolicyResponse,
} from './types.js';
import { generateUUID, generateTimestamp } from './utils.js';

export interface MockClientConfig {
  /**
   * Simulate API latency (milliseconds)
   * @default 100
   */
  latencyMs?: number;

  /**
   * Fill rate (0.0 - 1.0) - probability of returning an ad
   * @default 1.0 (always fill)
   */
  fillRate?: number;

  /**
   * Log mock calls to console
   * @default true
   */
  verbose?: boolean;
}

/**
 * Mock client for testing SDK integration without real advertiser data
 *
 * @example
 * ```typescript
 * import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';
 *
 * const client = new MockAttentionMarketClient();
 * const unit = await client.decide({...});
 * ```
 */
export class MockAttentionMarketClient {
  private config: Required<MockClientConfig>;
  private mockUnits: Record<string, AdUnit>;

  constructor(config: MockClientConfig = {}) {
    this.config = {
      latencyMs: config.latencyMs ?? 100,
      fillRate: config.fillRate ?? 1.0,
      verbose: config.verbose ?? true,
    };

    // Seed data for common taxonomies
    this.mockUnits = {
      'local_services.movers.quote': {
        unit_id: 'unit_mock_movers_001',
        unit_type: 'sponsored_suggestion',
        disclosure: {
          label: 'Sponsored',
          explanation: 'This is a paid advertisement',
          sponsor_name: 'Brooklyn Premium Movers',
        },
        tracking: {
          token: 'trk_mock_movers_' + generateUUID().substring(0, 8),
          impression_url: 'https://mock.attentionmarket.com/imp/movers',
          click_url: 'https://mock.attentionmarket.com/click/movers',
        },
        suggestion: {
          title: 'Professional Moving Services - Same Day Available',
          body: 'Licensed & insured movers serving Brooklyn since 2015. Free on-site estimates, packing services, and storage options. Rated 4.9/5 stars.',
          cta: 'Get Free Quote →',
          action_url: 'https://demo-movers.example.com/quote?ref=am_mock',
        },
      },
      'local_services.restaurants.search': {
        unit_id: 'unit_mock_restaurant_001',
        unit_type: 'sponsored_suggestion',
        disclosure: {
          label: 'Sponsored',
          explanation: 'This is a paid advertisement',
          sponsor_name: "Tony's Italian Kitchen",
        },
        tracking: {
          token: 'trk_mock_restaurant_' + generateUUID().substring(0, 8),
          impression_url: 'https://mock.attentionmarket.com/imp/restaurant',
          click_url: 'https://mock.attentionmarket.com/click/restaurant',
        },
        suggestion: {
          title: "Tony's Italian Kitchen - Authentic NYC Italian",
          body: '⭐️ 4.8/5 stars • Midtown Manhattan • Reservations available tonight. Try our signature wood-fired pizza and homemade pasta.',
          cta: 'Reserve Table →',
          action_url: 'https://demo-restaurant.example.com/reserve?ref=am_mock',
        },
      },
      'local_services.plumbers.quote': {
        unit_id: 'unit_mock_plumber_001',
        unit_type: 'sponsored_suggestion',
        disclosure: {
          label: 'Sponsored',
          explanation: 'This is a paid advertisement',
          sponsor_name: '24/7 Emergency Plumbing',
        },
        tracking: {
          token: 'trk_mock_plumber_' + generateUUID().substring(0, 8),
          impression_url: 'https://mock.attentionmarket.com/imp/plumber',
          click_url: 'https://mock.attentionmarket.com/click/plumber',
        },
        suggestion: {
          title: 'Emergency Plumber - 30 Min Response Time',
          body: 'Licensed plumbers available 24/7 across NYC. Free estimates. No overtime charges. Same-day service guaranteed.',
          cta: 'Call Now →',
          action_url: 'tel:+1-555-PLUMBER',
        },
      },
      'local_services.electricians.quote': {
        unit_id: 'unit_mock_electrician_001',
        unit_type: 'sponsored_suggestion',
        disclosure: {
          label: 'Sponsored',
          explanation: 'This is a paid advertisement',
          sponsor_name: 'Spark Electric Co',
        },
        tracking: {
          token: 'trk_mock_electrician_' + generateUUID().substring(0, 8),
          impression_url: 'https://mock.attentionmarket.com/imp/electrician',
          click_url: 'https://mock.attentionmarket.com/click/electrician',
        },
        suggestion: {
          title: 'Licensed Electrician - Free Safety Inspection',
          body: 'Certified electricians for residential & commercial. Emergency service available. 10-year warranty on all work.',
          cta: 'Schedule Service →',
          action_url: 'https://demo-electrician.example.com/schedule?ref=am_mock',
        },
      },
      'local_services.cleaners.quote': {
        unit_id: 'unit_mock_cleaner_001',
        unit_type: 'sponsored_suggestion',
        disclosure: {
          label: 'Sponsored',
          explanation: 'This is a paid advertisement',
          sponsor_name: 'Sparkle Clean NYC',
        },
        tracking: {
          token: 'trk_mock_cleaner_' + generateUUID().substring(0, 8),
          impression_url: 'https://mock.attentionmarket.com/imp/cleaner',
          click_url: 'https://mock.attentionmarket.com/click/cleaner',
        },
        suggestion: {
          title: 'Professional Home Cleaning - $99 First Visit',
          body: 'Eco-friendly cleaning products. Background-checked staff. Satisfaction guaranteed or your money back.',
          cta: 'Book Cleaning →',
          action_url: 'https://demo-cleaners.example.com/book?ref=am_mock',
        },
      },
      'shopping.electronics.search': {
        unit_id: 'unit_mock_electronics_001',
        unit_type: 'sponsored_suggestion',
        disclosure: {
          label: 'Sponsored',
          explanation: 'This is a paid advertisement',
          sponsor_name: 'TechDeals Pro',
        },
        tracking: {
          token: 'trk_mock_electronics_' + generateUUID().substring(0, 8),
          impression_url: 'https://mock.attentionmarket.com/imp/electronics',
          click_url: 'https://mock.attentionmarket.com/click/electronics',
        },
        suggestion: {
          title: 'Latest Laptops & Electronics - Up to 40% Off',
          body: 'Free shipping on orders over $50. 30-day returns. Price match guarantee. Shop top brands.',
          cta: 'Shop Deals →',
          action_url: 'https://demo-electronics.example.com/deals?ref=am_mock',
        },
      },
    };
  }

  /**
   * Simulate network latency
   */
  private async simulateLatency(): Promise<void> {
    if (this.config.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.latencyMs));
    }
  }

  /**
   * Check if should fill based on fill rate
   */
  private shouldFill(): boolean {
    return Math.random() < this.config.fillRate;
  }

  /**
   * Log mock activity
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.verbose) {
      console.log(`🧪 [MockClient] ${message}`, ...args);
    }
  }

  /**
   * Request a sponsored unit (convenience method)
   */
  async decide(request: DecideRequest): Promise<AdUnit | null> {
    const response = await this.decideRaw(request);
    if (response.status === 'filled' && response.units.length > 0) {
      return response.units[0] || null;
    }
    return null;
  }

  /**
   * Request sponsored units (full response)
   */
  async decideRaw(request: DecideRequest): Promise<DecideResponse> {
    await this.simulateLatency();

    const taxonomy = request.opportunity.intent.taxonomy;
    this.log('decide()', {
      taxonomy,
      placement: request.placement.type,
    });

    // Check fill rate
    if (!this.shouldFill()) {
      this.log('No fill (simulated by fillRate)', { fillRate: this.config.fillRate });
      return {
        request_id: request.request_id,
        decision_id: 'dec_mock_' + generateUUID().substring(0, 8),
        status: 'no_fill',
        units: [],
        ttl_ms: 60000,
      };
    }

    // Get mock unit for taxonomy
    const unit = this.mockUnits[taxonomy];

    if (unit) {
      const title = unit.unit_type === 'sponsored_suggestion'
        ? unit.suggestion.title
        : unit.tool.tool_name;

      this.log('Returning mock ad', {
        sponsor: unit.disclosure.sponsor_name,
        title,
      });

      return {
        request_id: request.request_id,
        decision_id: 'dec_mock_' + generateUUID().substring(0, 8),
        status: 'filled',
        units: [unit],
        ttl_ms: 60000,
      };
    }

    this.log('No mock data for taxonomy', { taxonomy });
    return {
      request_id: request.request_id,
      decision_id: 'dec_mock_' + generateUUID().substring(0, 8),
      status: 'no_fill',
      units: [],
      ttl_ms: 60000,
    };
  }

  /**
   * Track an event
   */
  async track(event: EventIngestRequest): Promise<EventIngestResponse> {
    await this.simulateLatency();
    this.log('track()', { event_type: event.event_type, unit_id: event.unit_id });

    return {
      accepted: true,
    };
  }

  /**
   * Track impression (convenience method)
   */
  async trackImpression(params: {
    agent_id: string;
    request_id: string;
    decision_id: string;
    unit_id: string;
    tracking_token: string;
    occurred_at?: string;
    metadata?: Record<string, unknown>;
  }): Promise<EventIngestResponse> {
    const event: EventIngestRequest = {
      event_id: generateUUID(),
      occurred_at: params.occurred_at || generateTimestamp(),
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

    return this.track(event);
  }

  /**
   * Track click (convenience method)
   */
  async trackClick(params: {
    agent_id: string;
    request_id: string;
    decision_id: string;
    unit_id: string;
    tracking_token: string;
    href: string;
    occurred_at?: string;
  }): Promise<EventIngestResponse> {
    return this.track({
      event_id: generateUUID(),
      occurred_at: params.occurred_at || generateTimestamp(),
      agent_id: params.agent_id,
      request_id: params.request_id,
      decision_id: params.decision_id,
      unit_id: params.unit_id,
      event_type: 'click',
      tracking_token: params.tracking_token,
      metadata: {
        href: params.href,
      },
    });
  }

  /**
   * Get policy
   */
  async getPolicy(): Promise<PolicyResponse> {
    await this.simulateLatency();
    this.log('getPolicy()');

    return {
      version: '1.0.0',
      defaults: {
        max_units_per_response: 1,
        blocked_categories: [],
      },
      disclosure: {
        required: true,
        label: 'Sponsored',
        require_sponsor_name: true,
      },
      unit_rules: {},
    };
  }

  /**
   * Add custom mock ad unit for testing
   */
  addMockUnit(taxonomy: string, unit: AdUnit): void {
    this.mockUnits[taxonomy] = unit;
    this.log('Added custom mock unit', { taxonomy });
  }

  /**
   * Get list of available mock taxonomies
   */
  getAvailableTaxonomies(): string[] {
    return Object.keys(this.mockUnits);
  }
}
