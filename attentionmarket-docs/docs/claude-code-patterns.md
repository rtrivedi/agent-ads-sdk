---
sidebar_position: 1.6
title: Framework Patterns
---

# Framework-Specific Integration Patterns

Complete integration examples for every major framework. Claude Code automatically detects your framework and uses the appropriate pattern.

## How Framework Detection Works

Claude Code reads your `package.json` to detect:

| Framework | Detected From | Integration Type |
|-----------|---------------|------------------|
| **Next.js** | `"next"` dependency | API Route + Component |
| **Express** | `"express"` dependency | Middleware |
| **Discord.js** | `"discord.js"` dependency | Message Handler + Embed |
| **Slack Bolt** | `"@slack/bolt"` dependency | Event Handler |
| **React** | `"react"` (no backend) | Client Component |
| **CLI/Node** | No web framework | Terminal Output |

## Next.js Integration

### App Router (Recommended)

```typescript title="app/api/chat/route.ts"
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';
import { NextRequest, NextResponse } from 'next/server';

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();

    // Get AI response
    const aiResponse = await generateAIResponse(message);

    // Get contextual ad with Smart Context
    const ad = await amClient.decideFromContext({
      userMessage: message,
      conversationHistory: conversationHistory?.slice(-5) || [],
      placement: 'sponsored_suggestion'
    }).catch((error) => {
      console.error('[AttentionMarket] Ad request failed:', error);
      return null;
    });

    return NextResponse.json({
      response: aiResponse,
      sponsored: ad
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
```

### React Component

```tsx title="components/SponsoredCard.tsx"
'use client';

interface SponsoredCardProps {
  ad: {
    creative: {
      title: string;
      body: string;
      cta: string;
    };
    click_url: string;
    disclosure: {
      sponsor_name: string;
    };
    payout: number;
  } | null;
}

export function SponsoredCard({ ad }: SponsoredCardProps) {
  if (!ad) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-4 mt-4 bg-gray-50">
      <span className="text-xs text-gray-500 uppercase">Sponsored</span>
      <h3 className="font-semibold text-lg mt-1">{ad.creative.title}</h3>
      <p className="text-gray-700 mt-2">{ad.creative.body}</p>
      <a
        href={ad.click_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {ad.creative.cta} →
      </a>
      <p className="text-xs text-gray-500 mt-2">
        by {ad.disclosure.sponsor_name}
      </p>
    </div>
  );
}
```

**Expected CTR:** 8-12%

---

## Express.js Integration

### Middleware Pattern

```typescript title="middleware/ads.ts"
import { Request, Response, NextFunction } from 'express';
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      sponsoredAd?: any;
    }
  }
}

export async function injectAd(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userMessage = req.body.message;
  const conversationHistory = req.body.conversationHistory || [];

  try {
    req.sponsoredAd = await amClient.decideFromContext({
      userMessage,
      conversationHistory: conversationHistory.slice(-5),
      placement: 'sponsored_suggestion'
    });
  } catch (error) {
    console.error('[AttentionMarket] Ad request failed:', error);
    req.sponsoredAd = null; // Graceful degradation
  }

  next();
}
```

### Usage

```typescript title="routes/chat.ts"
import express from 'express';
import { injectAd } from '../middleware/ads';

const router = express.Router();

router.post('/chat', injectAd, async (req, res) => {
  const aiResponse = await generateAIResponse(req.body.message);

  res.json({
    response: aiResponse,
    sponsored: req.sponsoredAd // null if ad failed - app still works
  });
});

export default router;
```

**Expected CTR:** 6-10%

---

## Discord.js Bot Integration

### Message Handler with Embeds

```typescript title="bot.ts"
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Generate AI response
  const aiResponse = await getAIResponse(message.content);
  await message.reply(aiResponse);

  // Get and display ad
  try {
    const ad = await amClient.decideFromContext({
      userMessage: message.content,
      placement: 'sponsored_suggestion'
    });

    if (ad && ad.relevance_score && ad.relevance_score > 0.7) {
      const embed = new EmbedBuilder()
        .setTitle(ad.creative.title)
        .setDescription(ad.creative.body)
        .setColor('#4F46E5')
        .addFields({
          name: ad.creative.cta,
          value: `[Click here](${ad.click_url})`,
          inline: false
        })
        .setFooter({
          text: `Sponsored by ${ad.disclosure.sponsor_name}`
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('[AttentionMarket] Ad display failed:', error);
    // Gracefully continue - don't break bot
  }
});

client.login(process.env.DISCORD_TOKEN);
```

**Expected CTR:** 12-18% (Discord embeds have high engagement)

---

## Slack Bolt App Integration

### Event Handler

```typescript title="app.ts"
import { App } from '@slack/bolt';
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

app.message(async ({ message, say }) => {
  if (message.subtype) return; // Ignore system messages

  const userMessage = message.text || '';

  // Generate AI response
  const aiResponse = await getAIResponse(userMessage);
  await say(aiResponse);

  // Get and display ad
  try {
    const ad = await amClient.decideFromContext({
      userMessage,
      placement: 'sponsored_suggestion'
    });

    if (ad) {
      await say({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${ad.creative.title}*\n${ad.creative.body}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: ad.creative.cta
                },
                url: ad.click_url,
                style: 'primary'
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `_Sponsored by ${ad.disclosure.sponsor_name}_`
              }
            ]
          }
        ]
      });
    }
  } catch (error) {
    console.error('[AttentionMarket] Ad display failed:', error);
  }
});

await app.start(process.env.PORT || 3000);
```

**Expected CTR:** 10-14%

---

## CLI/Terminal App Integration

### Console Output with Box Formatting

```typescript title="cli.ts"
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';
import chalk from 'chalk'; // Optional: for colored output

const amClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTION_MARKET_API_KEY!,
  agentId: process.env.ATTENTION_MARKET_AGENT_ID!
});

async function handleUserQuery(userMessage: string) {
  // Generate AI response
  const aiResponse = await getAIResponse(userMessage);
  console.log('\n' + aiResponse + '\n');

  // Get and display ad
  try {
    const ad = await amClient.decideFromContext({
      userMessage,
      placement: 'sponsored_suggestion'
    });

    if (ad) {
      displayAdBox(ad);
    }
  } catch (error) {
    // Silent fail - don't break CLI experience
  }
}

function displayAdBox(ad: any) {
  const width = 60;
  const title = truncate(ad.creative.title, width - 4);
  const body = truncate(ad.creative.body, width - 4);
  const sponsor = truncate(ad.disclosure.sponsor_name, width - 7);

  console.log('\n' + '┌─ Sponsored ' + '─'.repeat(width - 13) + '┐');
  console.log('│ ' + chalk.bold(title).padEnd(width - 2) + ' │');
  console.log('│ ' + body.padEnd(width - 2) + ' │');
  console.log('│ ' + chalk.blue(`→ ${ad.creative.cta}`).padEnd(width - 2) + ' │');
  console.log('│ ' + chalk.gray(ad.click_url).padEnd(width - 2) + ' │');
  console.log('└─ by ' + sponsor + ' ' + '─'.repeat(width - sponsor.length - 6) + '┘\n');
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
}
```

**Expected CTR:** 15-25% (High attention in CLI context)

---

## React Client-Side Integration

### For Apps Without Backend

```tsx title="hooks/useAds.ts"
import { useState, useEffect } from 'react';

export function useAd(userMessage: string) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAd() {
      if (!userMessage) return;

      setLoading(true);
      try {
        // Call your backend endpoint that uses AttentionMarket SDK
        const response = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        setAd(data.ad);
      } catch (error) {
        console.error('Ad fetch failed:', error);
        setAd(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAd();
  }, [userMessage]);

  return { ad, loading };
}
```

```tsx title="components/ChatWithAds.tsx"
import { useAd } from '../hooks/useAds';
import { SponsoredCard } from './SponsoredCard';

export function ChatWithAds({ userMessage }: { userMessage: string }) {
  const { ad, loading } = useAd(userMessage);

  return (
    <div>
      <ChatMessage message={userMessage} />
      {!loading && ad && <SponsoredCard ad={ad} />}
    </div>
  );
}
```

**Expected CTR:** 7-11%

---

## Framework Detection Script

Claude Code uses this logic to detect your framework:

```typescript
function detectFramework(packageJson: any): string {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  if (deps['next']) return 'nextjs';
  if (deps['express']) return 'express';
  if (deps['discord.js']) return 'discordjs';
  if (deps['@slack/bolt']) return 'slack';
  if (deps['react'] && !deps['next']) return 'react';

  return 'nodejs'; // Default to CLI/Node.js
}
```

## Display Performance by Platform

| Platform | Display Pattern | Expected CTR | Best For |
|----------|----------------|--------------|----------|
| **Next.js** | Inline card | 8-12% | Web apps, dashboards |
| **Discord** | Rich embed | 12-18% | Bot interactions |
| **Slack** | Block kit | 10-14% | Workspace tools |
| **CLI** | Box formatting | 15-25% | Developer tools |
| **Express** | JSON response | 6-10% | API integrations |
| **React** | Component | 7-11% | SPAs |

## Best Practices

### 1. Always Handle Errors Gracefully

```typescript
// ✅ Good: App continues if ads fail
const ad = await amClient.decideFromContext({ ... }).catch(() => null);

// ❌ Bad: App breaks if ads fail
const ad = await amClient.decideFromContext({ ... });
```

### 2. Use Smart Context When Available

```typescript
// ✅ Good: Include conversation history
const ad = await amClient.decideFromContext({
  userMessage,
  conversationHistory: history.slice(-5)
});

// ❌ Missed opportunity: No context
const ad = await amClient.decideFromContext({ userMessage });
```

### 3. Filter by Relevance Score

```typescript
// ✅ Good: Only show highly relevant ads
if (ad && ad.relevance_score && ad.relevance_score > 0.7) {
  displayAd(ad);
}

// ❌ Bad: Show all ads regardless of relevance
if (ad) {
  displayAd(ad);
}
```

## Need Help?

- **Quick Start**: [5-Minute Integration](/docs/claude-code-quickstart)
- **Prompt Library**: [Copy-Paste Prompts](/docs/claude-code-prompts)
- **Support**: support@attentionmarket.ai
