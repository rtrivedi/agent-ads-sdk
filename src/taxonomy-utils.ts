/**
 * Taxonomy helper utilities for AttentionMarket SDK
 * Helps with building, validating, and working with the 4-tier taxonomy system
 */

// Valid intent modifiers
export type TaxonomyIntent =
  | 'research'      // Learning, browsing (low intent)
  | 'compare'       // Evaluating options (medium intent)
  | 'quote'         // Getting prices (high intent)
  | 'trial'         // Free trial signup (high intent)
  | 'book'          // Schedule/purchase (very high intent)
  | 'apply'         // Application process (very high intent)
  | 'consultation'; // Schedule meeting (very high intent)

/**
 * Build a valid taxonomy string
 *
 * @param vertical - Industry vertical (e.g., "insurance", "business", "healthcare")
 * @param category - Product/service category (e.g., "auto", "saas", "dental")
 * @param subcategory - Specific offering (e.g., "full_coverage", "crm", "cosmetic")
 * @param intent - Optional user journey stage
 * @returns Properly formatted taxonomy string
 *
 * @example
 * buildTaxonomy('insurance', 'auto', 'full_coverage', 'quote')
 * // Returns: 'insurance.auto.full_coverage.quote'
 *
 * @example
 * buildTaxonomy('business', 'saas', 'crm', 'trial')
 * // Returns: 'business.saas.crm.trial'
 */
export function buildTaxonomy(
  vertical: string,
  category: string,
  subcategory: string,
  intent?: TaxonomyIntent
): string {
  const parts = [vertical, category, subcategory];
  if (intent) {
    parts.push(intent);
  }
  return parts.join('.');
}

/**
 * Detect user intent from query string
 *
 * Analyzes the user's query to determine their stage in the buying journey.
 * Returns the most appropriate intent modifier.
 *
 * @param query - User's search query or question
 * @returns Detected intent modifier
 *
 * @example
 * detectIntent("What is term life insurance?")
 * // Returns: 'research'
 *
 * @example
 * detectIntent("Get car insurance quote")
 * // Returns: 'quote'
 *
 * @example
 * detectIntent("Best CRM software comparison")
 * // Returns: 'compare'
 */
export function detectIntent(query: string): TaxonomyIntent {
  const lowerQuery = query.toLowerCase();

  // Research intent - learning/information gathering
  if (/what is|how does|how do|learn about|tell me about|explain|understand|definition/i.test(lowerQuery)) {
    return 'research';
  }

  // Compare intent - evaluating options
  if (/best|compare|vs|versus|which|top|options|alternatives|review|recommend/i.test(lowerQuery)) {
    return 'compare';
  }

  // Quote intent - ready to get prices
  if (/price|cost|how much|quote|estimate|pricing|rate|afford/i.test(lowerQuery)) {
    return 'quote';
  }

  // Trial intent - wants to try before buying
  if (/try|demo|free trial|test|preview|sample/i.test(lowerQuery)) {
    return 'trial';
  }

  // Book intent - ready to schedule/purchase
  if (/book|schedule|appointment|reserve|set up|make appointment/i.test(lowerQuery)) {
    return 'book';
  }

  // Apply intent - application/signup
  if (/apply|sign up|get started|register|enroll|join/i.test(lowerQuery)) {
    return 'apply';
  }

  // Consultation intent - wants to talk to someone
  if (/talk to|speak with|consult|meet with|call|contact|discuss/i.test(lowerQuery)) {
    return 'consultation';
  }

  // Default to compare (most common)
  return 'compare';
}

/**
 * Validate taxonomy format
 *
 * Checks if a taxonomy string follows the correct format:
 * - 3 or 4 parts separated by dots
 * - All parts are lowercase alphanumeric with underscores
 * - If 4 parts, last part must be a valid intent
 *
 * @param taxonomy - Taxonomy string to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidTaxonomy('insurance.auto.full_coverage.quote') // true
 * isValidTaxonomy('insurance.auto') // false (too short)
 * isValidTaxonomy('Insurance.Auto.Quote') // false (uppercase)
 * isValidTaxonomy('insurance.auto.full_coverage.invalid') // false (invalid intent)
 */
export function isValidTaxonomy(taxonomy: string): boolean {
  const parts = taxonomy.split('.');

  // Must be 3 or 4 parts
  if (parts.length < 3 || parts.length > 4) {
    return false;
  }

  // Check valid intent (if present)
  const validIntents: TaxonomyIntent[] = [
    'research', 'compare', 'quote', 'trial',
    'book', 'apply', 'consultation'
  ];

  if (parts.length === 4 && !validIntents.includes(parts[3] as TaxonomyIntent)) {
    return false;
  }

  // Check each part is non-empty and alphanumeric + underscore
  return parts.every(part => /^[a-z0-9_]+$/.test(part));
}

/**
 * Parsed taxonomy components
 */
export interface ParsedTaxonomy {
  /** Industry vertical (tier 1) */
  vertical: string;
  /** Product/service category (tier 2) */
  category: string;
  /** Specific offering (tier 3) */
  subcategory: string;
  /** User journey stage (tier 4, optional) */
  intent?: TaxonomyIntent;
  /** Full taxonomy string */
  full: string;
}

/**
 * Parse taxonomy into components
 *
 * Breaks down a taxonomy string into its constituent parts for analysis.
 *
 * @param taxonomy - Taxonomy string to parse
 * @returns Parsed components or null if invalid
 *
 * @example
 * parseTaxonomy('insurance.auto.full_coverage.quote')
 * // Returns: {
 * //   vertical: 'insurance',
 * //   category: 'auto',
 * //   subcategory: 'full_coverage',
 * //   intent: 'quote',
 * //   full: 'insurance.auto.full_coverage.quote'
 * // }
 */
export function parseTaxonomy(taxonomy: string): ParsedTaxonomy | null {
  if (!isValidTaxonomy(taxonomy)) {
    return null;
  }

  const parts = taxonomy.split('.');
  const result: ParsedTaxonomy = {
    vertical: parts[0]!,
    category: parts[1]!,
    subcategory: parts[2]!,
    full: taxonomy
  };

  if (parts[3]) {
    result.intent = parts[3] as TaxonomyIntent;
  }

  return result;
}

/**
 * Get taxonomy without intent modifier
 *
 * Useful for broader matching or grouping taxonomies by product/service.
 *
 * @param taxonomy - Full taxonomy string
 * @returns Taxonomy without intent, or null if invalid
 *
 * @example
 * getBaseTaxonomy('insurance.auto.full_coverage.quote')
 * // Returns: 'insurance.auto.full_coverage'
 */
export function getBaseTaxonomy(taxonomy: string): string | null {
  const parsed = parseTaxonomy(taxonomy);
  if (!parsed) return null;

  return `${parsed.vertical}.${parsed.category}.${parsed.subcategory}`;
}

/**
 * Check if two taxonomies match hierarchically
 *
 * Returns true if they share the same vertical, category, and subcategory
 * (regardless of intent).
 *
 * @param taxonomy1 - First taxonomy
 * @param taxonomy2 - Second taxonomy
 * @returns True if they match hierarchically
 *
 * @example
 * matchesTaxonomy(
 *   'insurance.auto.full_coverage.quote',
 *   'insurance.auto.full_coverage.apply'
 * )
 * // Returns: true (same base, different intent)
 */
export function matchesTaxonomy(taxonomy1: string, taxonomy2: string): boolean {
  const base1 = getBaseTaxonomy(taxonomy1);
  const base2 = getBaseTaxonomy(taxonomy2);

  return base1 !== null && base2 !== null && base1 === base2;
}

/**
 * Get vertical from taxonomy
 *
 * Extracts just the industry vertical (tier 1).
 *
 * @param taxonomy - Taxonomy string
 * @returns Vertical or null if invalid
 *
 * @example
 * getVertical('insurance.auto.full_coverage.quote')
 * // Returns: 'insurance'
 */
export function getVertical(taxonomy: string): string | null {
  const parsed = parseTaxonomy(taxonomy);
  return parsed ? parsed.vertical : null;
}

/**
 * Suggest taxonomies based on user query
 *
 * Analyzes a user query and suggests appropriate taxonomies.
 * This is a basic implementation - you may want to enhance it
 * with ML/NLP for better accuracy.
 *
 * @param query - User's search query
 * @returns Array of suggested taxonomy strings
 *
 * @example
 * suggestTaxonomies("I need car insurance")
 * // Returns: ['insurance.auto.full_coverage.quote', 'insurance.auto.liability.quote']
 */
export function suggestTaxonomies(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const intent = detectIntent(query);
  const suggestions: string[] = [];

  // Insurance-related
  if (/car|auto|vehicle|drive|driving/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('insurance', 'auto', 'full_coverage', intent));
    suggestions.push(buildTaxonomy('insurance', 'auto', 'liability', intent));
  }
  if (/health|medical|doctor/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('insurance', 'health', 'individual', intent));
  }
  if (/life insurance/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('insurance', 'life', 'term', intent));
  }

  // Business/SaaS
  if (/crm|customer|sales|lead/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('business', 'saas', 'crm', intent));
  }
  if (/online store|ecommerce|sell online/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('business', 'ecommerce', 'platform', intent));
  }
  if (/project management|task|team/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('business', 'saas', 'project_management', intent));
  }

  // Legal
  if (/accident|injury|hurt/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('legal', 'personal_injury', 'accident', intent));
  }
  if (/divorce|custody|family law/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('legal', 'family_law', 'divorce', intent));
  }

  // Healthcare
  if (/dentist|teeth|dental/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('healthcare', 'dental', 'general', intent));
  }
  if (/therapist|therapy|counseling/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('healthcare', 'mental_health', 'therapy', intent));
  }

  // Home services
  if (/mover|moving|relocate/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('home_services', 'moving', 'local', intent));
  }
  if (/plumber|plumbing|leak/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('home_services', 'plumbing', 'emergency', intent));
  }
  if (/clean|cleaning|maid/.test(lowerQuery)) {
    suggestions.push(buildTaxonomy('home_services', 'cleaning', 'regular', intent));
  }

  return suggestions;
}
