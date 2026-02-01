# AttentionMarket Agent Ads SDK

TypeScript SDK for integrating agent-native sponsored units (Sponsored Suggestions and Sponsored Tools) into AI agents.

## Installation

```bash
npm install @the_ro_show/agent-ads-sdk
```

## Configuration

Store your credentials in environment variables:

```bash
export ATTENTIONMARKET_API_KEY=am_live_...
export ATTENTIONMARKET_AGENT_ID=agt_01HV...
```

**⚠️ Never commit API keys to version control.** See [SECURITY.md](./SECURITY.md) for best practices.

## Quick Start

```typescript
import { AttentionMarketClient, createOpportunity, generateUUID } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({ apiKey: process.env.ATTENTIONMARKET_API_KEY });

const opportunity = createOpportunity({
  taxonomy: 'local_services.movers.quote',
  country: 'US',
  language: 'en',
  platform: 'web',
  query: 'Find movers in Brooklyn',
});

const unit = await client.decide({
  request_id: generateUUID(),
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  placement: { type: 'sponsored_suggestion', surface: 'chat_response' },
  opportunity,
});

if (unit && unit.unit_type === 'sponsored_suggestion') {
  console.log(`[${unit.disclosure.label}] ${unit.disclosure.sponsor_name}`);
  console.log(unit.suggestion.title);

  await client.trackImpression({
    agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
    request_id: 'req_id',
    decision_id: 'decision_id',
    unit_id: unit.unit_id,
    tracking_token: unit.tracking.token,
  });
}
```

## Testing Without Advertiser Data

Use `MockAttentionMarketClient` to test your integration without needing real ad campaigns.

```typescript
import { MockAttentionMarketClient, createOpportunity, generateUUID } from '@the_ro_show/agent-ads-sdk';

// Use mock client during development
const client = new MockAttentionMarketClient({
  latencyMs: 100,    // Simulate API latency
  fillRate: 1.0,     // 100% fill rate for testing
  verbose: true,     // Log mock activity
});

const opportunity = createOpportunity({
  taxonomy: 'local_services.movers.quote',
  country: 'US',
  language: 'en',
  platform: 'web',
  query: 'Find movers in Brooklyn',
});

const unit = await client.decide({
  request_id: generateUUID(),
  agent_id: 'agt_test',
  placement: { type: 'sponsored_suggestion', surface: 'chat_response' },
  opportunity,
});

// Returns realistic mock ad data immediately
if (unit && unit.unit_type === 'sponsored_suggestion') {
  console.log(unit.suggestion.title); // "Professional Moving Services - Same Day Available"
}
```

**Available mock taxonomies:**
- `local_services.movers.quote`
- `local_services.restaurants.search`
- `local_services.plumbers.quote`
- `local_services.electricians.quote`
- `local_services.cleaners.quote`
- `shopping.electronics.search`

**Add custom mock ads:**

```typescript
client.addMockUnit('your.custom.taxonomy', {
  unit_id: 'unit_custom_001',
  unit_type: 'sponsored_suggestion',
  disclosure: { label: 'Sponsored', sponsor_name: 'Your Sponsor' },
  tracking: { token: 'trk_test', impression_url: '...', click_url: '...' },
  suggestion: {
    title: 'Your Ad Title',
    body: 'Your ad body text',
    cta: 'Call to Action',
    action_url: 'https://example.com',
  },
});
```

**Run the full test suite:**

```bash
npx tsx examples/test-with-mocks.ts
```

**Switch to production:**

```typescript
const client = process.env.NODE_ENV === 'production'
  ? new AttentionMarketClient({ apiKey: process.env.ATTENTIONMARKET_API_KEY })
  : new MockAttentionMarketClient();
```

## Agent Integration Examples

### Minimal Examples (< 80 lines)

Start here for a quick overview:

- **[Claude](./examples/claude-tool-use-minimal.ts)** - Minimal tool use integration
- **[OpenAI GPT](./examples/openai-function-calling-minimal.ts)** - Minimal function calling
- **[Google Gemini](./examples/gemini-function-calling-minimal.ts)** - Minimal function declarations

Each shows: `createOpportunity` → `decide` → render → track

### Full Examples (with detailed integration notes)

For production integrations:

- **[Claude (Anthropic)](./examples/claude-tool-use-full.ts)** - Complete tool use pattern with schemas and tracking
- **[OpenAI GPT](./examples/openai-function-calling-full.ts)** - Complete function calling with integration checklist
- **[Google Gemini](./examples/gemini-function-calling-full.ts)** - Complete function declarations with testing guide

Run any example with:
```bash
npx tsx examples/claude-tool-use-minimal.ts
```

## Full Example with Raw Response

```typescript
import {
  AttentionMarketClient,
  createOpportunity,
  generateUUID,
} from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
});

// Build opportunity
const opportunity = createOpportunity({
  taxonomy: 'local_services.movers.quote',
  country: 'US',
  language: 'en',
  platform: 'web',
  query: 'Find movers in Brooklyn',
});

// Get full response (includes status, ttl_ms, all units)
const response = await client.decideRaw({
  request_id: generateUUID(),
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  placement: {
    type: 'sponsored_suggestion',
    surface: 'chat_response',
  },
  opportunity,
});

if (response.status === 'filled') {
  // Access all units and metadata
  console.log(`TTL: ${response.ttl_ms}ms`);
  console.log(`Units: ${response.units.length}`);

  const unit = response.units[0];

  // Render unit
  if (unit && unit.unit_type === 'sponsored_suggestion') {
    console.log(unit.suggestion.title);
  }

  // Track impression after rendering
  await client.trackImpression({
    agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
    request_id: response.request_id,
    decision_id: response.decision_id,
    unit_id: unit.unit_id,
    tracking_token: unit.tracking.token,
    metadata: { surface: 'chat_response' },
  });

  // Track click when user clicks
  await client.trackClick({
    agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
    request_id: response.request_id,
    decision_id: response.decision_id,
    unit_id: unit.unit_id,
    tracking_token: unit.tracking.token,
    href: unit.suggestion.action_url,
  });
}
```

## API Methods

### `decide(request, options?): Promise<AdUnit | null>`

Convenience method that returns the first ad unit or `null` if no fill.

```typescript
const unit = await client.decide({
  request_id: generateUUID(),
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  placement: {
    type: 'sponsored_suggestion',
    surface: 'chat_response',
  },
  opportunity,
});
```

### `decideRaw(request, options?): Promise<DecideResponse>`

Returns the full response including status, ttl_ms, and all units.

```typescript
const response = await client.decideRaw({
  request_id: generateUUID(),
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  placement: { type: 'sponsored_suggestion', surface: 'chat_response' },
  opportunity,
}, {
  idempotencyKey: 'optional-idempotency-key',
});
```

### `trackImpression(params): Promise<EventIngestResponse>`

Convenience method to track when a unit is rendered.

```typescript
await client.trackImpression({
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  request_id: 'req_123',
  decision_id: 'dec_456',
  unit_id: 'unit_789',
  tracking_token: 'trk_abc',
  metadata: { surface: 'chat_response' },
});
```

### `trackClick(params): Promise<EventIngestResponse>`

Convenience method to track when a user clicks a unit.

```typescript
await client.trackClick({
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  request_id: 'req_123',
  decision_id: 'dec_456',
  unit_id: 'unit_789',
  tracking_token: 'trk_abc',
  href: 'https://example.com/action',
});
```

### `track(event): Promise<EventIngestResponse>`

Low-level method to track any event type.

```typescript
await client.track({
  event_id: generateUUID(),
  occurred_at: new Date().toISOString(),
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  request_id: 'req_123',
  decision_id: 'dec_456',
  unit_id: 'unit_789',
  event_type: 'impression',
  tracking_token: 'trk_abc',
});
```

### `getPolicy(): Promise<PolicyResponse>`

Fetch policy constraints and formatting requirements.

```typescript
const policy = await client.getPolicy();
console.log(policy.defaults.max_units_per_response);
console.log(policy.disclosure.label);
```

### `signupAgent(request, options?): Promise<AgentSignupResponse>` (static)

Register a new agent (unauthenticated endpoint).

```typescript
const signup = await AttentionMarketClient.signupAgent({
  owner_email: 'owner@company.com',
  agent_name: 'My Agent',
  sdk: 'typescript',
  environment: 'test',
});

console.log(signup.agent_id);
console.log(signup.api_key);
```

## Helper Functions

### `createOpportunity(params): Opportunity`

Build a valid Opportunity object with safe defaults.

```typescript
const opportunity = createOpportunity({
  // Required
  taxonomy: 'local_services.movers.quote',
  country: 'US',
  language: 'en',
  platform: 'web',

  // Optional
  query: 'Find movers in Brooklyn',
  region: 'NY',
  city: 'New York',

  // Optional overrides (with defaults shown)
  constraints: {
    max_units: 1,
    allowed_unit_types: ['sponsored_suggestion'],
    blocked_categories: ['adult'],
  },
  privacy: {
    data_policy: 'coarse_only',
  },
});
```

### `createImpressionEvent(params): EventIngestRequest`

Build an impression event payload.

```typescript
import { createImpressionEvent } from '@the_ro_show/agent-ads-sdk';

const event = createImpressionEvent({
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  request_id: 'req_123',
  decision_id: 'dec_456',
  unit_id: 'unit_789',
  tracking_token: 'trk_abc',
  occurred_at: new Date().toISOString(), // optional, auto-generated
  metadata: { surface: 'chat_response' }, // optional
});

await client.track(event);
```

### `createClickEvent(params): EventIngestRequest`

Build a click event payload.

```typescript
import { createClickEvent } from '@the_ro_show/agent-ads-sdk';

const event = createClickEvent({
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  request_id: 'req_123',
  decision_id: 'dec_456',
  unit_id: 'unit_789',
  tracking_token: 'trk_abc',
  href: 'https://example.com',
  occurred_at: new Date().toISOString(), // optional, auto-generated
});

await client.track(event);
```

### `generateUUID(): string`

Generate a UUID v4 for request_id, event_id, etc.

```typescript
import { generateUUID } from '@the_ro_show/agent-ads-sdk';

const requestId = generateUUID();
```

## Features

- ✅ TypeScript support with full type definitions
- ✅ Automatic retries with exponential backoff
- ✅ Configurable timeouts (default 4000ms)
- ✅ Idempotency support
- ✅ Discriminated union types for type-safe ad units
- ✅ Helper functions for common operations
- ✅ No external runtime dependencies (Node.js 18+)

## Requirements

- Node.js 18 or higher
- TypeScript 5.3 or higher (for development)

## Error Handling

The SDK throws typed errors that include full API context:

```typescript
import { APIRequestError, NetworkError, TimeoutError } from '@the_ro_show/agent-ads-sdk';

try {
  const unit = await client.decide(request);
} catch (error) {
  if (error instanceof APIRequestError) {
    console.error(`API Error [${error.statusCode}]: ${error.errorCode}`);
    console.error(`Message: ${error.message}`);
    console.error(`Request ID: ${error.requestId}`);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  }
}
```

## License

MIT
