/**
 * AttentionMarket Agent Ads SDK
 * TypeScript SDK for integrating agent-native sponsored units
 */

// Main client
export { AttentionMarketClient } from './client.js';

// Mock client for testing
export { MockAttentionMarketClient } from './mock-client.js';
export type { MockClientConfig } from './mock-client.js';

// Types
export type {
  // Configuration
  SDKConfig,
  // Agent Signup
  AgentSignupRequest,
  AgentSignupResponse,
  // Decide
  DecideRequest,
  DecideFromContextRequest,
  DecideResponse,
  AdResponse,  // New: Simple response from decideFromContext()
  // Intenture APIs
  RequestOfferParams,
  RequestOfferFromContextParams,
  OfferResponse,
  // Placement
  PlacementType,
  Placement,
  // Opportunity
  Opportunity,
  Intent,
  Context,
  Constraints,
  Privacy,
  // Ad Units
  AdUnit,
  AdScore,
  Disclosure,
  Tracking,
  SponsoredSuggestion,
  SponsoredTool,
  ToolCall,
  // Events
  EventType,
  EventIngestRequest,
  EventIngestResponse,
  // Policy
  PolicyResponse,
  // Errors
  APIError,
} from './types.js';

// Errors
export {
  AttentionMarketError,
  APIRequestError,
  NetworkError,
  TimeoutError,
} from './errors.js';

// Utilities
export {
  generateUUID,
  generateTimestamp,
  createOpportunity,
  createImpressionEvent,
  createClickEvent,
  escapeHTML,
  sanitizeURL,
} from './utils.js';

export type {
  CreateOpportunityParams,
  CreateImpressionEventParams,
  CreateClickEventParams,
  SanitizeURLOptions,
} from './utils.js';

// Formatting utilities
export {
  formatNatural,
  formatInlineMention,
  validateAdFits,
} from './formatting.js';

export type {
  NaturalFormatOptions,
  FormattedAd,
} from './formatting.js';

// Taxonomy utilities
export {
  buildTaxonomy,
  detectIntent,
  isValidTaxonomy,
  parseTaxonomy,
  getBaseTaxonomy,
  matchesTaxonomy,
  getVertical,
  suggestTaxonomies,
} from './taxonomy-utils.js';

export type {
  TaxonomyIntent,
  ParsedTaxonomy,
} from './taxonomy-utils.js';
