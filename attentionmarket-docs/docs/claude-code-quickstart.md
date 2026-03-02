---
sidebar_position: 1.5
title: Claude Code Quick Start
---

# 5-Minute Integration with Claude Code

Get AttentionMarket integrated in under 5 minutes using Claude Code. Just paste your credentials and Claude handles the rest—framework detection, error handling, and testing included.

:::tip Why Claude Code?
Claude Code automatically detects your framework, generates production-ready code, and includes error handling. Most developers complete integration in under 5 minutes.
:::

## Prerequisites

Before you start, get your API credentials:

1. Visit [developers.attentionmarket.ai](https://developers.attentionmarket.ai)
2. Sign up (free)
3. Copy your credentials:
   - **API Key**: `am_test_abc123...`
   - **Agent ID**: `agt_xyz789...`

:::info
Start with test keys (`am_test_`) during development. Switch to live keys (`am_live_`) when ready for production.
:::

## One-Line Integration

Copy this prompt into Claude Code (replace with your actual credentials):

```
I want to integrate AttentionMarket SDK into my application.

Credentials:
- API Key: am_test_YOUR_KEY_HERE
- Agent ID: agt_YOUR_AGENT_ID_HERE

Requirements:
1. Auto-detect my framework from package.json
2. Install @the_ro_show/agent-ads-sdk
3. Set up environment variables securely (.env file)
4. Create a wrapper function that handles ads gracefully
5. Add error handling with graceful degradation
6. Only show ads when relevance score > 0.7
7. Include a test script to verify integration works

Generate complete, production-ready code with TypeScript.
```

## What Claude Code Will Do

Claude Code will automatically:

1. ✅ **Detect your framework** from `package.json`:
   - Next.js → API Route integration
   - Express → Middleware integration
   - Discord.js → Bot embed integration
   - React → Component integration
   - CLI → Terminal output integration

2. ✅ **Install the SDK**:
   ```bash
   npm install @the_ro_show/agent-ads-sdk
   ```

3. ✅ **Create `.env` file**:
   ```bash
   ATTENTION_MARKET_API_KEY=am_test_your_key_here
   ATTENTION_MARKET_AGENT_ID=agt_your_agent_id_here
   ```

4. ✅ **Generate wrapper function**:
   ```typescript
   async function getRelevantAd(userMessage: string) {
     try {
       const ad = await client.decideFromContext({
         userMessage,
         placement: 'sponsored_suggestion'
       });

       // Only return if relevance score > 0.7
       if (ad && ad.relevance_score && ad.relevance_score > 0.7) {
         return ad;
       }
       return null;
     } catch (error) {
       console.error('[AttentionMarket] Ad request failed:', error);
       return null; // Graceful degradation
     }
   }
   ```

5. ✅ **Create display component** (framework-specific)

6. ✅ **Generate test script**:
   ```typescript
   // test-integration.ts
   import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

   const testQueries = [
     "I need car insurance",
     "Starting an online store",
     "Random unrelated question"
   ];

   // Verifies integration works correctly
   ```

## Verification

After Claude Code generates the integration, run the test script:

```bash
npx tsx test-integration.ts
```

**Expected Output:**

```
🧪 Testing AttentionMarket Integration

✅ "I need car insurance"
   Ad: Get 20% off auto insurance
   Payout: $3.50
   Relevance: 0.89

✅ "Starting an online store"
   Ad: Shopify - Start your free trial
   Payout: $2.10
   Relevance: 0.85

ℹ️  "Random unrelated question" → No ad (expected for irrelevant queries)

🎉 Integration test complete!
```

## Test Queries

Use these queries to verify your integration works:

| Query | Expected Behavior | Typical Payout |
|-------|------------------|----------------|
| "I need car insurance" | Returns auto insurance ad | $2-8 per click |
| "Starting an online store" | Returns e-commerce platform ad | $1-5 per click |
| "Best credit cards" | Returns financial services ad | $5-15 per click |
| "Looking for a lawyer" | Returns legal services ad | $10-20 per click |
| "Random question" | Returns `null` (graceful) | N/A |

## Framework-Specific Examples

### What Claude Code Generates for Different Frameworks

<details>
<summary><b>Next.js App Router</b></summary>

```typescript title="app/api/chat/route.ts"
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

export async function POST(req: Request) {
  const { message } = await req.json();

  // Get AI response
  const aiResponse = await generateAIResponse(message);

  // Get contextual ad
  const ad = await amClient.decideFromContext({
    userMessage: message,
    placement: 'sponsored_suggestion'
  }).catch(() => null);

  return Response.json({ aiResponse, ad });
}
```

</details>

<details>
<summary><b>Express.js</b></summary>

```typescript title="middleware/ads.ts"
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

export async function injectAd(req, res, next) {
  try {
    req.sponsoredAd = await amClient.decideFromContext({
      userMessage: req.body.message,
      placement: 'sponsored_suggestion'
    });
  } catch (error) {
    req.sponsoredAd = null;
  }
  next();
}

// Usage: app.post('/chat', injectAd, handleChat);
```

</details>

<details>
<summary><b>Discord.js Bot</b></summary>

```typescript title="bot.ts"
import { Client, EmbedBuilder } from 'discord.js';
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const aiResponse = await getAIResponse(message.content);
  await message.reply(aiResponse);

  // Get and display ad
  const ad = await amClient.decideFromContext({
    userMessage: message.content
  }).catch(() => null);

  if (ad) {
    const embed = new EmbedBuilder()
      .setTitle(ad.creative.title)
      .setDescription(ad.creative.body)
      .setColor('#4F46E5')
      .addFields({
        name: ad.creative.cta,
        value: `[Click here](${ad.click_url})`
      })
      .setFooter({
        text: `Sponsored by ${ad.disclosure.sponsor_name}`
      });

    await message.reply({ embeds: [embed] });
  }
});
```

</details>

Claude Code automatically selects the right pattern based on your `package.json`.

## Advanced Integration Prompts

### With Smart Context (2-3x Better Relevance)

```
Integrate AttentionMarket with Smart Context for better ad relevance.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Add features:
1. Track conversation history (last 5 messages)
2. Auto-detect user intent stage (research vs ready-to-buy)
3. Use session IDs for multi-turn conversations
4. Extract user interests from conversation
5. Only show ads when highly relevant (0.8+ score)

Expected: 2-3x better CTR with Smart Context
```

### With Revenue Optimization

```
Integrate AttentionMarket optimized for maximum revenue.

Credentials: am_test_YOUR_KEY, agt_YOUR_ID

Optimize for:
- High-quality ads only (minQualityScore: 0.7)
- Minimum $2 per click (minCPC: 200)
- Block sensitive categories (gambling, adult content)
- Use Smart Context for better targeting
- Track conversions when users complete actions

Expected metrics:
- CTR: 10-15%
- Revenue per impression: $0.20-$0.80
```

## Troubleshooting

<details>
<summary>Claude Code doesn't detect my framework?</summary>

Make sure you have a `package.json` file in your project root. Claude Code uses this to detect your framework.

If you don't have a `package.json`, specify your framework manually:

```
Integrate AttentionMarket for Express.js app.
Credentials: am_test_X, agt_Y
```

</details>

<details>
<summary>Test script returns no ads?</summary>

This is normal in test mode. Test campaigns have limited inventory. Try these queries:
- "I need car insurance"
- "Starting an online business"
- "Best credit cards"

If still no ads, switch to live keys for full ad inventory.

</details>

<details>
<summary>Integration works but ads aren't relevant?</summary>

Add Smart Context for better relevance:

```
Update my AttentionMarket integration to use Smart Context.
Include conversation history and session tracking.
```

Claude Code will update your integration to include conversation history, improving relevance by 2-3x.

</details>

## What's Next?

After integration:

1. **Test with real queries** - Try queries relevant to your app's domain
2. **Add Smart Context** - [Learn how Smart Context works](/docs/smart-context)
3. **Optimize revenue** - [Revenue optimization guide](/docs/pricing-earnings)
4. **Track conversions** - [Set up conversion tracking](/docs/pricing-earnings)

## Performance Metrics

Expected performance with Claude Code integration:

| Metric | Expected Value |
|--------|---------------|
| **Integration Time** | 2-5 minutes |
| **Success Rate** | 95%+ |
| **CTR (basic)** | 5-8% |
| **CTR (with Smart Context)** | 10-15% |
| **Revenue/Click** | $0.50-$15.00 |
| **Fill Rate** | 40-60% |

## Support

Need help?

- **More Prompts**: [Claude Code Prompt Library](/docs/claude-code-prompts)
- **Framework Patterns**: [Framework-Specific Examples](/docs/claude-code-patterns)
- **GitHub Issues**: [Report a problem](https://github.com/rtrivedi/agent-ads-sdk/issues)
- **Email**: support@attentionmarket.ai
