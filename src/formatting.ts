/**
 * Natural ad formatting utilities
 *
 * Transforms ad copy to feel more conversational while preserving
 * all tracking data and disclosure requirements.
 */

import type { AdUnit, SponsoredSuggestion } from './types.js';

export interface NaturalFormatOptions {
  /**
   * Tone/style for the formatted text
   * - 'conversational': Friendly, natural language
   * - 'helpful': Informative assistant tone
   * - 'direct': Clear and concise
   */
  style?: 'conversational' | 'helpful' | 'direct';

  /**
   * Optional user context to make formatting more relevant
   * Example: "User is looking for estate planning help"
   */
  userContext?: string;

  /**
   * Maximum length for formatted text (characters)
   * Will truncate gracefully if needed
   */
  maxLength?: number;

  /**
   * Whether to include the disclosure inline
   * Default: true (always show sponsored label)
   */
  includeDisclosure?: boolean;
}

export interface FormattedAd {
  /**
   * Naturally formatted text suitable for conversation
   */
  text: string;

  /**
   * Call-to-action text
   */
  cta: string;

  /**
   * Action URL (preserved from original ad)
   */
  actionUrl: string;

  /**
   * Tracking data (preserved from original ad)
   * IMPORTANT: Pass this to trackClick() when user clicks
   */
  tracking: {
    eventId: string;
    trackingToken: string;
    decisionId: string;
  };

  /**
   * Disclosure information (preserved from original ad)
   */
  disclosure: {
    label: string;
    sponsorName: string;
  };
}

/**
 * Format an ad unit into natural conversational text.
 * Preserves all tracking data and disclosure requirements.
 *
 * @example
 * ```typescript
 * const ad = await client.decide({...});
 * const formatted = formatNatural(ad, {
 *   style: 'conversational',
 *   userContext: "User needs estate planning help"
 * });
 *
 * console.log(formatted.text);
 * // "I found a service that might help: [Title]. [Body]"
 *
 * // When user clicks, tracking still works:
 * await client.trackClick({
 *   event_id: formatted.tracking.eventId,
 *   tracking_token: formatted.tracking.trackingToken
 * });
 * ```
 */
export function formatNatural(
  ad: AdUnit,
  options: NaturalFormatOptions = {}
): FormattedAd {
  if (ad.unit_type !== 'sponsored_suggestion') {
    throw new Error('formatNatural() currently only supports sponsored_suggestion ad units');
  }

  const suggestion = ad.suggestion;
  const style = options.style || 'conversational';
  const includeDisclosure = options.includeDisclosure !== false;

  // Build natural text based on style
  let text = '';

  switch (style) {
    case 'conversational':
      text = buildConversationalText(suggestion, options.userContext);
      break;
    case 'helpful':
      text = buildHelpfulText(suggestion, options.userContext);
      break;
    case 'direct':
      text = buildDirectText(suggestion);
      break;
  }

  // Add disclosure if requested
  if (includeDisclosure) {
    text = `${text}\n\n_${ad.disclosure.label}_ by ${ad.disclosure.sponsor_name}`;
  }

  // Truncate if max length specified
  if (options.maxLength && text.length > options.maxLength) {
    text = truncateGracefully(text, options.maxLength);
  }

  return {
    text,
    cta: suggestion.cta,
    actionUrl: suggestion.action_url,
    tracking: {
      eventId: ad.unit_id, // Use unit_id as event_id
      trackingToken: ad.tracking.token,
      decisionId: ad.unit_id // Use unit_id as decision_id fallback
    },
    disclosure: {
      label: ad.disclosure.label,
      sponsorName: ad.disclosure.sponsor_name
    }
  };
}

/**
 * Build conversational-style text
 */
function buildConversationalText(ad: SponsoredSuggestion, userContext?: string): string {
  const intro = userContext
    ? `Based on what you mentioned, I found something that might help: `
    : `I found something that might be useful: `;

  return `${intro}**${ad.title}**. ${ad.body}`;
}

/**
 * Build helpful assistant-style text
 */
function buildHelpfulText(ad: SponsoredSuggestion, userContext?: string): string {
  const intro = userContext
    ? `For your situation, here's a relevant service: `
    : `Here's a service you might find helpful: `;

  return `${intro}**${ad.title}** — ${ad.body}`;
}

/**
 * Build direct, concise text
 */
function buildDirectText(ad: SponsoredSuggestion): string {
  return `**${ad.title}**\n${ad.body}`;
}

/**
 * Truncate text gracefully at sentence or word boundaries
 */
function truncateGracefully(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to truncate at sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  const sentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);

  if (sentenceEnd > maxLength * 0.7) {
    return text.substring(0, sentenceEnd + 1);
  }

  // Otherwise truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  // Worst case: hard truncate
  return truncated.substring(0, maxLength - 3) + '...';
}

/**
 * Extract just the essential info from an ad for inline mentions.
 * Useful when you want to reference an ad without showing the full text.
 *
 * @example
 * ```typescript
 * const mention = formatInlineMention(ad);
 * console.log(`You might want to check out ${mention.text}`);
 * // "You might want to check out Estate Planning Services (Sponsored)"
 * ```
 */
export function formatInlineMention(ad: AdUnit): FormattedAd {
  if (ad.unit_type !== 'sponsored_suggestion') {
    throw new Error('formatInlineMention() currently only supports sponsored_suggestion ad units');
  }

  const suggestion = ad.suggestion;

  return {
    text: `${suggestion.title} (${ad.disclosure.label})`,
    cta: suggestion.cta,
    actionUrl: suggestion.action_url,
    tracking: {
      eventId: ad.unit_id,
      trackingToken: ad.tracking.token,
      decisionId: ad.unit_id
    },
    disclosure: {
      label: ad.disclosure.label,
      sponsorName: ad.disclosure.sponsor_name
    }
  };
}

/**
 * Validate that an ad fits within UI constraints.
 * Helps developers check if ad will display correctly before showing it.
 *
 * @example
 * ```typescript
 * const validation = validateAdFits(ad, {
 *   maxTitleChars: 60,
 *   maxBodyChars: 200
 * });
 *
 * if (!validation.fits) {
 *   console.log('Ad too long:', validation.violations);
 * }
 * ```
 */
export function validateAdFits(
  ad: AdUnit,
  constraints: {
    maxTitleChars?: number;
    maxBodyChars?: number;
    maxCtaChars?: number;
  }
): {
  fits: boolean;
  violations: string[];
} {
  if (ad.unit_type !== 'sponsored_suggestion') {
    return { fits: true, violations: [] };
  }

  const suggestion = ad.suggestion;
  const violations: string[] = [];

  if (constraints.maxTitleChars && suggestion.title.length > constraints.maxTitleChars) {
    violations.push(
      `Title too long: ${suggestion.title.length} chars (max ${constraints.maxTitleChars})`
    );
  }

  if (constraints.maxBodyChars && suggestion.body.length > constraints.maxBodyChars) {
    violations.push(
      `Body too long: ${suggestion.body.length} chars (max ${constraints.maxBodyChars})`
    );
  }

  if (constraints.maxCtaChars && suggestion.cta.length > constraints.maxCtaChars) {
    violations.push(
      `CTA too long: ${suggestion.cta.length} chars (max ${constraints.maxCtaChars})`
    );
  }

  return {
    fits: violations.length === 0,
    violations
  };
}
