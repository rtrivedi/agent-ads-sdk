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
  DecideResponse,
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
} from './utils.js';

export type {
  CreateOpportunityParams,
  CreateImpressionEventParams,
  CreateClickEventParams,
} from './utils.js';
