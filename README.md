# AttentionMarket

[![npm version](https://badge.fury.io/js/@the_ro_show%2Fagent-ads-sdk.svg)](https://www.npmjs.com/package/@the_ro_show/agent-ads-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**The ad exchange for the AI era. Monetize your chatbot, AI assistant, or AI agent with one API call.**

Works on every platform — iOS, Android, Web, Voice, Discord, WhatsApp, Node.js, Python, and anything else that can make an HTTP request.

---

## Two Ways To Earn

### 1. Show ads in your chatbot or AI assistant
Your app has conversations. Users ask questions. You send us the context, we return a relevant ad, you earn $5–$150 when the user clicks.

### 2. List your AI agent on the exchange
You built a specialized AI agent. Other AI agents need what you offer. List it on AttentionMarket and earn every time another agent calls yours.

---

## Quick Start — 30 Seconds

Get your API keys at [api.attentionmarket.ai](https://api.attentionmarket.ai), then:

```bash
curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide \
  -H "X-AM-API-Key: am_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"context": "I need car insurance"}'
```

**Response:**
```json
{
  "status": "filled",
  "units": [{
    "suggestion": {
      "title": "Get 20% off car insurance",
      "body": "Compare quotes in minutes",
      "cta": "Get a Quote",
      "tracking_url": "https://..."
    }
  }]
}
```

Show `suggestion.title` and `suggestion.body` to your user. When they click, send them to `tracking_url`. That's it — you get paid automatically.

---

## 🚨 CRITICAL: Impression Tracking Required (v0.9.0+)

**As of v0.9.0, impression tracking is REQUIRED to earn revenue from clicks.**

When you show an ad to a user, you must track an impression. Clicks without prior impressions will:
- ✅ Still redirect the user to the advertiser (good UX)
- ❌ NOT charge the advertiser
- ❌ NOT credit your earnings

### Why This Matters

This prevents developers from filtering ads client-side and still earning revenue from clicks. It ensures clean data and accurate quality metrics for the advertising exchange.

### Using `decideFromContext()` (Recommended)

**Good news:** If you're using the SDK's `decideFromContext()` method, impressions are tracked **automatically**. No changes needed.

```typescript
// Impressions tracked automatically ✅
const ad = await client.decideFromContext({
  userMessage: "I need car insurance",
  placement: 'sponsored_suggestion'
});

if (ad) {
  // Show ad to user
  displayAd(ad);
}
```

### Using Raw HTTP or `decide()` (Manual Tracking Required)

If you're making raw HTTP calls or using the low-level `decide()` method, you **must manually track impressions**:

```typescript
// Step 1: Get ad
const response = await fetch('https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide', {
  method: 'POST',
  headers: { 'X-AM-API-Key': 'am_live_...' },
  body: JSON.stringify({ context: 'I need car insurance' })
});
const data = await response.json();

if (data.status === 'filled') {
  const ad = data.units[0];

  // Step 2: Track impression IMMEDIATELY when showing ad ✅
  await fetch('https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/event', {
    method: 'POST',
    headers: { 'X-AM-API-Key': 'am_live_...' },
    body: JSON.stringify({
      event_id: `evt_${crypto.randomUUID()}`,
      event_type: 'impression',
      occurred_at: new Date().toISOString(),
      agent_id: 'YOUR_AGENT_ID',
      unit_id: ad.unit_id,
      tracking_token: ad.tracking.token
    })
  });

  // Step 3: Now safe to show ad and earn from clicks
  displayAd(ad);
}
```

---

## Use Case 1: Monetize Your Chatbot or AI Assistant

Any app with conversations can earn revenue. Users ask questions with commercial intent every day — insurance, legal help, home services, travel, weddings, software. When they do, you can surface a relevant offer and earn.

**Platforms this works on:**

| Type | Examples |
|------|---------|
| **AI Assistants** | Mobile AI apps, productivity tools, personal assistants |
| **Chatbots** | Website chat, customer service bots, FAQ bots |
| **Messaging Bots** | WhatsApp, Discord, Telegram, Slack |
| **Voice Assistants** | Alexa Skills, Google Actions, voice apps |
| **AI Companions** | Coaching bots, tutors, entertainment assistants |

### How It Works

```
User sends message → You call our API with context → We return a relevant ad
→ You show it → User clicks → You earn $5–$150
```

### Platform Examples

**iOS (Swift)** — drop this into your Xcode project:
```swift
// Initialize once
let client = AttentionMarketClient(
    apiKey: "am_live_YOUR_KEY",
    agentId: "agt_YOUR_ID"
)

// Call after your AI responds
if let ad = await client.getAd(for: userMessage) {
    showAdInChat(
        title: ad.suggestion.title,
        body: ad.suggestion.body,
        cta: ad.suggestion.cta,
        url: ad.suggestion.trackingUrl
    )
}
```
[Full iOS example →](./examples/ios/AttentionMarketClient.swift)

---

**Android (Kotlin)**:
```kotlin
val client = AttentionMarketClient(
    apiKey = "am_live_YOUR_KEY",
    agentId = "agt_YOUR_ID"
)

client.getAd(context = userMessage)?.let { ad ->
    showAdInChat(
        title = ad.suggestion.title,
        body = ad.suggestion.body,
        url = ad.suggestion.trackingUrl
    )
}
```
[Full Android example →](./examples/android/AttentionMarketClient.kt)

---

**Web (JavaScript)** — plain fetch, no dependencies:
```javascript
const response = await fetch('https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide', {
  method: 'POST',
  headers: {
    'X-AM-API-Key': 'am_live_YOUR_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ context: userMessage })
});

const data = await response.json();

if (data.status === 'filled') {
  const ad = data.units[0];
  showAdInChat(ad.suggestion.title, ad.suggestion.body, ad.suggestion.tracking_url);
}
```
[Full Web example →](./examples/web/attentionmarket.js)

---

**Node.js (optional SDK)**:
```bash
npm install @the_ro_show/agent-ads-sdk
```
```javascript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: process.env.ATTENTIONMARKET_AGENT_ID
});

const ad = await client.decideFromContext({ userMessage });
if (ad) console.log(ad.creative.title, ad.click_url);
```

---

## Use Case 2: List Your AI Agent on the Exchange

You built a specialized AI agent — a legal document drafter, a wedding photographer booker, a travel planner, a code reviewer. Other AI assistants encounter users who need exactly what you do every day. List your agent on AttentionMarket and earn every time another agent calls yours.

**This is the ad exchange for the agentic world.** Instead of humans clicking ads, AI agents discover and call specialized agents. You pay to be discovered. You earn when your agent gets used.

### How It Works

```
General assistant encounters a task it can't handle well
→ Calls AttentionMarket with context + response_type: "agent"
→ Exchange returns the best specialized agent for that task
→ General assistant calls your agent
→ You earn per call
```

### Example

**Developer A** built a general wedding planning AI assistant. A user asks: *"Can you find me a photographer in Austin under $3,000?"*

Developer A's assistant calls AttentionMarket:
```bash
curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide \
  -H "X-AM-API-Key: am_live_DEV_A_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "context": "User needs a wedding photographer in Austin under $3,000",
    "response_type": "agent"
  }'
```

**AttentionMarket returns Developer B's agent:**
```json
{
  "status": "filled",
  "units": [{
    "agent_name": "WeddingPhoto AI",
    "capability": "Book wedding photographers by location and budget",
    "endpoint": "https://weddingphoto.ai/api/v1",
    "input_description": "Send: location (string), budget (number), date (string)",
    "output_description": "Returns: photographer name, price, booking URL",
    "tracking": {
      "call_url": "https://.../track-call/token"
    }
  }]
}
```

**Developer A** calls WeddingPhoto AI, gets a result, passes it back to the user.
**Developer B** earns per call. **Developer A** earns a routing fee.

### List Your Agent

Sign up as an advertiser at [api.attentionmarket.ai](https://api.attentionmarket.ai) and create an **Agent Ad** campaign:

| Field | Description |
|-------|-------------|
| Agent Name | Display name (e.g. "WeddingPhoto AI") |
| What does your agent do? | Natural language capability description — used for matching |
| Endpoint URL | Where calling agents send requests |
| What to send | Input format description |
| What you return | Output format description |
| Bid per call | What you pay each time your agent is called |

**Matching is semantic** — describe your agent clearly in plain English and we handle the rest.

---

## Revenue Model

### As a Developer (showing ads or routing to agents)

- **70% revenue share** on every click or agent call you facilitate
- Earn $5–$150 per click for ads
- Earn a routing fee per agent-to-agent call
- Monthly payouts via Stripe (minimum $100 balance)
- Free to integrate — no setup fees, no monthly costs

**Example earnings:**

| Monthly clicks/calls | Avg payout | Monthly revenue |
|---------------------|------------|-----------------|
| 50 | $50 | $2,500 |
| 200 | $50 | $10,000 |
| 1,000 | $50 | $50,000 |

### As an Agent Advertiser (listing your agent)

- Pay per click (Link Ad) or pay per call (Agent Ad)
- Second-price auction — you bid a max, you often pay less
- Full budget controls — set a cap, campaign pauses when spent
- Track spend and performance in the advertiser dashboard

---

## API Reference

### `POST /v1/decide`

**Base URL:** `https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide`

**Required header:** `X-AM-API-Key: am_live_...` or `am_test_...`

### Simple Request (recommended)

```json
{
  "context": "I need car insurance"
}
```

### Simple Request with Optional Fields

```json
{
  "context": "I need car insurance",
  "country": "US",
  "language": "en",
  "platform": "ios"
}
```

### Request an Agent Instead of an Ad

```json
{
  "context": "User needs a wedding photographer in Austin",
  "response_type": "agent"
}
```

### Advanced Request (full control)

```json
{
  "request_id": "req_custom_123",
  "agent_id": "agt_YOUR_ID",
  "placement": "chat_inline",
  "opportunity": {
    "intent": { "taxonomy": "insurance.auto.quote" },
    "context": { "country": "US", "language": "en", "platform": "ios" }
  },
  "context": "I need car insurance"
}
```

### Response: Ad Filled

```json
{
  "request_id": "req_abc123",
  "decision_id": "dec_xyz789",
  "status": "filled",
  "ttl_ms": 300000,
  "units": [{
    "unit_id": "unit_123",
    "suggestion": {
      "title": "Get 20% off car insurance",
      "body": "Compare quotes in minutes",
      "cta": "Get a Quote",
      "tracking_url": "https://.../track-click/...",
      "action_url": "https://progressive.com/quote"
    },
    "tracking": {
      "token": "trk_abc",
      "impression_url": "https://.../event",
      "click_url": "https://.../click/trk_abc"
    }
  }]
}
```

### Response: No Fill

```json
{
  "status": "no_fill",
  "units": []
}
```

### Key Response Fields

| Field | Use |
|-------|-----|
| `status` | `"filled"` or `"no_fill"` |
| `suggestion.title` | Ad headline to show |
| `suggestion.body` | Ad description to show |
| `suggestion.cta` | Button text |
| `suggestion.tracking_url` | **Send users here on click** — tracks automatically |
| `suggestion.action_url` | Direct advertiser URL (display only, no tracking) |

**Always use `tracking_url` for clicks.** This is how clicks are tracked and how you get paid.

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success — check `status` field |
| `400` | Bad request — missing `context` field |
| `401` | Invalid API key |
| `429` | Rate limit exceeded (1,000 req/min) — retry after 60s |
| `500` | Server error — retry with backoff |

---

## Testing

Use your test key (`am_test_...`) during development — same API, no real money moves.

**Validate your setup:**
```bash
node test-integration.js      # Tests connectivity and credentials
node validate-production.js   # Full production readiness check (4/4 ✅)
```

Download: [test-integration.js](./test-integration.js) | [validate-production.js](./validate-production.js)

---

## Get Started

1. **Sign up** at [api.attentionmarket.ai](https://api.attentionmarket.ai) — get your test key, live key, and agent ID
2. **Test it** — run the curl above with your test key
3. **Integrate** — add 5 lines to your existing chatbot or assistant
4. **Go live** — swap test key for live key, start earning

---

## Support

- **Dashboard:** [api.attentionmarket.ai](https://api.attentionmarket.ai)
- **Issues:** [GitHub Issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Email:** support@attentionmarket.ai

---

## License

MIT — see [LICENSE](./LICENSE)
