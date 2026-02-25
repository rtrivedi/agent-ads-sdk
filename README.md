# AttentionMarket SDK

[![npm version](https://badge.fury.io/js/@the_ro_show%2Fagent-ads-sdk.svg)](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Monetize your AI application with contextual advertising. AttentionMarket matches user intent with relevant sponsored content, enabling you to generate revenue from every conversation.

## Installation

```bash
npm install @the_ro_show/agent-ads-sdk
```

## Quick Start

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: 'am_live_YOUR_KEY',
  agentId: 'agt_YOUR_AGENT_ID'
});

// Request a contextual ad
const ad = await client.decideFromContext({
  userMessage: "I'm looking for car insurance",
  placement: 'sponsored_suggestion'
});

if (ad) {
  console.log(ad.creative.title);  // "Get 20% off car insurance"
  console.log(ad.creative.body);   // "Compare quotes from top providers"
  console.log(ad.click_url);       // Auto-tracked click URL
}
```

## Authentication

All API requests require authentication via an API key. Get your keys at [api.attentionmarket.ai](https://api.attentionmarket.ai).

### API Key Types

- **Test keys** (`am_test_...`) — Use in development. No charges, test data only.
- **Live keys** (`am_live_...`) — Use in production. Real advertisers, real revenue.

### SDK Configuration

```typescript
const client = new AttentionMarketClient({
  apiKey: 'am_live_YOUR_KEY',        // Required
  agentId: 'agt_YOUR_AGENT_ID',      // Required for decideFromContext()
  baseUrl: 'https://api.attentionmarket.ai/v1',  // Optional: defaults to production
  timeoutMs: 4000,                   // Optional: request timeout in milliseconds
  maxRetries: 2                      // Optional: automatic retry count
});
```

## Core Concepts

### Placements

A placement defines where ads appear in your application:

- `sponsored_suggestion` — Conversational ad in chat flow (most common)
- `sponsored_block` — Dedicated ad section in UI
- `sponsored_tool` — AI agent service recommendation

### Ad Response Format

```typescript
interface AdResponse {
  request_id: string;
  decision_id: string;
  advertiser_id: string;
  ad_type: 'link' | 'recommendation' | 'service';
  payout: number;  // Amount earned on conversion (in cents)

  creative: {
    title: string;
    body: string;
    cta: string;
  };

  click_url: string;        // Tracked click URL (use this)
  tracking_url?: string;    // Server-side tracking URL
  tracking_token: string;   // For manual event tracking

  disclosure: {
    label: string;
    explanation: string;
    sponsor_name: string;
  };
}
```

### Impression Tracking

**Important:** As of v0.9.0, impression tracking is required to earn revenue from clicks.

The SDK automatically tracks impressions when using `decideFromContext()`. Clicks without prior impressions will redirect users but will not generate revenue.

If using the raw `decide()` API, you must manually track impressions:

```typescript
await client.trackImpression({
  agent_id: 'agt_YOUR_AGENT_ID',
  request_id: ad.request_id,
  decision_id: ad.decision_id,
  unit_id: ad._ad.unit_id,
  tracking_token: ad.tracking_token
});
```

## Developer Controls

AttentionMarket provides fine-grained controls over ad selection, quality, and revenue optimization.

### Quality and Brand Safety

#### Minimum Quality Score

Filter ads based on historical performance metrics. Quality scores range from 0.0 (worst) to 1.0 (best) and are calculated from click-through rates, conversion rates, and user feedback.

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  minQualityScore: 0.7  // Only show ads with quality >= 0.7
});
```

**Validation:** Must be a number between 0.0 and 1.0.

**Use cases:**
- Premium applications: `0.8+` for high-quality experiences only
- Brand-sensitive contexts: `0.7+` to avoid low-quality advertisers
- General applications: `0.5+` for balanced quality and fill rate

#### Category Filtering

Control which advertiser categories can appear using the IAB Content Taxonomy 3.0 (704 categories across 38 top-level verticals).

##### Allowed Categories

Whitelist specific categories. Only ads from these categories will be shown.

```typescript
// Insurance comparison app: only show insurance ads
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  allowedCategories: [31]  // 31 = Auto Insurance (IAB category)
});

// Wedding planner: allow wedding + photography + food
const ad = await client.decideFromContext({
  userMessage: "Help me plan my wedding",
  allowedCategories: [
    603,  // Weddings
    162,  // Photography
    190   // Restaurants
  ]
});
```

##### Blocked Categories

Blacklist specific categories. Ads from these categories will never be shown.

```typescript
// Block all sensitive content (gambling, adult, controversial)
const ad = await client.decideFromContext({
  userMessage: "Help me with something",
  blockedCategories: [601]  // Blocks "Sensitive Topics" + all children
});

// Legal assistant: block competitor law firms
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  blockedCategories: [318]  // Block "Legal Services"
});
```

**Parent-child relationships:** Blocking a parent category automatically blocks all subcategories. For example, blocking category `1` (Automotive) blocks Auto Insurance, Auto Repair, Auto Parts, etc.

**Precedence:** If `allowedCategories` is set, `blockedCategories` is ignored.

**Validation rules:**
- `allowedCategories`: Must be a non-empty array of numbers or strings
- `blockedCategories`: Must be an array of numbers or strings
- Empty `allowedCategories: []` is rejected (would block all ads)

**Note:** IAB category IDs (numbers) are recommended. Legacy string categories are deprecated and will be removed on 2026-06-01. Use the `getCategories()` API to discover category IDs.

##### Discovering Categories

```typescript
// Get all 38 top-level categories
const tier1 = await client.getCategories({ tier: 1 });
tier1.categories.forEach(cat => {
  console.log(`${cat.id}: ${cat.name}`);
});
// Output: 1: Automotive, 31: Insurance, 150: Attractions, etc.

// Get all subcategories of "Automotive" (ID: 1)
const automotive = await client.getCategories({ parent_id: 1 });
// Returns: Auto Insurance (31), Auto Repair (34), Auto Buying (30), etc.

// Search for insurance-related categories
const insurance = await client.getCategories({ search: 'insurance' });
insurance.categories.forEach(cat => {
  console.log(cat.full_path);
});
// Output: "Automotive > Auto Insurance", "Personal Finance > Insurance", etc.
```

#### Advertiser Blocklist

Block specific advertisers by ID (e.g., based on user feedback or competitive conflicts).

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  blockedAdvertisers: ['adv_abc123', 'adv_xyz789']
});
```

**Validation:** Must be an array of non-empty strings (advertiser IDs).

Advertiser IDs are included in ad responses as `advertiser_id`.

### Revenue Optimization

#### Minimum CPC Filter

Only show ads with bids at or above a specified cost-per-click threshold (in cents).

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  minCPC: 100  // Only ads bidding >= $1.00 per click
});
```

**Validation:** Must be a non-negative number.

**Use cases:**
- Premium applications: `200+` for $2+ ads only
- High-value verticals: Filter out low-budget advertisers
- Revenue targets: Ensure minimum revenue per impression
- Lower fill rate tolerance: When you'd rather show nothing than a low-value ad

**Trade-off:** Higher thresholds = higher revenue per ad but lower fill rate.

#### Minimum Relevance Score

Only show ads with semantic similarity at or above a threshold. Relevance scores range from 0.0 (unrelated) to 1.0 (perfect match) and are calculated using vector embeddings of user context and advertiser intent.

```typescript
const ad = await client.decideFromContext({
  userMessage: "Help me plan my wedding",
  minRelevanceScore: 0.8  // Only highly relevant ads
});
```

**Validation:** Must be a number between 0.0 and 1.0.

**Use cases:**
- Niche applications: `0.8+` for specialized content only (e.g., legal assistant)
- User experience priority: Filter out loosely related ads
- Context-sensitive placements: Ensure ads match conversation topic
- Brand-aligned content: Maintain thematic consistency

**Important:** This filter only applies to campaigns with semantic targeting. Keyword and automatic campaigns are not affected.

**Default threshold:** Backend applies a minimum threshold of 0.25 for all semantic campaigns (ads below this are never shown).

#### Ranking Strategy

Choose how ads are ranked when multiple ads match the request.

```typescript
// Revenue-optimized (default): highest bid wins
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  optimizeFor: 'revenue'  // Rank by bid × quality × relevance
});

// Relevance-optimized: best match wins
const ad = await client.decideFromContext({
  userMessage: "I need legal help",
  optimizeFor: 'relevance'  // Rank by semantic similarity only
});
```

**Validation:** Must be either `'revenue'` or `'relevance'`.

**How it works (second-price auction):**

- **Revenue mode:** Winner is ranked by composite score (bid × quality × relevance), pays just enough to beat the next ad's composite score + $0.01
- **Relevance mode:** Winner is ranked by semantic similarity, pays just enough to beat the next ad in composite score space + $0.01
- **Price cap:** Winner never pays more than their max bid (auction integrity guaranteed)
- **Price floor:** Minimum clearing price of $0.25 ensures platform sustainability

**Use cases:**
- General applications: `'revenue'` to maximize earnings
- Niche applications: `'relevance'` to prioritize perfect matches over high bids
- Premium experiences: Combine with high `minRelevanceScore` + `'relevance'` ranking

#### Combined Controls

Combine multiple controls for precise ad selection:

```typescript
// Premium legal assistant: high relevance + high bids + category filter
const ad = await client.decideFromContext({
  userMessage: "I need estate planning help",
  minRelevanceScore: 0.8,    // Only highly relevant
  minCPC: 200,               // Only $2+ bids
  minQualityScore: 0.7,      // Only high-quality advertisers
  optimizeFor: 'relevance',  // Best match wins
  allowedCategories: [318]   // Legal services only
});
```

## Advanced Features

### Multi-Turn Conversations

Include conversation history for better ad matching:

```typescript
const ad = await client.decideFromContext({
  userMessage: "What are my options?",
  conversationHistory: [
    "User: My car insurance is too expensive",
    "Agent: I can help you compare rates",
    "User: What are my options?"
  ]
});
```

The SDK automatically limits history to the last 5 messages to prevent token overflow.

### Geographic and Platform Targeting

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  country: 'US',
  language: 'en',
  platform: 'ios'  // 'web' | 'ios' | 'android' | 'desktop' | 'voice' | 'other'
});
```

### Click Tracking

Clicks are automatically tracked when users visit `click_url`. For manual tracking:

```typescript
await client.trackClick({
  agent_id: 'agt_YOUR_AGENT_ID',
  request_id: ad.request_id,
  decision_id: ad.decision_id,
  unit_id: ad._ad.unit_id,
  tracking_token: ad.tracking_token,
  href: ad.click_url,
  click_context: "User clicked 'Get a Quote' button"
});
```

Simplified tracking from ad object:

```typescript
await client.trackClickFromAd(ad, {
  click_context: "User clicked on sponsored suggestion"
});
```

### Conversion Tracking

Track conversions (purchases, signups, etc.) to improve advertiser ROI and your quality score:

```typescript
await client.track({
  event_id: `evt_${generateUUID()}`,
  event_type: 'conversion',
  occurred_at: new Date().toISOString(),
  agent_id: 'agt_YOUR_AGENT_ID',
  request_id: ad.request_id,
  decision_id: ad.decision_id,
  unit_id: ad._ad.unit_id,
  tracking_token: ad.tracking_token,
  metadata: {
    conversion_value: 99.99,
    conversion_type: 'purchase'
  }
});
```

## Error Handling

The SDK throws errors for invalid configurations and failed requests:

```typescript
try {
  const ad = await client.decideFromContext({
    userMessage: "I need car insurance",
    minQualityScore: -0.5  // Invalid: must be 0.0-1.0
  });
} catch (error) {
  console.error(error.message);
  // Output: "minQualityScore must be a number between 0.0 and 1.0"
}
```

### Validation Errors

The SDK validates all parameters before making API calls. Common validation errors:

- `minQualityScore must be a number between 0.0 and 1.0`
- `minCPC must be a non-negative number (cost-per-click in cents)`
- `minRelevanceScore must be a number between 0.0 and 1.0`
- `optimizeFor must be either "revenue" or "relevance"`
- `allowedCategories cannot be empty (would block all ads). Use blockedCategories to exclude specific categories, or omit to allow all.`
- `blockedAdvertisers must contain non-empty strings (advertiser IDs)`

### HTTP Errors

The API returns standard HTTP status codes:

- `400 Bad Request` — Invalid parameters (see error message for details)
- `401 Unauthorized` — Missing or invalid API key
- `429 Too Many Requests` — Rate limit exceeded
- `500 Internal Server Error` — Server error (contact support if persistent)

## Rate Limits

- **Per IP:** 60 requests per minute
- **Per API key:** 100 requests per minute

Rate limits are enforced to prevent abuse and ensure fair resource allocation. If you need higher limits, contact support.

## Testing

Use test API keys (`am_test_...`) for development and testing. Test keys:

- Return test ads with realistic data
- Do not charge advertisers
- Do not generate real revenue
- Have the same rate limits as live keys

Switch to live keys (`am_live_...`) when deploying to production.

## Support

- **Documentation:** [docs.attentionmarket.ai](https://docs.attentionmarket.ai)
- **API Reference:** [api.attentionmarket.ai/docs](https://api.attentionmarket.ai/docs)
- **Issues:** [github.com/rtrivedi/agent-ads-sdk/issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Email:** support@attentionmarket.ai

## License

MIT License. See [LICENSE](LICENSE) for details.
