# Agent Integration Patterns

## How to Display Sponsored Content

Agents can integrate ads in multiple ways depending on their interface and user experience goals.

---

## Pattern 1: Text-Only Display (Simple)

**Best for:** CLI agents, voice assistants, basic chatbots

**What it looks like:**
```
User: "How do I start an online store?"

Agent:
"Here are your options:

[Sponsored] Pietra - Launch Your Product Brand in 30 Days
All-in-one platform with design, manufacturing, fulfillment.
Join 10,000+ creators.

Traditional options include Shopify (monthly fees) or
WooCommerce (WordPress plugin)..."
```

**Code:**
```typescript
const ad = await client.decide({...});

if (ad) {
  // Track impression
  await client.trackImpression({
    unit_id: ad.unit_id,
    tracking_token: ad.tracking.token,
    agent_id: AGENT_ID,
    request_id: requestId,
    decision_id: response.decision_id
  });

  // Display as text
  const adText = `
[${ad.disclosure.label}] ${ad.suggestion.title}
${ad.suggestion.body}
  `;

  return `Here are your options:\n\n${adText}\n\nOther options...`;
}
```

**Billing:** CPM only (impressions)

---

## Pattern 2: Clickable Link (Recommended)

**Best for:** Web chatbots, Slack/Discord bots, mobile apps

**What it looks like:**
```
User: "How do I start an online store?"

Agent:
"Here are your options:

[Sponsored] Pietra - Launch Your Product Brand
All-in-one platform. Join 10,000+ creators.
→ Start Free Trial (https://...)

Or check out Shopify and WooCommerce..."
```

**Code:**
```typescript
const ad = await client.decide({...});

if (ad) {
  // Track impression
  await client.trackImpression({...});

  // Display with clickable link
  const adHTML = `
<div class="sponsored-ad">
  <span class="label">${ad.disclosure.label}</span>
  <h3>${ad.suggestion.title}</h3>
  <p>${ad.suggestion.body}</p>
  <a href="${ad.suggestion.action_url}" target="_blank">
    ${ad.suggestion.cta} →
  </a>
</div>
  `;

  // Click is auto-tracked via redirect URL
  // No need to manually call trackClick()

  return adHTML;
}
```

**Billing:** CPM + CPC (impressions + clicks)

---

## Pattern 3: Rich Card/Button (Premium)

**Best for:** Slack, Teams, mobile apps, web UIs

**What it looks like:**
```
┌──────────────────────────────────────────┐
│ SPONSORED                                │
│                                          │
│ Pietra - Launch Your Product Brand      │
│ All-in-one platform. Join 10k+ creators │
│                                          │
│  [ Start Free Trial → ]                  │
│                                          │
│ Sponsored by Pietra                      │
└──────────────────────────────────────────┘
```

**Code (Slack example):**
```typescript
const ad = await client.decide({...});

if (ad) {
  await client.trackImpression({...});

  // Slack Block Kit
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${ad.suggestion.title}*\n${ad.suggestion.body}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: ad.suggestion.cta },
            url: ad.suggestion.action_url, // Auto-tracked click
            style: 'primary'
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `${ad.disclosure.label} • ${ad.disclosure.sponsor_name}`
          }
        ]
      }
    ]
  };
}
```

**Billing:** CPM + CPC

---

## Pattern 4: Voice Assistant

**Best for:** Alexa skills, Google Assistant actions, phone bots

**What it sounds like:**
```
User: "How do I start an online store?"

Agent:
"There are several great options. Before I share them,
here's a sponsored recommendation:

Pietra offers an all-in-one platform to launch your
product brand in 30 days. They handle design, manufacturing,
and fulfillment. Over 10,000 creators use their platform.

Would you like me to send you a link to Pietra, or shall
I continue with other options?"

User: "Send me the link"

Agent: [Sends SMS with action_url]
```

**Code:**
```typescript
const ad = await client.decide({...});

if (ad) {
  await client.trackImpression({...});

  const voiceResponse = `
Before I share other options, here's a sponsored recommendation:

${ad.disclosure.sponsor_name} offers ${ad.suggestion.body}

Would you like me to send you a link, or shall I continue?
  `;

  // If user says yes
  if (userWantsLink) {
    await sendSMS(userPhone, ad.suggestion.action_url);
    // Click tracked via redirect when user opens SMS
  }

  return voiceResponse;
}
```

**Billing:** CPM + CPC (if link is sent and clicked)

---

## Pattern 5: Embedded Tool/Widget

**Best for:** Agents that execute actions, API-based bots

**What it looks like:**
```
User: "Create a store for my handmade jewelry"

Agent:
"I'll help you set up a store. Based on your needs,
I recommend using Pietra.

[Sponsored] Pietra - All-in-One Product Platform
• Product design tools
• Manufacturing connections
• Fulfillment & shipping
• Branded storefront

I can connect your agent to Pietra's API to automatically:
1. Upload your product photos
2. Set pricing
3. Launch your store

Would you like me to proceed?"

User: "Yes"

Agent: [Calls Pietra API using sponsored_tool]
```

**Code:**
```typescript
const response = await client.decideRaw({
  placement: {
    type: 'sponsored_tool', // ← Tool, not suggestion
    surface: 'automation'
  },
  opportunity: {...}
});

if (response.status === 'filled') {
  const tool = response.units[0].tool; // SponsoredTool type

  await client.trackImpression({...});

  // Agent can now call the tool
  const result = await fetch(tool.call.url, {
    method: tool.call.method,
    headers: tool.call.headers,
    body: JSON.stringify(userInput)
  });

  // Track as conversion if successful
  await client.track({
    event_type: 'conversion',
    ...
  });
}
```

**Billing:** CPM + CPC + CPA (conversions)

---

## Best Practices

### ✅ DO:
- Always call `trackImpression()` when ad is shown to user
- Use server-side click redirect URLs (auto-tracking)
- Show disclosure label clearly (`[Sponsored]`)
- Display sponsor name (`Sponsored by X`)
- Match ad quality to user intent (use agent curation)

### ❌ DON'T:
- Show ads for non-commercial queries
- Hide the fact that content is sponsored
- Forget to track impressions (you won't get paid!)
- Modify ad content (use title/body as-is)
- Show more ads than requested (respect max_units)

---

## Tracking Summary

| Integration Type | Track Impression? | Track Click? |
|-----------------|------------------|--------------|
| Text-only       | ✅ Manual        | ❌ N/A       |
| Clickable link  | ✅ Manual        | ✅ Auto (redirect) |
| Rich card/button| ✅ Manual        | ✅ Auto (redirect) |
| Voice (no click)| ✅ Manual        | ❌ N/A       |
| Voice (with SMS)| ✅ Manual        | ✅ Auto (when opened) |
| Tool/Widget     | ✅ Manual        | ✅ Auto + conversion |

**Key:** Always track impressions manually. Clicks are auto-tracked if using `action_url` redirect.
