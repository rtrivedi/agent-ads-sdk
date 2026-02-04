# 🤖 How to Add Ads to Your Clawdbot/Moltbot in Simple English

### **The Big Picture:**
Your bot answers user questions. Sometimes those answers could include a helpful ad (like suggesting Pietra when someone asks about starting an online store). You get paid when users see/click those ads.

---

## Step-by-Step Guide

### **Step 1: Sign Up for API Keys** (One-time, 30 seconds)

You need permission to request ads. Think of this like getting a key to a vending machine.

**How to do it:**
1. Go to **[attentionmarket.com/signup](https://attentionmarket.com/signup)**
2. Enter your email and agent name
3. Click "Generate API Keys"

**You'll get back:**
- A **Test Key** (like `am_test_xyz789`) - for testing
- A **Live Key** (like `am_live_xyz789`) - for when you go live
- An **Agent ID** (you'll use this for tracking)

**Write these down!** You'll need them.

---

### **Step 2: Install the SDK** (One-time, 30 seconds)

This is like downloading an app on your phone.

**In your bot's code folder:**
```bash
npm install @the_ro_show/agent-ads-sdk
```

Done!

---

### **Step 3: Set Up Your Credentials** (One-time, 1 minute)

Create a file called `.env` in your bot's folder:

```bash
ATTENTIONMARKET_API_KEY=am_test_xyz789  # Use your test key from Step 1
ATTENTIONMARKET_AGENT_ID=agt_abc123     # Use your agent ID from Step 1
```

---

### **Step 4: Add Code to Your Bot** (10 minutes)

This is where your bot learns to request and show ads.

#### **A. Import the SDK** (Add to top of your bot's code)

```typescript
import { AttentionMarketClient, createOpportunity } from '@the_ro_show/agent-ads-sdk';

// Initialize the SDK (this connects you to the ad platform)
const adClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
});
```

#### **B. Decide WHEN to Show Ads**

You choose when! Here's a simple example:

```typescript
// Your bot's existing code that handles user messages
async function handleUserMessage(userMessage) {
  // 1. Your bot answers the question (like normal)
  const botAnswer = await yourBot.respond(userMessage);

  // 2. Check if this is a good time to show an ad
  let ad = null;

  if (userMessage.toLowerCase().includes('online store') ||
      userMessage.toLowerCase().includes('ecommerce')) {

    // 3. Request an ad about e-commerce
    ad = await adClient.decide({
      request_id: `req_${Date.now()}`,
      agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
      placement: {
        type: 'sponsored_suggestion',
        surface: 'chat'
      },
      opportunity: createOpportunity({
        taxonomy: 'business.ecommerce.platform.trial', // E-commerce platforms
        country: 'US',
        language: 'en',
        platform: 'web',
      }),
    });
  }

  // 4. Send both the answer AND the ad back to the user
  return {
    answer: botAnswer,
    ad: ad  // This will be null if no ad matches
  };
}
```

#### **C. Display the Ad to the User**

Show it clearly labeled as "Sponsored":

```typescript
// Example: Showing in chat
if (ad) {
  console.log('\n--- Sponsored ---');
  console.log(`${ad.suggestion.title}`);
  console.log(`${ad.suggestion.body}`);
  console.log(`👉 ${ad.suggestion.cta}: ${ad.suggestion.action_url}`);
  console.log(`(Sponsored by ${ad.disclosure.sponsor_name})`);

  // Track that user saw it (you get paid!)
  await adClient.trackImpression({
    agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
    request_id: 'req_...',  // Same ID from step B
    decision_id: ad.unit_id,
    unit_id: ad.unit_id,
    tracking_token: ad.tracking.token,
  });
}
```

#### **D. Track When User Clicks**

If user clicks the ad link:

```typescript
// When user clicks the ad link
await adClient.trackClick({
  agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
  request_id: 'req_...',
  decision_id: ad.unit_id,
  unit_id: ad.unit_id,
  tracking_token: ad.tracking.token,
});
```

---

## 📱 **Real Example: Bot Conversation**

**User:** "How do I start an online store?"

**Your Bot:**
```
🤖 Starting an online store involves choosing a platform,
   setting up products, and marketing. Here are the basics...

   [Your bot's helpful answer here]

   --- Sponsored ---
   Pietra - E-Commerce Platform for Product Brands
   Launch your online store in minutes. Built-in inventory,
   shipping, and payments. Trusted by 10,000+ brands.

   👉 Start Free Trial: https://pietrastudio.com
   (Sponsored by Pietra Inc)
```

**You get paid** when the user sees this ✅
**You get paid more** if they click it ✅

---

## 🎯 **What You Control:**

### ✅ **You Decide WHEN to Show Ads:**
- After certain types of questions
- Once every 5 messages
- Only for commercial topics
- Never for sensitive topics

### ✅ **You Decide WHERE:**
- In chat responses
- In email summaries
- In tool suggestions
- In search results

### ✅ **You Decide HOW:**
- At the bottom of your response
- In a special "Sponsored" section
- As a subtle suggestion
- With colors/borders (if you have a UI)

---

## 🔑 **Key Concepts (Simple):**

### **Taxonomy** = Topic Category
When you request an ad, you tell us what the user is asking about:
- `business.ecommerce.platform.trial` = Online store questions
- `home_services.moving.local.quote` = Moving company questions
- `insurance.auto.full_coverage.quote` = Car insurance questions
- `legal.family.divorce.consultation` = Divorce lawyer questions
- `business.productivity.tools` = Productivity software questions

**You pick the taxonomy** based on what the user asked.

### **Request ID** = Unique Identifier
Like a receipt number. You generate a random ID each time you request an ad:
```typescript
request_id: `req_${Date.now()}`  // req_1706889234567
```

### **Tracking Token** = Proof You Showed the Ad
Comes back with the ad. You send it when tracking impressions/clicks so we know it's real.

---

## 💰 **How You Make Money:**

1. **User asks question** → Your bot answers
2. **You request ad** → Get back Pietra ad
3. **You show ad** → Track impression → **You get paid ~$0.005**
4. **User clicks ad** → Track click → **You get paid ~$0.50**

**That's it!** The more relevant ads you show, the more users click, the more you earn.

---

## ⚡ **Quick Start (Copy-Paste):**

Here's everything in one block:

```typescript
import { AttentionMarketClient, createOpportunity } from '@the_ro_show/agent-ads-sdk';

const adClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
});

// In your message handler
async function handleMessage(userMessage) {
  const botAnswer = await yourBot.respond(userMessage);

  // Request ad if about e-commerce
  let ad = null;
  if (userMessage.includes('online store')) {
    ad = await adClient.decide({
      request_id: `req_${Date.now()}`,
      agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
      placement: { type: 'sponsored_suggestion', surface: 'chat' },
      opportunity: createOpportunity({
        taxonomy: 'business.ecommerce.platform.trial',
        country: 'US',
        language: 'en',
        platform: 'web',
      }),
    });

    // Track impression
    if (ad) {
      await adClient.trackImpression({
        agent_id: process.env.ATTENTIONMARKET_AGENT_ID,
        request_id: 'req_...',
        decision_id: ad.unit_id,
        unit_id: ad.unit_id,
        tracking_token: ad.tracking.token,
      });
    }
  }

  return { answer: botAnswer, ad };
}
```

---

## ✅ **Checklist:**

- [ ] Run signup command to get API keys
- [ ] Install SDK: `npm install @the_ro_show/agent-ads-sdk`
- [ ] Create `.env` file with your keys
- [ ] Add SDK import to your bot code
- [ ] Add code to request ads (when appropriate)
- [ ] Add code to display ads (clearly labeled)
- [ ] Add tracking for impressions
- [ ] Add tracking for clicks
- [ ] Test with a question about "online store"
- [ ] See Pietra ad appear!

---

**That's it!** You're now monetizing your bot with relevant ads. 🎉

Users get helpful suggestions, advertisers reach their audience, and you get paid for providing value to both sides.

---

## 🆘 **Need Help?**

- **Documentation:** See README.md for full API reference
- **Security:** See SECURITY.md for best practices
- **Issues:** https://github.com/rtrivedi/agent-ads-sdk/issues

---

## 🔄 **Advanced: Custom Configuration**

If you're self-hosting or need custom backend:

```typescript
const adClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY,
  baseUrl: 'https://your-custom-backend.com/v1',  // Optional
  supabaseAnonKey: 'your-key',                     // Optional (for Supabase)
});
```

For most users, just the `apiKey` is enough!
