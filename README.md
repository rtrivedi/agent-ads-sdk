# AttentionMarket - Monetize Your AI Agent

[![npm version](https://badge.fury.io/js/@the_ro_show%2Fagent-ads-sdk.svg)](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Like Google AdSense, but for AI agents.** 3 lines of code, start earning.

✨ **Zero config** - AI auto-matches ads
💰 **$5-150 per click** - 70% revenue share
🚀 **2-minute setup** - Just pass messages
🎯 **10-15% CTR** - High-intent, contextual ads

---

## Get Started in 2 Minutes

### 1. Get Your API Key (30 seconds)

Visit **[attentionmarket.com/signup](https://attentionmarket.com/signup)** - Free forever, no credit card

You'll receive:
- Test key: `am_test_...` (for development)
- Live key: `am_live_...` (for production)

### 2. Install (10 seconds)

```bash
npm install @the_ro_show/agent-ads-sdk
```

### 3. Add 3 Lines of Code (60 seconds)

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

// Setup (one time)
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: 'your_agent_id'
});

// Get an ad (that's it!)
const ad = await client.decideFromContext({
  userMessage: "I need car insurance"
});

if (ad) {
  console.log(`${ad.creative.title} - ${ad.creative.body}`);
  // User clicks → You earn $20-50!
}
```

**That's it!** You're earning money. No taxonomies to learn, no ad targeting to configure.

---

## How It Works

**1. User asks your agent a question**
```
"I need help with estate planning"
```

**2. You pass it to us** (one line of code)
```typescript
const ad = await client.decideFromContext({ userMessage });
```

**3. We return a relevant ad** (AI-powered matching)
```
"Estate Planning Services - Get expert help with wills and trusts"
```

**4. User clicks → You earn money**
```
$50-150 per click for legal services
```

**No categories to learn. No targeting to configure. Just works.**

---

## Complete Working Example

Here's everything you need - setup, get ad, show ad, track revenue:

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

// 1. Setup (one time, at app startup)
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: 'your_agent_id'  // Get this from signup
});

// 2. When user asks a question, get a relevant ad
async function handleUserMessage(userMessage: string) {
  const ad = await client.decideFromContext({ userMessage });

  if (!ad) {
    return null;  // No ads available - show normal response
  }

  // 3. Show the ad to user
  console.log(`\n💰 [Sponsored] ${ad.disclosure.sponsor_name}`);
  console.log(`${ad.creative.title}`);
  console.log(`${ad.creative.body}`);
  console.log(`→ ${ad.creative.cta}\n`);

  // 4. When user clicks, track it (this is how you get paid!)
  await client.trackClick({
    agent_id: 'your_agent_id',
    request_id: ad.request_id,
    decision_id: ad.offer_id,  // Same as offer_id for new APIs
    unit_id: ad.offer_id,
    tracking_token: ad.tracking_token,
    href: ad.click_url
  });

  return ad;
}

// Example usage
await handleUserMessage("I need car insurance");
await handleUserMessage("I want to hire a divorce lawyer");
await handleUserMessage("How do I invest in stocks?");
```

**That's 12 lines of actual code.** Everything else is comments and formatting.

---

## What You Don't Need to Know

❌ **No taxonomy systems to learn** - We auto-match with AI
❌ **No ad targeting to configure** - Semantic matching handles it
❌ **No auction bidding to manage** - We optimize for you
❌ **No advertiser relationships** - We have 100+ campaigns ready
❌ **No payment processing** - Paid monthly via Stripe

**You just pass messages and show ads. We handle everything else.**


## What You Can Do

### 🚀 Get Ads (The Only API You Need)

#### `decideFromContext()` - AI-powered ad matching
**This is the main API.** Just pass any user message and we'll automatically find relevant ads using AI. No categories, no taxonomies, no configuration. **90% of developers only use this.**

```typescript
const ad = await client.decideFromContext({
  userMessage: "I need help with estate planning"
});

if (ad) {
  console.log(ad.creative.title);   // "Estate Planning Services"
  console.log(ad.creative.body);    // "Get expert help with wills and trusts"
  console.log(ad.creative.cta);     // "Get Free Consultation"
}
```

**What it does:**
- Analyzes the user's message with AI
- Finds the best matching ad from 100+ campaigns
- Returns ad creative ready to show
- Works with ANY message - no category knowledge required

**Optional parameters:**
```typescript
const ad = await client.decideFromContext({
  userMessage: "I'm so tired...",
  conversationHistory: ["How was work?", "Exhausting"],  // More context = better matching
  context: { geo: { city: 'NYC', country: 'US' } }       // Location targeting
});
```

---

### 💰 Track Revenue (Required to Get Paid)

#### `trackClick()` - Record when users click ads
**Call this when a user clicks an ad** - this is how you earn money. Automatically deduplicates and handles retries.

```typescript
await client.trackClick({
  agent_id: 'your_agent_id',
  request_id: ad.request_id,
  decision_id: ad.offer_id,
  unit_id: ad.offer_id,
  tracking_token: ad.tracking_token,
  href: ad.click_url
});
```

**That's it!** The click is recorded and you'll get paid $5-150 depending on the category.

---

### 🧪 Testing

#### `MockAttentionMarketClient` - Test without real API calls
Perfect for unit tests and local development. Returns fake ads instantly.

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

## What Categories Have Ads?

**You don't need to memorize these!** Use `decideFromContext()` and we'll automatically match to the best available ads.

But if you're curious, here are our top categories with active advertisers:

| Category | Cost Per Click | Example Queries |
|----------|---------------|-----------------|
| 💰 **Legal** | $50-150 | Divorce, estate planning, personal injury, immigration |
| 🏥 **Insurance** | $20-54 | Auto, home, life, health insurance |
| 💳 **Financial** | $15-50 | Loans, credit cards, investing, mortgages |
| 🏢 **B2B SaaS** | $10-100 | CRM, project management, ecommerce platforms |
| 🏠 **Home Services** | $5-30 | Moving, cleaning, plumbing, repairs |
| ✈️ **Travel** | $3-20 | Flights, hotels, vacation packages |
| 🛍️ **Shopping** | $2-15 | Ecommerce, retail, subscriptions |
| 🎓 **Education** | $10-50 | Online courses, degrees, certifications |

**Don't see your category?** No problem!
- ✅ Use `decideFromContext()` and we'll find the closest match
- ✅ Email us at support@attentionmarket.com to request new categories
- ✅ New advertiser categories added weekly

<details>
<summary><strong>View detailed taxonomy reference (advanced users only)</strong></summary>

<br>

**Full taxonomy list:** [TAXONOMY_SYSTEM.md](./TAXONOMY_SYSTEM.md)

Example taxonomies for advanced `decide()` API:
```typescript
// Insurance
'insurance.auto.full_coverage.quote'
'insurance.auto.liability.compare'
'insurance.home.standard.quote'
'insurance.life.term.compare'

// Legal
'legal.personal_injury.accident.consultation'
'legal.family.divorce.consultation'
'legal.estate_planning.will.consultation'

// Financial
'financial.loans.personal.quote'
'financial.credit_cards.rewards.compare'
'financial.investing.brokerage.trial'

// B2B SaaS
'business.saas.crm.trial'
'business.saas.project_management.trial'

// Home Services
'home_services.moving.local.quote'
'home_services.plumbing.emergency.quote'
```

</details>

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
