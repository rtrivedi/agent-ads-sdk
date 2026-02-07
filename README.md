# AttentionMarket Agent Ads SDK

[![npm version](https://badge.fury.io/js/@the_ro_show%2Fagent-ads-sdk.svg)](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

Ad network for AI agents. Pass user messages, get contextually relevant ads, earn revenue. Similar to AdSense but designed for conversational interfaces. It's time to start monetizing your AI agents!

- **70% revenue share** - You keep most of the earnings (I use the remaining 30% to onboard advertisers and support that ecosystem).
- **Simple integration** - One API call to get ads

---

## Quick Start

### 1. Get API Key

Sign up at [attentionmarket.com/signup](https://api.attentionmarket.ai/) to receive:
- Test key: `am_test_...`
- Live key: `am_live_...`
- Agent ID

### 2. Install

```bash
npm install @the_ro_show/agent-ads-sdk
```

### 3. Basic Usage

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: 'your_agent_id'
});

// Request an ad based on user message
const ad = await client.decideFromContext({
  userMessage: "I need car insurance"
});

if (ad) {
  console.log(ad.creative.title);
  console.log(ad.creative.body);
  console.log(ad.creative.cta);
}
```

---

## How It Works

1. User interacts with your agent: `"I need help with estate planning"`
2. You pass the message to `decideFromContext()`
3. We return a matching ad from our network
4. You display it and track clicks to earn revenue

The API handles intent detection and ad matching automatically.

---

## Complete Example

Full integration including ad retrieval, display, and click tracking:

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: 'your_agent_id'
});

async function handleUserMessage(userMessage: string) {
  const ad = await client.decideFromContext({ userMessage });

  if (!ad) {
    return null;  // No ads available
  }

  // Display ad (you can customize this)
  const displayMessage = `\n[Sponsored] ${ad.disclosure.sponsor_name}\n${ad.creative.title}\n${ad.creative.body}\n${ad.creative.cta}\n`;
  console.log(displayMessage);

  // Track click when user clicks
  await client.trackClick({
    agent_id: 'your_agent_id',
    request_id: ad.request_id,
    decision_id: ad.offer_id,
    unit_id: ad.offer_id,
    tracking_token: ad.tracking_token,
    href: ad.click_url,
    click_context: displayMessage  // What was actually shown to user
  });

  return ad;
}
```

---

## API Reference

### Primary API

#### `decideFromContext(params)` → `Promise <OfferResponse | null>`

Pass a user message and optionally conversation history. Returns a matching ad or null if no fill.

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need help with estate planning",
  conversationHistory: ["My father passed away recently"],  // Optional
  context: { geo: { city: 'NYC', country: 'US' } }          // Optional
});
```

Returns ad with:
- `creative.title` - Ad headline
- `creative.body` - Ad description
- `creative.cta` - Call to action
- `click_url` - URL to open on click
- `tracking_token` - Required for revenue tracking
- `disclosure` - Sponsor information

### Revenue Tracking

#### `trackClick(params)` → `Promise<void>`

Records user clicks for revenue attribution. Call this when a user clicks an ad. Handles deduplication and retries automatically.

**Required:** `click_context` - The actual message shown to the user. This helps optimize ad creative based on what converts.

```typescript
await client.trackClick({
  agent_id: 'your_agent_id',
  request_id: ad.request_id,
  decision_id: ad.offer_id,
  unit_id: ad.offer_id,
  tracking_token: ad.tracking_token,
  href: ad.click_url,
  click_context: "The message shown to user that they clicked"
});
```

### Testing

#### `MockAttentionMarketClient`

Mock client for testing without API calls. Simulates latency and fill rate behavior.

```typescript
import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new MockAttentionMarketClient({
  fillRate: 1.0,     // Always return ads (0.0 = never, 0.5 = 50% of time)
  latencyMs: 100,    // Simulate API latency
  verbose: true      // Log what's happening
});

// Works exactly like the real client
const ad = await client.decideFromContext({ userMessage: "test" });
```

---

## Advanced Features

<details>
<summary><strong>Click to view advanced APIs (most developers don't need these)</strong></summary>

<br>

The simple `decideFromContext()` API handles everything for 90% of use cases. But if you need more control:

### Manual Category Targeting

#### `decide()` - Specify exact categories
When you know the exact category, use manual taxonomy matching for deterministic results.

```typescript
const decision = await client.decide({
  request_id: crypto.randomUUID(),
  agent_id: 'your_agent_id',
  placement: { type: 'sponsored_suggestion' },
  opportunity: {
    intent: { taxonomy: 'insurance.auto.full_coverage.quote' },
    context: { country: 'US', language: 'en', platform: 'web' }
  }
});
```

See [TAXONOMY_SYSTEM.md](./TAXONOMY_SYSTEM.md) for all categories.

---

### 🌐 Intenture Network APIs (Agent-to-Agent)

#### `requestOffer()` - Intent-key based matching for high confidence scenarios
When you KNOW what the user wants (they said "order coffee" or "book lawyer"), use intent-keys like `coffee.purchase.delivery` for deterministic matching. Enables agent-to-agent coordination and revenue sharing.

```typescript
const offer = await client.requestOffer({
  placementId: 'order_card',
  intentKey: 'coffee.purchase.delivery',
  context: { geo: { city: 'SF', country: 'US' } }
});
```

#### `requestOfferFromContext()` - Semantic discovery for fuzzy intents
When you're NOT sure what they need (they said "I'm so tired"), pass the conversation and let semantic search find relevant offers. Auto-limits history to last 5 messages.

```typescript
const offer = await client.requestOfferFromContext({
  placementId: 'chat_suggestion',
  userMessage: "I'm so tired, long day at work...",
  conversationHistory: ["How was your day?", "Exhausting"],
  context: { geo: { city: 'NYC' } }
});
```

#### Revenue Share (Preview) - Track referrals between agents
If another agent sends users to you, include their agent_id to split revenue (0-50%). Currently in preview mode (logs only) - payouts activate Q2 2026. Think affiliate marketing for AI agents.

```typescript
const offer = await client.requestOffer({
  intentKey: 'legal.divorce.consultation',
  sourceAgentId: 'agt_referrer_123',  // Agent who sent the user
  revenueSharePct: 30,                 // Give them 30% of revenue
  // ... other params
});
```

---

### 🧠 Intent Detection

#### `detectIntent()` - Auto-detect where users are in their journey
Analyzes queries to determine if they're researching ("what is X?"), comparing ("X vs Y"), getting quotes ("how much?"), or ready to buy ("I want X"). Returns 'research', 'compare', 'quote', 'apply', 'support', or 'other'.

```typescript
detectIntent("What is car insurance?")        // → 'research'
detectIntent("Compare car insurance options") // → 'compare'
detectIntent("Get car insurance quote")       // → 'quote'
detectIntent("I want to buy car insurance")   // → 'apply'
```

#### `buildTaxonomy()` - Type-safe taxonomy builder
Constructs valid taxonomies like "insurance.auto.full_coverage.quote" with validation. Pass vertical, category, subcategory, and intent - it handles the formatting and catches errors.

```typescript
const taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', 'quote');
// → "insurance.auto.full_coverage.quote"
```

#### `suggestTaxonomies()` - Smart taxonomy recommendations
Pass a user query and get back 3-5 relevant taxonomy suggestions ranked by relevance. Great for when you're not sure which category to use.

```typescript
const suggestions = suggestTaxonomies("I need a lawyer for divorce");
// → ['legal.family.divorce.consultation', 'legal.family.custody.consultation']
```

#### Taxonomy Utilities
- `isValidTaxonomy(taxonomy)` - Validate taxonomy format
- `parseTaxonomy(taxonomy)` - Parse taxonomy into components
- `getBaseTaxonomy(taxonomy)` - Get taxonomy without intent
- `matchesTaxonomy(tax1, tax2)` - Check if taxonomies match
- `getVertical(taxonomy)` - Extract industry vertical

---

### 🎨 Response Formatting

#### `formatNatural()` - Convert ads into natural conversation
Transforms sponsored suggestions into conversational responses that feel native to your agent. Handles disclosure labels, CTA integration, and tone matching automatically.

```typescript
const formatted = formatNatural(ad, {
  tone: 'friendly',
  includeDisclosure: true
});
// → "I found a great option for you! [Sponsored: Lemonade]..."
```

#### `formatInlineMention()` - Subtle in-message placement
Weaves ads into your agent's response as natural mentions. Like "Btw, Lemonade offers great rates for new drivers [Sponsored]". Less intrusive than separate ad blocks.

```typescript
const mention = formatInlineMention(ad);
// → "Btw, Lemonade offers 20% off for new drivers [Sponsored]"
```

#### `validateAdFits()` - Check if ad matches conversation context
Before showing an ad, validate it fits the current conversation. Checks relevance, tone, and user intent to avoid jarring placements.

```typescript
const fits = validateAdFits(ad, conversationContext);
if (fits) {
  // Show the ad
}
```

---

### 📊 Event Tracking

#### `trackImpression()` - Log when users see an ad
Record that an ad was shown to a user. Required for billing and analytics. Include the unit_id and tracking token from the ad response.

```typescript
await client.trackImpression({
  agent_id: 'your_agent_id',
  request_id: decision.request_id,
  decision_id: decision.decision_id,
  unit_id: ad.unit_id,
  tracking_token: ad.tracking.token
});
```

#### `trackClick()` - Log when users click an ad
Record when users interact with ads. This is how you get paid. Automatically deduplicates to prevent double-charging.

**Required:** `click_context` - The actual message shown to the user that they clicked.

```typescript
await client.trackClick({
  agent_id: 'your_agent_id',
  request_id: decision.request_id,
  decision_id: decision.decision_id,
  unit_id: ad.unit_id,
  tracking_token: ad.tracking.token,
  href: ad.suggestion.action_url,
  click_context: 'The message shown to user when they clicked'
});
```

---

### 🛠️ Helper Utilities

#### `createOpportunity()` - Build opportunity objects easily
Helper to construct the opportunity payload for decide() calls. Handles defaults and validation.

```typescript
const opportunity = createOpportunity({
  taxonomy: 'insurance.auto.quote',
  country: 'US'
});
```

#### Security Helpers
- `escapeHTML(text)` - Sanitize ad content before rendering to prevent XSS attacks
- `sanitizeURL(url)` - Validate and sanitize URLs before opening

**Always sanitize ad content before displaying in web contexts!**

#### ID Generation
- `generateUUID()` - Create unique request IDs (crypto-secure randomness)
- `generateTimestamp()` - Generate timestamps that match our API requirements

---

### 🧪 Testing

#### `MockAttentionMarketClient` - Test without real API calls
Drop-in replacement that returns fake ads for testing. Simulates latency, errors, and no-fill scenarios. Perfect for unit tests and local development.

```typescript
import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new MockAttentionMarketClient({
  fillRate: 1.0,     // Always return ads
  latencyMs: 100,    // Simulate API latency
  verbose: true      // Log activity
});

// Works exactly like real client, but returns mock data
const decision = await client.decide(request);
```

---

### ⚠️ Error Handling

#### `APIRequestError` - API returned an error response
Thrown when the backend rejects your request (invalid key, bad params, etc). Includes detailed error message and request_id for debugging.

#### `NetworkError` - Connection failed
Network issues, DNS failures, or backend unavailable. Includes automatic retry logic for transient failures.

#### `TimeoutError` - Request exceeded timeout
Request took too long (default 5s). Configure with `timeoutMs` in constructor.

```typescript
try {
  const decision = await client.decide(request);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out, try again');
  } else if (error instanceof NetworkError) {
    console.log('Network issue, retrying...');
  } else if (error instanceof APIRequestError) {
    console.log('API error:', error.message);
  }
}
```

</details>

---

## Using Test vs Live Keys

### Test Environment
Use your test key for development:
```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_TEST_KEY  // am_test_...
});
```

### Production Environment
Use your live key for production:
```typescript
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY  // am_live_...
});
```

---

## Security

### Server-Side Only

**IMPORTANT:** This SDK must run server-side. Never expose your API key in client-side code.

**✅ Supported:**
- Node.js servers
- Serverless functions (AWS Lambda, Vercel, Cloudflare Workers)
- Server-side rendering (Next.js, Remix)

**❌ Not supported:**
- Browser JavaScript
- Client-side React/Vue/Angular
- Mobile apps

### API Key Management

Store your API key in environment variables:

```bash
export ATTENTIONMARKET_API_KEY=am_live_...
```

Never commit API keys to version control. Add to `.gitignore`:

```
.env
.env.local
```

### Sanitize Ad Content

Ad content comes from third-party advertisers. Always sanitize before rendering in HTML:

```typescript
import { escapeHTML, sanitizeURL } from '@the_ro_show/agent-ads-sdk';

const safeTitle = escapeHTML(ad.creative.title);
const safeURL = sanitizeURL(ad.click_url);

if (safeURL) {
  element.innerHTML = `<a href="${safeURL}">${safeTitle}</a>`;
}
```

---

## Examples

**Minimal integrations** (< 80 lines):
- [Claude Tool Use](./examples/claude-tool-use-minimal.ts)
- [OpenAI Function Calling](./examples/openai-function-calling-minimal.ts)
- [Google Gemini](./examples/gemini-function-calling-minimal.ts)

**Full integrations** (production-ready):
- [Claude Complete](./examples/claude-tool-use-full.ts)
- [OpenAI Complete](./examples/openai-function-calling-full.ts)
- [Safe Web Rendering](./examples/safe-web-rendering.ts)

Run any example:
```bash
npx tsx examples/claude-tool-use-minimal.ts
```

---

## Features

- ✅ **Hierarchical matching** - Advertisers target broadly, agents match specifically
- ✅ **Auto-intent detection** - Automatically detect research vs quote vs apply
- ✅ **50+ high-value taxonomies** - Insurance, legal, finance, B2B SaaS, and more
- ✅ **TypeScript support** - Full type definitions included
- ✅ **Automatic retries** - Exponential backoff for failed requests
- ✅ **Mock client** - Test without API calls
- ✅ **Security helpers** - XSS protection, URL sanitization
- ✅ **Zero dependencies** - No external runtime dependencies

---

## Requirements

- Node.js 18 or higher
- TypeScript 5.3+ (for development)

---

## Support

- **Issues:** [GitHub Issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Email:** support@attentionmarket.com

---

## License

MIT
