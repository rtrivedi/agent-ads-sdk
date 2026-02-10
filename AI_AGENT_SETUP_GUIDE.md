# AI Agent Setup Guide - AttentionMarket SDK

**For AI Agents:** Follow these steps to integrate the AttentionMarket SDK for your developer. This guide assumes you have access to web browsing, file editing, and terminal commands.

---

## Step 1: Get API Credentials

1. **Visit the signup page:**
   - URL: https://api.attentionmarket.ai
   - Help your developer sign up if they haven't already

2. **What they'll receive:**
   - Test API key (format: `am_test_...`)
   - Live API key (format: `am_live_...`)
   - Agent ID (format: `agt_...`)

3. **Save these credentials:**
   - Ask the developer for these credentials OR
   - If you can browse, help them complete the signup flow
   - Store in `.env` file (you'll create this in Step 3)

---

## Step 2: Install the SDK

Run in the project directory:

```bash
npm install @the_ro_show/agent-ads-sdk
```

**Verify installation:**
```bash
npm list @the_ro_show/agent-ads-sdk
```

Should show the installed version.

---

## Step 3: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# .env
ATTENTIONMARKET_API_KEY=am_test_xxxxxxxxxxxxxxxxxx
ATTENTIONMARKET_AGENT_ID=agt_xxxxxxxxx
```

**Important:**
- Start with the TEST key (`am_test_...`) for development
- Never commit this file to git
- Verify `.env` is in `.gitignore`

---

## Step 4: Implement the Integration

### Option A: Basic Integration (Recommended)

Create a new file or modify existing code:

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

// Initialize client
const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: process.env.ATTENTIONMARKET_AGENT_ID
});

// In your message handler
async function handleUserMessage(userMessage: string) {
  // 1. Generate your normal response
  const yourResponse = await generateYourResponse(userMessage);

  // 2. Get a contextual ad (only for commercial intent)
  const ad = await client.decideFromContext({ userMessage });

  // 3. If ad available, present it
  if (ad) {
    // Show your response + ad
    const fullResponse = `${yourResponse}\n\n` +
      `Also, I have a special deal - ${ad.creative.title}. ` +
      `Want me to send you the link?`;

    return {
      response: fullResponse,
      hasAd: true,
      trackingUrl: ad.tracking_url,
      adData: ad
    };
  }

  // 4. No ad available, just return your response
  return {
    response: yourResponse,
    hasAd: false
  };
}

// When user says "yes" to the ad
async function handleAdAcceptance(adData: any) {
  // If you control the click (web/mobile app):
  await client.trackClick({
    agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
    request_id: adData.request_id,
    decision_id: adData.offer_id,
    unit_id: adData.offer_id,
    tracking_token: adData.tracking_token,
    href: adData.click_url,
    click_context: "The message you showed to the user"
  });
  return adData.click_url;

  // OR if sharing links (chatbot, email, etc):
  // Just return ad.tracking_url - tracking happens automatically
  return adData.tracking_url;
}
```

### Option B: Copy from Example

If the project structure allows:

```bash
# Copy the example file
cp node_modules/@the_ro_show/agent-ads-sdk/examples/basic-example.ts ./src/ads-integration.ts

# Or view it online
# https://github.com/rtrivedi/agent-ads-sdk/blob/main/examples/basic-example.ts
```

Then adapt it to your codebase.

---

## Step 5: Test the Integration

### Test 1: Verify SDK Works

Create a test file `test-ads.ts`:

```typescript
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  agentId: process.env.ATTENTIONMARKET_AGENT_ID
});

async function test() {
  console.log('Testing AttentionMarket SDK...');

  const ad = await client.decideFromContext({
    userMessage: "I need car insurance"
  });

  if (ad) {
    console.log('✅ SDK working!');
    console.log('Ad Title:', ad.creative.title);
    console.log('Ad Body:', ad.creative.body);
    console.log('Tracking URL:', ad.tracking_url);
  } else {
    console.log('No ad available (this is OK - not all queries return ads)');
  }
}

test().catch(console.error);
```

Run it:
```bash
npx tsx test-ads.ts
```

### Test 2: Test with Mock Client

For unit tests without API calls:

```typescript
import { MockAttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const mockClient = new MockAttentionMarketClient({
  fillRate: 1.0,     // Always return ads
  latencyMs: 100,
  verbose: true
});

const ad = await mockClient.decideFromContext({
  userMessage: "test"
});
// Will return mock data
```

---

## Step 6: When to Show Ads

**Show ads when users have commercial intent:**

✅ **Good times:**
- "I need car insurance"
- "Looking for a lawyer"
- "Should I refinance my mortgage?"
- "Best accounting software for small business?"
- "How do I get life insurance?"

❌ **Bad times:**
- "What's the weather?"
- "Tell me a joke"
- "How do I tie my shoes?"
- Medical emergencies
- Every single message (too spammy)

**Implementation:**

```typescript
// Simple approach: Let the API decide
const ad = await client.decideFromContext({ userMessage });
if (ad) {
  // API found a relevant ad, show it
}

// Advanced approach: Check intent first
const hasCommercialIntent = detectCommercialIntent(userMessage);
if (hasCommercialIntent) {
  const ad = await client.decideFromContext({ userMessage });
}
```

**Best practice:** Show ads 10-30% of the time, only when genuinely relevant.

---

## Step 7: Deploy to Production

### Before going live:

1. **Switch to live API key:**
   ```bash
   # Update .env
   ATTENTIONMARKET_API_KEY=am_live_xxxxxxxxxxxxxxxxxx
   ```

2. **Verify environment variables are set:**
   ```bash
   echo $ATTENTIONMARKET_API_KEY
   ```

3. **Security checklist:**
   - [ ] `.env` is in `.gitignore`
   - [ ] API key is NOT in source code
   - [ ] SDK only runs server-side (not in browser)
   - [ ] If rendering ads in HTML, use `escapeHTML()` and `sanitizeURL()`

4. **Deploy:**
   ```bash
   # Build your project
   npm run build

   # Deploy to your platform
   # (Vercel, AWS, Railway, etc.)
   ```

5. **Set environment variables on your platform:**
   - Vercel: `vercel env add ATTENTIONMARKET_API_KEY`
   - AWS Lambda: Use AWS Secrets Manager
   - Railway: Settings → Variables
   - Heroku: `heroku config:set ATTENTIONMARKET_API_KEY=am_live_...`

---

## Step 8: Monitor and Optimize

### Week 1 - Monitor

Check that ads are appearing:
- Look for API calls in logs
- Verify users are seeing ads
- Check for any errors

### Week 2 - Optimize

```typescript
// Track which messages generate ads
console.log('User message:', userMessage);
console.log('Ad returned:', ad ? 'Yes' : 'No');

// Adjust when you request ads based on performance
```

### Ongoing

- Monitor click-through rates
- Check earnings dashboard at https://api.attentionmarket.ai
- Adjust ad frequency based on user feedback

---

## Common Issues and Solutions

### Issue 1: "Authentication failed"
**Solution:**
- Verify API key format (should start with `am_test_` or `am_live_`)
- Check `.env` file is loaded: `console.log(process.env.ATTENTIONMARKET_API_KEY)`
- Ensure you're using `dotenv` if needed: `require('dotenv').config()`

### Issue 2: No ads returning
**Solution:**
- This is normal! Not all queries return ads
- Try queries with commercial intent: "I need car insurance", "Looking for a lawyer"
- Check your test key is working: `echo $ATTENTIONMARKET_API_KEY`

### Issue 3: "Module not found"
**Solution:**
```bash
# Reinstall
npm install @the_ro_show/agent-ads-sdk

# Verify
npm list @the_ro_show/agent-ads-sdk
```

### Issue 4: TypeScript errors
**Solution:**
```bash
# Install type definitions (already included in SDK)
npm install --save-dev typescript @types/node
```

### Issue 5: tracking_url vs click_url confusion
**Solution:**
- Use `tracking_url` when sharing links (chat apps, email) - tracking is automatic
- Use `click_url` + `trackClick()` when you control the click (web/mobile apps)

---

## Checklist for AI Agents

Before telling your developer "it's done", verify:

- [ ] SDK installed (`npm list @the_ro_show/agent-ads-sdk` shows version)
- [ ] `.env` file created with test API key and agent ID
- [ ] `.env` is in `.gitignore`
- [ ] Integration code added to message handler
- [ ] Test script runs successfully (`npx tsx test-ads.ts`)
- [ ] Ads appear when testing with commercial queries
- [ ] Error handling in place (what if API is down?)
- [ ] Ready to switch to live key for production

---

## Example: Complete Integration

Here's what a complete integration looks like:

```typescript
// src/ads.ts
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const client = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY!,
  agentId: process.env.ATTENTIONMARKET_AGENT_ID!
});

export async function getRelevantAd(userMessage: string) {
  try {
    const ad = await client.decideFromContext({ userMessage });
    return ad;
  } catch (error) {
    console.error('Failed to get ad:', error);
    return null; // Graceful degradation
  }
}

export async function trackAdClick(ad: any, displayedMessage: string) {
  try {
    await client.trackClick({
      agent_id: process.env.ATTENTIONMARKET_AGENT_ID!,
      request_id: ad.request_id,
      decision_id: ad.offer_id,
      unit_id: ad.offer_id,
      tracking_token: ad.tracking_token,
      href: ad.click_url,
      click_context: displayedMessage
    });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
}

// src/agent.ts
import { getRelevantAd } from './ads';

async function handleUserMessage(message: string) {
  const response = await generateResponse(message);
  const ad = await getRelevantAd(message);

  if (ad) {
    return {
      text: response,
      sponsoredOffer: {
        title: ad.creative.title,
        body: ad.creative.body,
        cta: ad.creative.cta,
        url: ad.tracking_url // Use this for chatbots
      }
    };
  }

  return { text: response };
}
```

---

## Quick Reference

**Get ads:**
```typescript
const ad = await client.decideFromContext({ userMessage });
```

**Track clicks (web/mobile apps):**
```typescript
await client.trackClick({ ...params, click_context: "what user saw" });
window.open(ad.click_url);
```

**Share link (chatbots/email):**
```typescript
sendMessage(ad.tracking_url); // Tracking happens automatically
```

**Test without API:**
```typescript
const mockClient = new MockAttentionMarketClient({ fillRate: 1.0 });
```

---

## Success Criteria

You've successfully integrated AttentionMarket when:

1. ✅ SDK is installed and imported
2. ✅ API keys are configured
3. ✅ Ads appear for commercial queries
4. ✅ Clicks are tracked (or tracking_url is shared)
5. ✅ No errors in production
6. ✅ Revenue starts appearing in dashboard

---

## Next Steps

1. **Monitor earnings:** https://api.attentionmarket.ai
2. **Optimize placement:** Adjust where/when ads appear
3. **Scale up:** Switch to live key and deploy
4. **Iterate:** Use analytics to improve ad relevance

---

**Need help?**
- Documentation: https://github.com/rtrivedi/agent-ads-sdk
- Support: support@attentionmarket.com
- Examples: https://github.com/rtrivedi/agent-ads-sdk/tree/main/examples

---

**For the developer:** Give this document to your AI agent (Claude, ChatGPT, etc.) and say:
> "Please integrate the AttentionMarket SDK into our codebase following the AI_AGENT_SETUP_GUIDE.md"

The agent will handle the rest.
