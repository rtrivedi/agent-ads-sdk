/**
 * Tests for natural ad formatting utilities
 */

import { describe, it, expect } from 'vitest';
import { formatNatural, formatInlineMention, validateAdFits } from '../src/formatting.js';
import type { AdUnit } from '../src/types.js';

// Mock sponsored suggestion ad
const mockAd: AdUnit = {
  unit_id: 'ad_123',
  unit_type: 'sponsored_suggestion',
  disclosure: {
    label: 'Sponsored',
    sponsor_name: 'Legal Services Inc',
    explanation: 'This is a paid advertisement'
  },
  tracking: {
    token: 'tok_456'
  },
  suggestion: {
    title: 'Estate Planning Services',
    body: 'Get expert help with wills, trusts, and inheritance planning. Free consultation available.',
    cta: 'Get Started',
    action_url: 'https://example.com/estate-planning'
  },
  _score: {
    relevance: 0.95,
    bid_amount: 12.5,
    quality: 0.85
  }
};

describe('formatNatural()', () => {
  describe('basic functionality', () => {
    it('should format ad in conversational style', () => {
      const formatted = formatNatural(mockAd, { style: 'conversational' });

      expect(formatted.text).toContain('I found something');
      expect(formatted.text).toContain(mockAd.suggestion.title);
      expect(formatted.text).toContain(mockAd.suggestion.body);
      expect(formatted.text).toContain('Sponsored');
      expect(formatted.text).toContain(mockAd.disclosure.sponsor_name);
    });

    it('should format ad in helpful style', () => {
      const formatted = formatNatural(mockAd, { style: 'helpful' });

      expect(formatted.text).toContain('service');
      expect(formatted.text).toContain(mockAd.suggestion.title);
      expect(formatted.text).toContain(mockAd.suggestion.body);
    });

    it('should format ad in direct style', () => {
      const formatted = formatNatural(mockAd, { style: 'direct' });

      expect(formatted.text).toContain(mockAd.suggestion.title);
      expect(formatted.text).toContain(mockAd.suggestion.body);
      // Direct style is more concise
      expect(formatted.text.length).toBeLessThan(
        formatNatural(mockAd, { style: 'conversational' }).text.length
      );
    });

    it('should default to conversational style', () => {
      const formatted = formatNatural(mockAd);
      expect(formatted.text).toContain('I found something');
    });
  });

  describe('user context integration', () => {
    it('should incorporate user context in conversational style', () => {
      const formatted = formatNatural(mockAd, {
        style: 'conversational',
        userContext: 'User needs estate planning help'
      });

      expect(formatted.text).toContain('Based on what you mentioned');
    });

    it('should work without user context', () => {
      const formatted = formatNatural(mockAd, {
        style: 'conversational'
      });

      expect(formatted.text).toBeTruthy();
      expect(formatted.text).not.toContain('Based on what you mentioned');
    });
  });

  describe('disclosure handling', () => {
    it('should include disclosure by default', () => {
      const formatted = formatNatural(mockAd);

      expect(formatted.text).toContain('Sponsored');
      expect(formatted.text).toContain('Legal Services Inc');
    });

    it('should exclude disclosure when requested', () => {
      const formatted = formatNatural(mockAd, {
        includeDisclosure: false
      });

      expect(formatted.text).not.toContain('Sponsored');
      // But disclosure data should still be in the object
      expect(formatted.disclosure.label).toBe('Sponsored');
      expect(formatted.disclosure.sponsorName).toBe('Legal Services Inc');
    });
  });

  describe('length truncation', () => {
    it('should truncate at sentence boundary when possible', () => {
      const formatted = formatNatural(mockAd, {
        maxLength: 100
      });

      expect(formatted.text.length).toBeLessThanOrEqual(100);
      // Should end with punctuation if truncated at sentence
      const lastChar = formatted.text.trim().slice(-1);
      expect(['.', '!', '?', '.']).toContain(lastChar);
    });

    it('should truncate at word boundary if no sentence boundary', () => {
      const formatted = formatNatural(mockAd, {
        style: 'direct', // Shorter format
        maxLength: 40
      });

      expect(formatted.text.length).toBeLessThanOrEqual(43); // 40 + "..."
      // Should end with ... if truncated
      if (formatted.text.includes('...')) {
        expect(formatted.text).toMatch(/\.\.\.$/);
      }
    });

    it('should not truncate if within maxLength', () => {
      const formatted = formatNatural(mockAd, {
        style: 'direct',
        maxLength: 1000
      });

      expect(formatted.text).not.toContain('...');
    });
  });

  describe('tracking data preservation', () => {
    it('should preserve all tracking data', () => {
      const formatted = formatNatural(mockAd);

      expect(formatted.tracking).toEqual({
        eventId: 'ad_123',
        trackingToken: 'tok_456',
        decisionId: 'ad_123'
      });
    });

    it('should preserve action URL', () => {
      const formatted = formatNatural(mockAd);
      expect(formatted.actionUrl).toBe('https://example.com/estate-planning');
    });

    it('should preserve CTA', () => {
      const formatted = formatNatural(mockAd);
      expect(formatted.cta).toBe('Get Started');
    });

    it('should preserve disclosure info', () => {
      const formatted = formatNatural(mockAd, { includeDisclosure: false });

      expect(formatted.disclosure).toEqual({
        label: 'Sponsored',
        sponsorName: 'Legal Services Inc'
      });
    });
  });

  describe('error handling', () => {
    it('should throw error for non-sponsored_suggestion ad types', () => {
      const toolAd: any = {
        unit_type: 'sponsored_tool',
        // ... other fields
      };

      expect(() => formatNatural(toolAd)).toThrow(
        'formatNatural() currently only supports sponsored_suggestion'
      );
    });
  });
});

describe('formatInlineMention()', () => {
  it('should create compact inline mention', () => {
    const mention = formatInlineMention(mockAd);

    expect(mention.text).toBe('Estate Planning Services (Sponsored)');
  });

  it('should preserve all tracking data', () => {
    const mention = formatInlineMention(mockAd);

    expect(mention.tracking).toEqual({
      eventId: 'ad_123',
      trackingToken: 'tok_456',
      decisionId: 'ad_123'
    });
    expect(mention.actionUrl).toBe('https://example.com/estate-planning');
    expect(mention.cta).toBe('Get Started');
  });

  it('should throw error for non-sponsored_suggestion ad types', () => {
    const toolAd: any = { unit_type: 'sponsored_tool' };

    expect(() => formatInlineMention(toolAd)).toThrow(
      'formatInlineMention() currently only supports sponsored_suggestion'
    );
  });
});

describe('validateAdFits()', () => {
  it('should pass validation when ad fits constraints', () => {
    const result = validateAdFits(mockAd, {
      maxTitleChars: 100,
      maxBodyChars: 200,
      maxCtaChars: 20
    });

    expect(result.fits).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('should fail validation when title too long', () => {
    const result = validateAdFits(mockAd, {
      maxTitleChars: 10
    });

    expect(result.fits).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('Title too long');
    expect(result.violations[0]).toContain('10');
  });

  it('should fail validation when body too long', () => {
    const result = validateAdFits(mockAd, {
      maxBodyChars: 20
    });

    expect(result.fits).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain('Body too long');
  });

  it('should fail validation when CTA too long', () => {
    const result = validateAdFits(mockAd, {
      maxCtaChars: 5
    });

    expect(result.fits).toBe(false);
    expect(result.violations[0]).toContain('CTA too long');
  });

  it('should report multiple violations', () => {
    const result = validateAdFits(mockAd, {
      maxTitleChars: 5,
      maxBodyChars: 10,
      maxCtaChars: 3
    });

    expect(result.fits).toBe(false);
    expect(result.violations).toHaveLength(3);
  });

  it('should handle partial constraints', () => {
    const result = validateAdFits(mockAd, {
      maxTitleChars: 100
      // No body or CTA constraints
    });

    expect(result.fits).toBe(true);
  });

  it('should return true for non-sponsored_suggestion ads', () => {
    const toolAd: any = { unit_type: 'sponsored_tool' };

    const result = validateAdFits(toolAd, {
      maxTitleChars: 10
    });

    expect(result.fits).toBe(true);
    expect(result.violations).toEqual([]);
  });
});
