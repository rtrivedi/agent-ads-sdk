---
sidebar_position: 2
title: Quickstart
---

# 5-Minute Quickstart

Get AttentionMarket integrated in your AI application in just 5 minutes. This guide will walk you through installation, authentication, and your first ad request.

## Prerequisites

- Node.js 18.0.0 or higher
- An AI application (chatbot, assistant, agent, etc.)
- 5 minutes of your time

## Step 1: Get Your API Keys

First, sign up for free at [developers.attentionmarket.ai](https://developers.attentionmarket.ai) to get your credentials:

```yaml
API Key: am_test_abc123...  # For testing
Agent ID: agt_xyz789...      # Your unique identifier
```

:::tip
Start with test keys (`am_test_`) during development. Switch to live keys (`am_live_`) when ready for production.
:::

## Step 2: Install the SDK

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
npm install @the_ro_show/agent-ads-sdk
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn add @the_ro_show/agent-ads-sdk
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add @the_ro_show/agent-ads-sdk
```

</TabItem>
</Tabs>

## Step 3: Initialize the Client

Create a new file or add to your existing code:

```typescript title="app.ts"
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});
```

:::warning Security
Never hardcode API keys in your source code. Use environment variables:

```bash title=".env"
ATTENTION_MARKET_API_KEY=am_test_your_key_here
ATTENTION_MARKET_AGENT_ID=agt_your_agent_id_here
```
:::

## Step 4: Request Your First Ad

Here's a complete example of requesting and displaying an ad:

```typescript title="example.ts"
async function handleUserMessage(userMessage: string) {
  // 1. Generate your AI response
  const aiResponse = await generateAIResponse(userMessage);

  // 2. Request a contextual ad
  const ad = await client.decideFromContext({
    userMessage,
    placement: 'sponsored_suggestion'
  });

  // 3. Display both to the user
  if (ad) {
    return {
      ai_response: aiResponse,
      sponsored_content: {
        label: "Sponsored",
        title: ad.creative.title,
        body: ad.creative.body,
        cta: ad.creative.cta,
        url: ad.click_url,  // Auto-tracked URL
        sponsor: ad.disclosure.sponsor_name
      }
    };
  }

  return { ai_response: aiResponse };
}

// Example usage
const result = await handleUserMessage("I need car insurance");
console.log(result);
```

:::warning REVENUE REQUIREMENT
Always use `decideFromContext()` to automatically track impressions. **Without impression tracking, clicks will not generate revenue.** The SDK handles this automatically—no additional code needed.
:::

## Step 5: Display the Ad

How you display the ad depends on your platform:

<Tabs>
<TabItem value="web" label="Web/React" default>

```jsx title="AdComponent.jsx"
function SponsoredContent({ ad }) {
  if (!ad) return null;

  return (
    <div className="sponsored-card">
      <span className="sponsored-label">Sponsored</span>
      <h3>{ad.title}</h3>
      <p>{ad.body}</p>
      <a href={ad.url} className="cta-button">
        {ad.cta} →
      </a>
      <small>by {ad.sponsor}</small>
    </div>
  );
}
```

</TabItem>
<TabItem value="cli" label="CLI/Terminal">

```typescript title="cli-display.ts"
function displayAd(ad: any) {
  if (!ad) return;

  console.log('\n┌─ Sponsored ─────────────────────┐');
  console.log(`│ ${ad.creative.title}`);
  console.log(`│ ${ad.creative.body}`);
  console.log(`│ → ${ad.creative.cta}`);
  console.log(`│ ${ad.click_url}`);
  console.log(`└─ by ${ad.disclosure.sponsor_name} ──┘\n`);
}
```

</TabItem>
<TabItem value="discord" label="Discord Bot">

```typescript title="discord-bot.ts"
import { EmbedBuilder } from 'discord.js';

function createAdEmbed(ad: any) {
  if (!ad) return null;

  return new EmbedBuilder()
    .setTitle(ad.creative.title)
    .setDescription(ad.creative.body)
    .addFields({
      name: ad.creative.cta,
      value: `[Click Here](${ad.click_url})`
    })
    .setFooter({
      text: `Sponsored by ${ad.disclosure.sponsor_name}`
    })
    .setColor('#4F46E5');
}
```

</TabItem>
</Tabs>

## Complete Working Example

Here's a full Node.js example you can run right now:

```typescript title="quickstart-demo.ts"
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize client
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

// Function to get relevant ad
async function getAd(userMessage: string) {
  try {
    const ad = await client.decideFromContext({
      userMessage,
      placement: 'sponsored_suggestion'
    });

    if (ad) {
      console.log('✅ Ad found!');
      console.log('Title:', ad.creative.title);
      console.log('Body:', ad.creative.body);
      console.log('CTA:', ad.creative.cta);
      console.log('Click URL:', ad.click_url);
      console.log('Payout:', ad.payout, 'cents');
      return ad;
    } else {
      console.log('ℹ️ No relevant ad available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// Test with different queries
async function runDemo() {
  console.log('Testing AttentionMarket SDK...\n');

  const queries = [
    "I need car insurance",
    "Looking for a wedding photographer",
    "How to start an online business",
    "Best credit cards for travel"
  ];

  for (const query of queries) {
    console.log(`\n📝 Query: "${query}"`);
    await getAd(query);
    console.log('─'.repeat(40));
  }
}

// Run the demo
runDemo();
```

To run this example:

```bash
# Save as quickstart-demo.ts
# Create .env file with your credentials
# Run the demo
npx tsx quickstart-demo.ts
```

## What's Next?

Congratulations! You've successfully integrated AttentionMarket. Here's what to explore next:

### Smart Context

Improve relevance with conversation context:

```typescript
const ad = await client.decideFromContext({
  userMessage: "Compare Shopify vs WooCommerce",
  conversationHistory: [
    "I want to start an online store",
    "What platform should I use?"
  ]
});

// SDK automatically detects:
// - Intent stage: 'comparison'
// - Interests: ['business', 'ecommerce']
// - Purchase intent: true
```

[Learn more about Smart Context →](/docs/smart-context)

### Advanced Filtering

Control what ads you show:

```typescript
const ad = await client.decideFromContext({
  userMessage,
  minQualityScore: 0.7,      // Only high-quality advertisers
  minPayout: 100,             // Minimum $1.00 per click
  blockedCategories: [601],   // Block sensitive content
  optimizeFor: 'revenue'      // Maximize earnings
});
```

[Learn about quality controls →](/docs/quality-relevance-explained)

### Analytics & Tracking

Track performance and optimize:

```typescript
// Automatic impression tracking
// Automatic click tracking via click_url

// Optional: Track conversions
await client.trackConversion(ad.tracking_token);
```

[Learn how pricing works →](/docs/pricing-earnings)

## Troubleshooting

<details>
<summary>Getting "Authentication failed" error?</summary>

Double-check your API key and agent ID:
- Make sure you're using the correct environment (test vs live)
- Verify the key starts with `am_test_` or `am_live_`
- Confirm your agent ID starts with `agt_`

</details>

<details>
<summary>No ads being returned?</summary>

This is normal! Ads are only shown when relevant:
- In test mode, fewer test campaigns may be available
- Try queries related to: insurance, travel, business, finance
- Switch to live keys for real ad inventory

</details>

<details>
<summary>How do I test without making real money?</summary>

Use test keys (`am_test_`) during development:
- Returns realistic test ads
- No real charges to advertisers
- No real revenue generated
- Same API behavior as production

</details>

## Support

Need help? We're here:

- **GitHub**: [Open an issue](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Docs**: [Full documentation](https://docs.attentionmarket.ai)