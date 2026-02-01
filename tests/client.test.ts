/**
 * Tests for AttentionMarket SDK.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  AttentionMarketClient,
  generateUUID,
  createOpportunity,
  createImpressionEvent,
  createClickEvent,
} from '../src/index.js';

describe('AttentionMarketClient', () => {
  it('should create a client instance', () => {
    const client = new AttentionMarketClient({
      apiKey: 'am_test_validkey123',
    });
    expect(client).toBeInstanceOf(AttentionMarketClient);
  });

  it('should create a client with custom config', () => {
    const client = new AttentionMarketClient({
      apiKey: 'am_live_validkey456',
      baseUrl: 'https://custom.api.url',
      timeoutMs: 5000,
      maxRetries: 3,
    });
    expect(client).toBeInstanceOf(AttentionMarketClient);
  });

  describe('Security Validation', () => {
    it('should reject HTTP baseUrl', () => {
      expect(() => {
        new AttentionMarketClient({
          apiKey: 'am_test_key',
          baseUrl: 'http://insecure.api.url',
        });
      }).toThrow(/Security Error.*HTTPS/);
    });

    it('should accept HTTPS baseUrl', () => {
      expect(() => {
        new AttentionMarketClient({
          apiKey: 'am_test_key',
          baseUrl: 'https://secure.api.url',
        });
      }).not.toThrow();
    });

    it('should accept default HTTPS baseUrl', () => {
      expect(() => {
        new AttentionMarketClient({
          apiKey: 'am_test_key',
        });
      }).not.toThrow();
    });

    it('should warn for invalid API key format', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new AttentionMarketClient({
        apiKey: 'invalid_key_format',
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('API key does not match expected format')
      );

      warnSpy.mockRestore();
    });

    it('should not warn for valid am_live_ API key', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new AttentionMarketClient({
        apiKey: 'am_live_1234567890abcdef',
      });

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should not warn for valid am_test_ API key', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new AttentionMarketClient({
        apiKey: 'am_test_1234567890abcdef',
      });

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should allow missing API key without warning', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      new AttentionMarketClient({
        apiKey: '',
      });

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});

describe('Utils', () => {
  it('should generate valid UUIDs', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('createOpportunity', () => {
  it('should create opportunity with required fields and defaults', () => {
    const opportunity = createOpportunity({
      taxonomy: 'local_services.movers.quote',
      country: 'US',
      language: 'en',
      platform: 'web',
    });

    expect(opportunity.intent.taxonomy).toBe('local_services.movers.quote');
    expect(opportunity.context.country).toBe('US');
    expect(opportunity.context.language).toBe('en');
    expect(opportunity.context.platform).toBe('web');
    expect(opportunity.constraints.max_units).toBe(1);
    expect(opportunity.constraints.allowed_unit_types).toEqual(['sponsored_suggestion']);
    expect(opportunity.privacy.data_policy).toBe('coarse_only');
  });

  it('should create opportunity with optional fields', () => {
    const opportunity = createOpportunity({
      taxonomy: 'local_services.movers.quote',
      country: 'US',
      language: 'en',
      platform: 'ios',
      query: 'Find movers in Brooklyn',
      region: 'NY',
      city: 'New York',
    });

    expect(opportunity.intent.query).toBe('Find movers in Brooklyn');
    expect(opportunity.context.region).toBe('NY');
    expect(opportunity.context.city).toBe('New York');
  });

  it('should allow overriding constraints', () => {
    const opportunity = createOpportunity({
      taxonomy: 'test',
      country: 'US',
      language: 'en',
      platform: 'web',
      constraints: {
        max_units: 3,
        allowed_unit_types: ['sponsored_tool'],
        blocked_categories: ['adult'],
        max_title_chars: 80,
        max_body_chars: 200,
      },
    });

    expect(opportunity.constraints.max_units).toBe(3);
    expect(opportunity.constraints.allowed_unit_types).toEqual(['sponsored_tool']);
    expect(opportunity.constraints.blocked_categories).toEqual(['adult']);
    expect(opportunity.constraints.max_title_chars).toBe(80);
    expect(opportunity.constraints.max_body_chars).toBe(200);
  });

  it('should allow overriding privacy', () => {
    const opportunity = createOpportunity({
      taxonomy: 'test',
      country: 'US',
      language: 'en',
      platform: 'web',
      privacy: {
        data_policy: 'extended',
      },
    });

    expect(opportunity.privacy.data_policy).toBe('extended');
  });
});

describe('createImpressionEvent', () => {
  it('should create impression event with required fields', () => {
    const event = createImpressionEvent({
      agent_id: 'agt_123',
      request_id: 'req_456',
      decision_id: 'dec_789',
      unit_id: 'unit_abc',
      tracking_token: 'trk_xyz',
    });

    expect(event.event_type).toBe('impression');
    expect(event.agent_id).toBe('agt_123');
    expect(event.request_id).toBe('req_456');
    expect(event.decision_id).toBe('dec_789');
    expect(event.unit_id).toBe('unit_abc');
    expect(event.tracking_token).toBe('trk_xyz');
    expect(event.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(event.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should accept custom occurred_at', () => {
    const customTime = '2026-01-31T12:00:00.000Z';
    const event = createImpressionEvent({
      agent_id: 'agt_123',
      request_id: 'req_456',
      decision_id: 'dec_789',
      unit_id: 'unit_abc',
      tracking_token: 'trk_xyz',
      occurred_at: customTime,
    });

    expect(event.occurred_at).toBe(customTime);
  });

  it('should include metadata when provided', () => {
    const event = createImpressionEvent({
      agent_id: 'agt_123',
      request_id: 'req_456',
      decision_id: 'dec_789',
      unit_id: 'unit_abc',
      tracking_token: 'trk_xyz',
      metadata: { surface: 'chat_response' },
    });

    expect(event.metadata).toEqual({ surface: 'chat_response' });
  });
});

describe('createClickEvent', () => {
  it('should create click event with required fields', () => {
    const event = createClickEvent({
      agent_id: 'agt_123',
      request_id: 'req_456',
      decision_id: 'dec_789',
      unit_id: 'unit_abc',
      tracking_token: 'trk_xyz',
      href: 'https://example.com',
    });

    expect(event.event_type).toBe('click');
    expect(event.agent_id).toBe('agt_123');
    expect(event.request_id).toBe('req_456');
    expect(event.decision_id).toBe('dec_789');
    expect(event.unit_id).toBe('unit_abc');
    expect(event.tracking_token).toBe('trk_xyz');
    expect(event.metadata).toEqual({ href: 'https://example.com' });
    expect(event.event_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(event.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should accept custom occurred_at', () => {
    const customTime = '2026-01-31T12:00:00.000Z';
    const event = createClickEvent({
      agent_id: 'agt_123',
      request_id: 'req_456',
      decision_id: 'dec_789',
      unit_id: 'unit_abc',
      tracking_token: 'trk_xyz',
      href: 'https://example.com',
      occurred_at: customTime,
    });

    expect(event.occurred_at).toBe(customTime);
  });

  it('should merge href with additional metadata', () => {
    const event = createClickEvent({
      agent_id: 'agt_123',
      request_id: 'req_456',
      decision_id: 'dec_789',
      unit_id: 'unit_abc',
      tracking_token: 'trk_xyz',
      href: 'https://example.com',
      metadata: { custom_field: 'value' },
    });

    expect(event.metadata).toEqual({
      custom_field: 'value',
      href: 'https://example.com',
    });
  });
});
