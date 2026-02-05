# 🤖 Developer Integration Guide
## How to Use AttentionMarket SDK in Your AI Agent

---

## Overview: You Control Everything

As an agent developer, **YOU decide:**
- ✅ **When** to request ads (e.g., after answering e-commerce questions)
- ✅ **Where** to display ads (chat, tool list, search results)
- ✅ **What context** to provide (user intent/taxonomy)
- ✅ **How** to render ads (UI/UX design)
- ✅ **Whether** to show ads at all (business logic)

The SDK provides ads, you decide what to do with them.

---

## Step-by-Step Integration

### Step 1: Initialize SDK

```typescript
import { AttentionMarketClient, createOpportunity } from '@the_ro_show/agent-ads-sdk';

// In your agent startup
const adClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY, // am_test_... or am_live_...
});
```

### Step 2: Decide WHEN to Request Ads

**Example scenarios:**

#### Scenario A: After Answering User Questions
```typescript
async function handleUserQuery(userQuery: string) {
  // 1. Process user query with your AI
  const aiResponse = await yourAI.respond(userQuery);

  // 2. Determine user intent
  const intent = classifyIntent(userQuery);
  // e.g., "how to start an online store" → "shopping.ecommerce.platform"

  // 3. Request relevant ad (if intent is commercial)
  let sponsoredSuggestion = null;
  if (isCommercialIntent(intent)) {
    sponsoredSuggestion = await adClient.decide({
      request_id: generateUUID(),
      agent_id: 'agt_YOUR_AGENT_ID',
      placement: {
        type: 'sponsored_suggestion',
        surface: 'chat_response'
      },
      opportunity: createOpportunity({
        taxonomy: intent.taxonomy, // e.g., "shopping.ecommerce.platform"
        country: userContext.country,
        language: userContext.language,
        platform: 'ios',
        query: userQuery,
      }),
    });
  }

  // 4. Return both AI response + optional ad
  return {
    aiResponse,
    sponsoredSuggestion, // null or ad unit
  };
}
```

#### Scenario B: Proactive Tool Suggestions
```typescript
async function suggestTools(userContext: Context) {
  // Request sponsored tools when user is in "tool discovery" mode
  const ad = await adClient.decide({
    request_id: generateUUID(),
    agent_id: 'agt_YOUR_AGENT_ID',
    placement: { type: 'sponsored_tool', surface: 'tool_picker' },
    opportunity: createOpportunity({
      taxonomy: 'business.productivity.tools',
      country: userContext.country,
      language: 'en',
      platform: 'web',
    }),
  });

  return ad;
}
```

#### Scenario C: Search Results
```typescript
async function searchWithAds(query: string) {
  // Your organic search results
  const organicResults = await yourSearchEngine.search(query);

  // Request ad to blend into results
  const sponsoredResult = await adClient.decide({
    request_id: generateUUID(),
    agent_id: 'agt_YOUR_AGENT_ID',
    placement: { type: 'sponsored_suggestion', surface: 'search_results' },
    opportunity: createOpportunity({
      taxonomy: extractTaxonomy(query),
      country: 'US',
      language: 'en',
      platform: 'web',
      query,
    }),
  });

  // Insert ad at position 3 (or wherever you want)
  return {
    results: [
      ...organicResults.slice(0, 2),
      sponsoredResult, // Clearly labeled as "Sponsored"
      ...organicResults.slice(2),
    ],
  };
}
```

### Step 3: Decide HOW to Render Ads

**Example: iOS Chat Interface**

```swift
// Swift example (you'd call your Node.js backend that uses the SDK)
struct ChatMessage {
    let text: String
    let sponsoredSuggestion: AdUnit?
}

struct ChatView: View {
    let message: ChatMessage

    var body: some View {
        VStack(alignment: .leading) {
            // AI response
            Text(message.text)

            // Sponsored suggestion (if present)
            if let ad = message.sponsoredSuggestion {
                SponsoredSuggestionView(ad: ad)
                    .onAppear {
                        // Track impression when ad appears
                        trackImpression(ad)
                    }
            }
        }
    }
}

struct SponsoredSuggestionView: View {
    let ad: AdUnit

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Disclosure (required)
            HStack {
                Text(ad.disclosure.label) // "Sponsored"
                    .font(.caption)
                    .foregroundColor(.gray)
                Text("·")
                Text(ad.disclosure.sponsor_name) // "Pietra Inc"
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            // Ad content
            Text(ad.suggestion.title)
                .font(.headline)
            Text(ad.suggestion.body)
                .font(.body)

            // Call to action
            Button(ad.suggestion.cta) {
                // Track click
                trackClick(ad)
                // Open URL
                openURL(ad.suggestion.action_url)
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}
```

**Example: Terminal/CLI Agent**

```typescript
function renderChatResponse(response: string, ad: AdUnit | null) {
  console.log('\n' + response + '\n');

  if (ad && ad.unit_type === 'sponsored_suggestion') {
    console.log('─────────────────────────────────');
    console.log(`📌 ${ad.disclosure.label} · ${ad.disclosure.sponsor_name}`);
    console.log(`\n${ad.suggestion.title}`);
    console.log(ad.suggestion.body);
    console.log(`\n👉 ${ad.suggestion.cta}: ${ad.suggestion.action_url}`);
    console.log('─────────────────────────────────\n');

    // Track impression
    trackImpression(ad);
  }
}
```

### Step 4: Decide WHAT Context to Provide (Taxonomy Mapping)

**Taxonomy** = User intent category that matches advertiser targeting.

**Your job:** Map user queries/actions to taxonomies.

```typescript
function classifyIntent(userQuery: string): { taxonomy: string } {
  // Simple keyword matching (or use ML classifier)
  const query = userQuery.toLowerCase();

  // E-commerce related
  if (query.includes('online store') || query.includes('ecommerce')) {
    return { taxonomy: 'shopping.ecommerce.platform' };
  }

  // Moving/relocation related
  if (query.includes('movers') || query.includes('moving company')) {
    return { taxonomy: 'local_services.movers.quote' };
  }

  // Productivity tools
  if (query.includes('productivity') || query.includes('project management')) {
    return { taxonomy: 'business.productivity.tools' };
  }

  // Travel
  if (query.includes('hotel') || query.includes('flight')) {
    return { taxonomy: 'travel.booking.hotels' };
  }

  // Default: no clear commercial intent
  return { taxonomy: 'general.information' };
}

// Later, when requesting ad:
const intent = classifyIntent(userQuery);
const ad = await adClient.decide({
  // ... other params
  opportunity: createOpportunity({
    taxonomy: intent.taxonomy, // This matches advertiser targeting!
    // ...
  }),
});
```

### Step 5: Track Events (Required)

**You MUST track impressions and clicks:**

```typescript
async function trackImpression(ad: AdUnit, context: RequestContext) {
  await adClient.trackImpression({
    agent_id: 'agt_YOUR_AGENT_ID',
    request_id: context.request_id,
    decision_id: context.decision_id,
    unit_id: ad.unit_id,
    tracking_token: ad.tracking.token,
  });
}

async function trackClick(ad: AdUnit, context: RequestContext) {
  await adClient.trackClick({
    agent_id: 'agt_YOUR_AGENT_ID',
    request_id: context.request_id,
    decision_id: context.decision_id,
    unit_id: ad.unit_id,
    tracking_token: ad.tracking.token,
  });
}
```

---

## Complete Example: iOS Agent Backend

```typescript
import express from 'express';
import { AttentionMarketClient, createOpportunity, generateUUID } from '@the_ro_show/agent-ads-sdk';

const app = express();
const adClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { message, userId, country, language } = req.body;

  // 1. Generate AI response
  const aiResponse = await yourAI.respond(message);

  // 2. Classify user intent
  const intent = classifyIntent(message);

  // 3. Request ad if commercial intent
  let ad = null;
  let adContext = null;

  if (isCommercialIntent(intent)) {
    const request_id = generateUUID();

    const decision = await adClient.decideRaw({
      request_id,
      agent_id: 'agt_YOUR_AGENT_ID',
      placement: { type: 'sponsored_suggestion', surface: 'chat_response' },
      opportunity: createOpportunity({
        taxonomy: intent.taxonomy,
        country,
        language,
        platform: 'ios',
        query: message,
      }),
    });

    if (decision.status === 'filled') {
      ad = decision.units[0];
      adContext = {
        request_id,
        decision_id: decision.decision_id,
      };
    }
  }

  // 4. Return response to iOS app
  res.json({
    aiResponse,
    sponsoredSuggestion: ad,
    adContext, // iOS will use this to track impression/click
  });
});

// iOS calls this when ad is displayed
app.post('/api/track/impression', async (req, res) => {
  const { adContext, adUnitId, trackingToken } = req.body;

  await adClient.trackImpression({
    agent_id: 'agt_YOUR_AGENT_ID',
    request_id: adContext.request_id,
    decision_id: adContext.decision_id,
    unit_id: adUnitId,
    tracking_token: trackingToken,
  });

  res.json({ success: true });
});

// iOS calls this when user clicks ad
app.post('/api/track/click', async (req, res) => {
  const { adContext, adUnitId, trackingToken } = req.body;

  await adClient.trackClick({
    agent_id: 'agt_YOUR_AGENT_ID',
    request_id: adContext.request_id,
    decision_id: adContext.decision_id,
    unit_id: adUnitId,
    tracking_token: trackingToken,
  });

  res.json({ success: true });
});

app.listen(3000);
```

---

## Common Taxonomies (Examples)

Here are taxonomies you might use. You define the mapping based on your users' behavior:

### Shopping & E-commerce
- `shopping.ecommerce.platform` - Online store setup
- `shopping.online_store` - General online shopping
- `shopping.store_setup` - Business setup

### Local Services
- `local_services.movers.quote` - Moving companies
- `local_services.contractors.home` - Home contractors
- `local_services.cleaning` - Cleaning services

### Business Tools
- `business.software.ecommerce` - E-commerce software
- `business.productivity.tools` - Productivity apps
- `business.startup.tools` - Startup resources

### Travel
- `travel.booking.hotels` - Hotel bookings
- `travel.booking.flights` - Flight bookings
- `travel.experiences` - Activities/tours

**You can invent your own taxonomies!** Advertisers will target them.

---

## Business Rules (Your Decision)

**You control when NOT to show ads:**

```typescript
async function requestAdWithBusinessRules(userQuery: string, userContext: Context) {
  // Rule 1: Don't show ads to premium users
  if (userContext.isPremium) {
    return null;
  }

  // Rule 2: Don't show ads for sensitive topics
  if (isSensitiveTopic(userQuery)) {
    return null;
  }

  // Rule 3: Limit ad frequency (max 1 ad per 5 messages)
  if (getRecentAdCount(userContext.userId) >= 1) {
    return null;
  }

  // Rule 4: Only show ads during business hours
  if (!isBusinessHours(userContext.timezone)) {
    return null;
  }

  // OK to request ad
  return await adClient.decide({ /* ... */ });
}
```

---

## Summary: Your Control Points

| **What** | **You Decide** | **SDK Provides** |
|----------|----------------|------------------|
| **When** | After user query, in search results, proactively | Request/response API |
| **Where** | Chat, tool picker, search, sidebar | Placement types |
| **What** | Taxonomy based on user intent | Matched ads |
| **How** | UI design, colors, layout, positioning | Structured ad data |
| **Whether** | Business rules, premium users, frequency caps | Availability |

**You're in full control. The SDK just provides relevant ads when you ask.**

---

## Next Steps

1. **Map your user intents** to taxonomies
2. **Design your ad UI** (iOS, web, CLI, etc.)
3. **Implement tracking** (impressions + clicks)
4. **Test with Pietra campaign** (taxonomy: `shopping.ecommerce.platform`)
5. **Launch!** 🚀
