# AttentionMarket Agent Ads SDK

[![npm version](https://badge.fury.io/js/@the_ro_show%2Fagent-ads-sdk.svg)](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**The first ad network built for AI agents.** Monetize your AI agent with contextual, high-intent sponsored suggestions. Open source, transparent, developer-first.

- 🚀 **5-minute integration** - npm install + 5 lines of code
- 💰 **70% revenue share** - You keep the majority, we only win when you do
- 🎯 **10-15% CTR** - High-intent placements, not banner ads
- 🔓 **100% Open Source** - Audit every line, full transparency

## Quick Start

### 1. Get Your API Key

**Sign up at [attentionmarket.com/signup](https://attentionmarket.com/signup)** (30 seconds, free forever)

You'll receive:
- Test key: `am_test_...` (for development)
- Live key: `am_live_...` (for production)

### 2. Install

```bash
npm install @the_ro_show/agent-ads-sdk
```

### 3. Integrate (5 lines of code)

```typescript
import { AttentionMarketClient, detectIntent, buildTaxonomy } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY  // Your test or live key
});

// When your agent helps users, show relevant ads
const userQuery = "I need car insurance for my Honda";
const intent = detectIntent(userQuery);  // → "quote" or "compare" or "research"
const taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', intent);

const decision = await client.decide({
  request_id: crypto.randomUUID(),
  agent_id: 'your_agent_id',
  placement: { type: 'sponsored_suggestion' },
  opportunity: {
    intent: { taxonomy },  // "insurance.auto.full_coverage.quote"
    context: { country: 'US', language: 'en', platform: 'web' }
  }
});

if (decision.status === 'filled') {
  const ad = decision.units[0];
  console.log(`[Sponsored] ${ad.suggestion.title}`);
  // User clicks → You earn $5-50
}
```

**That's it!** Start earning from relevant ads.

---

## 🆕 What's New in v0.4.0

### Hierarchical Taxonomy Matching

Target broadly, match specifically:

```typescript
// Advertiser targets: "insurance.auto"
// Your agent requests: "insurance.auto.full_coverage.quote"
// ✅ Matches! (0.7 relevance score)

// Your agent requests: "insurance.auto.liability.compare"
// ✅ Also matches! (0.7 relevance score)

// Your agent requests: "insurance.home.flood.quote"
// ❌ No match (different category)
```

**Result:** 3x more ad inventory, higher fill rates.

### New Helper Functions

**Auto-detect user intent:**
```typescript
import { detectIntent } from '@the_ro_show/agent-ads-sdk';

detectIntent("What is car insurance?")           // → 'research'
detectIntent("Compare car insurance options")    // → 'compare'
detectIntent("Get car insurance quote")          // → 'quote'
detectIntent("I want to buy car insurance")      // → 'apply'
```

**Build taxonomies easily:**
```typescript
import { buildTaxonomy } from '@the_ro_show/agent-ads-sdk';

const taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', 'quote');
// → "insurance.auto.full_coverage.quote"
```

**Get taxonomy suggestions:**
```typescript
import { suggestTaxonomies } from '@the_ro_show/agent-ads-sdk';

const suggestions = suggestTaxonomies("I need a lawyer for divorce");
// → ['legal.family.divorce.consultation', 'legal.family.custody.consultation']
```

**Validate taxonomies:**
```typescript
import { isValidTaxonomy, parseTaxonomy } from '@the_ro_show/agent-ads-sdk';

isValidTaxonomy('insurance.auto.full_coverage.quote')  // → true
isValidTaxonomy('invalid.format')                      // → false

const parsed = parseTaxonomy('insurance.auto.full_coverage.quote');
// → { vertical: 'insurance', category: 'auto', subcategory: 'full_coverage', intent: 'quote' }
```

---

## Common Taxonomies

### Insurance ($20-54 CPC)
```typescript
'insurance.auto.full_coverage.quote'
'insurance.auto.liability.compare'
'insurance.home.standard.quote'
'insurance.life.term.compare'
'insurance.health.individual.quote'
```

### Legal ($50-150 CPC)
```typescript
'legal.personal_injury.accident.consultation'
'legal.family.divorce.consultation'
'legal.criminal.defense.consultation'
'legal.immigration.visa.consultation'
'legal.estate_planning.will.consultation'
```

### Financial Services ($15-50 CPC)
```typescript
'financial.loans.personal.quote'
'financial.loans.mortgage.compare'
'financial.credit_cards.rewards.compare'
'financial.investing.brokerage.trial'
```

### B2B SaaS ($10-100 CPC)
```typescript
'business.saas.crm.trial'
'business.saas.project_management.trial'
'business.ecommerce.platform.trial'
'business.saas.marketing_automation.trial'
```

### Home Services ($5-30 CPC)
```typescript
'home_services.moving.local.quote'
'home_services.cleaning.regular.book'
'home_services.plumbing.emergency.quote'
'home_services.remodeling.kitchen.quote'
```

**See all 50+ taxonomies:** [TAXONOMY_SYSTEM.md](./TAXONOMY_SYSTEM.md)

---

## Complete Example

```typescript
import {
  AttentionMarketClient,
  buildTaxonomy,
  detectIntent
} from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY
});

async function showRelevantAd(userQuery: string) {
  // 1. Detect what the user wants
  const intent = detectIntent(userQuery);

  // 2. Build taxonomy (or use your own logic)
  let taxonomy: string;
  if (/insurance|car|auto/i.test(userQuery)) {
    taxonomy = buildTaxonomy('insurance', 'auto', 'full_coverage', intent);
  } else if (/lawyer|legal|divorce/i.test(userQuery)) {
    taxonomy = buildTaxonomy('legal', 'family', 'divorce', 'consultation');
  } else {
    return null; // No relevant ads
  }

  // 3. Request ads
  const decision = await client.decide({
    request_id: crypto.randomUUID(),
    agent_id: 'your_agent_id',
    placement: { type: 'sponsored_suggestion' },
    opportunity: {
      intent: { taxonomy },
      context: {
        country: 'US',
        language: 'en',
        platform: 'web'
      }
    }
  });

  // 4. Show ad if available
  if (decision.status === 'filled') {
    const ad = decision.units[0];

    console.log(`\n[${ad.disclosure.label}] ${ad.disclosure.sponsor_name}`);
    console.log(ad.suggestion.title);
    console.log(ad.suggestion.body);
    console.log(`→ ${ad.suggestion.cta}\n`);

    // 5. Track impression (for billing)
    await client.trackImpression({
      agent_id: 'your_agent_id',
      request_id: decision.request_id,
      decision_id: decision.decision_id,
      unit_id: ad.unit_id,
      tracking_token: ad.tracking.token
    });

    // 6. Track click when user clicks (you earn money!)
    // await client.trackClick({ ... });

    return ad;
  }

  return null; // No ads available
}

// Example usage
await showRelevantAd("I need car insurance for my Honda");
await showRelevantAd("I need a divorce lawyer in California");
```

---

## SDK Capabilities

### 🎯 Core Ad Serving

#### `decide()` - Request contextual ads based on user intent
Get a sponsored suggestion when you know what the user wants. Pass a taxonomy (like "insurance.auto.quote") and we return a relevant ad with 70% revenue share. Think of it like Google AdSense, but built for conversational AI.

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

#### `decideFromContext()` - Get ads from natural conversation
Just pass the user's message and conversation history. Our semantic engine figures out what they need and returns the best ad. No taxonomy required - perfect for open-ended conversations.

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need help with estate planning",
  conversationHistory: ["My father passed away recently"],
  placement: 'sponsored_suggestion'
});
```

---

### 🌐 Intenture Network APIs (NEW in v0.5.0)

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

```typescript
await client.trackClick({
  agent_id: 'your_agent_id',
  request_id: decision.request_id,
  decision_id: decision.decision_id,
  unit_id: ad.unit_id,
  tracking_token: ad.tracking.token,
  href: ad.suggestion.action_url
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

### ⚠️ CRITICAL: Server-Side Only

**Never use this SDK in browsers or mobile apps.** Your API key has full access to your account.

✅ **Safe:** Node.js, serverless functions, server-side rendering
❌ **Unsafe:** Browser JavaScript, React/Vue components, mobile apps

### Sanitize Ad Content

Always escape ad content before rendering:

```typescript
import { escapeHTML, sanitizeURL } from '@the_ro_show/agent-ads-sdk';

const safeTitle = escapeHTML(ad.suggestion.title);
const safeURL = sanitizeURL(ad.suggestion.action_url);

if (safeURL) {
  element.innerHTML = `<a href="${safeURL}">${safeTitle}</a>`;
}
```

**See [SECURITY.md](./SECURITY.md) for complete guidelines.**

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

## Documentation

- **[Simple Integration Guide](./SIMPLE_INTEGRATION_GUIDE.md)** - Step-by-step for beginners
- **[Taxonomy System](./TAXONOMY_SYSTEM.md)** - Complete taxonomy reference
- **[Migration Guide](./TAXONOMY_MIGRATION_GUIDE.md)** - Upgrading from older versions
- **[Security Guide](./SECURITY.md)** - Security best practices
- **[Advertiser Guide](./ADVERTISER_ONBOARDING_GUIDE.md)** - For advertisers

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

## Pricing

**Free to use.** You earn money when users click ads:

- **Insurance:** $20-54 per click
- **Legal:** $50-150 per click
- **Financial:** $15-50 per click
- **B2B SaaS:** $10-100 per click
- **Home Services:** $5-30 per click

**You keep 70% of revenue.** Paid monthly via Stripe.

---

## Requirements

- Node.js 18 or higher
- TypeScript 5.3+ (for development)

---

## Support

- **Issues:** [GitHub Issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Docs:** [SIMPLE_INTEGRATION_GUIDE.md](./SIMPLE_INTEGRATION_GUIDE.md)
- **Email:** support@attentionmarket.com

---

## License

MIT

---

## Changelog

### v0.4.0 (2026-02-03)

**New Features:**
- ✨ Hierarchical taxonomy matching (3x more inventory)
- ✨ `buildTaxonomy()` helper function
- ✨ `detectIntent()` auto-intent detection
- ✨ `suggestTaxonomies()` get relevant taxonomies
- ✨ `isValidTaxonomy()` and `parseTaxonomy()` validators
- ✨ 50 Phase 1 high-value taxonomies (insurance, legal, finance, etc.)

**Improvements:**
- 🎯 Relevance scoring (1.0 → 0.9 → 0.7 → 0.5)
- 🔄 Backward compatibility for old taxonomies (90-day migration window)
- 📚 Complete taxonomy documentation

**Breaking Changes:**
- None! Fully backward compatible.

### v0.2.1

- Initial public release
- Multi-ad response support
- Mock client for testing
- Security helpers (escapeHTML, sanitizeURL)
