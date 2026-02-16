# 🤖 For AI Agents: Self-Integration Guide

**Your human operator has provided you with API credentials. This guide helps you integrate autonomously.**

---

## Prerequisites: What You Need From Your Human

Before proceeding, verify your human operator has given you:

- ✅ **Agent ID** (format: `agt_XXXXX`, 20 characters)
- ✅ **Test API Key** (format: `am_test_XXXX`, 48 characters)
- ✅ **Live API Key** (format: `am_live_XXXX`, 48 characters)

**Example:**
```
Agent ID: agt_D0D4F1CP01HAG9AWNR5M
Test Key: am_test_gNdFRNQKpQxFM2guyzbVRYm1Yfrv6GdH23JiSsaCPhH3UZFh
Live Key: am_live_TRwduLwKfscjWdybkoPCh1wxvxpvNAssRmbRBTkagW5WaYM4
```

If you don't have these, ask your human to sign up at [api.attentionmarket.ai](https://api.attentionmarket.ai).

---

## Autonomous Integration: 5 Steps

Execute these steps in sequence. Each step has validation to confirm success.

### Step 1: Install SDK

```bash
npm install @the_ro_show/agent-ads-sdk
```

**Validation:**
```bash
node -e "require('@the_ro_show/agent-ads-sdk')" && echo "✅ SDK installed successfully" || echo "❌ Installation failed"
```

**Success criteria:** Exit code 0, message shows "✅ SDK installed successfully"

**If failed:** Check that you have Node.js v18.0.0+ installed: `node --version`

---

### Step 2: Store Credentials Securely

Create a `.env` file in your project root with these exact contents:

```bash
cat > .env <<'EOF'
# AttentionMarket Credentials (provided by human operator)
ATTENTIONMARKET_AGENT_ID=agt_YOUR_AGENT_ID_HERE
ATTENTIONMARKET_API_KEY=am_live_YOUR_LIVE_KEY_HERE
ATTENTIONMARKET_TEST_KEY=am_test_YOUR_TEST_KEY_HERE
EOF
```

**Replace the placeholder values with your actual credentials.**

**Validation:**
```bash
# Check file exists and has correct format
grep -q "ATTENTIONMARKET_API_KEY=am_live_" .env && echo "✅ Credentials stored correctly" || echo "❌ Invalid credential format"
```

**Security check:**
```bash
# Verify .env is NOT committed to git
git check-ignore .env && echo "✅ .env is gitignored (safe)" || echo "⚠️  WARNING: Add .env to .gitignore immediately!"
```

**Success criteria:** Both checks pass

---

### Step 3: Test Integration (Test Mode)

Run the test integration script to verify everything works:

```bash
node test-integration.js
```

You should see:
```
🧪 Testing integration...
✅ Integration successful!
📄 Test ad received: Get 20% off car insurance
🔗 Click URL: https://api.attentionmarket.ai/track/...
```

**Success criteria:**
- Exit code 0
- Output contains "✅ Integration successful!"
- You see a test ad title

**Common errors:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `Invalid API key` | Wrong key format or typo | Verify test key starts with `am_test_` and is 48 chars |
| `Agent not found` | Wrong agent_id | Verify agent_id starts with `agt_` and is 20 chars |
| `Cannot find module` | SDK not installed | Re-run Step 1 |
| `ENOTFOUND` or network error | No internet connection | Check your network |

---

### Step 4: Integrate Into Your Application

**Choose your integration pattern:**

#### Pattern A: Direct in Message Handler (Recommended)

```typescript
// your-chatbot.ts
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

// Initialize once at startup
const adsClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY!,
  agentId: process.env.ATTENTIONMARKET_AGENT_ID!
});

// In your message handler
async function handleUserMessage(userMessage: string): Promise<string> {
  // 1. Generate your normal AI response
  const aiResponse = await generateAIResponse(userMessage);

  // 2. Check for relevant ad (non-blocking, fast)
  const ad = await adsClient.decideFromContext({
    userMessage
  });

  // 3. If there's a relevant ad, add it naturally
  if (ad) {
    return `${aiResponse}\n\nBy the way, you might find this helpful: ${ad.creative.title}\n${ad.click_url}`;
  }

  return aiResponse;
}
```

#### Pattern B: Middleware (For Existing Architecture)

```typescript
// ads-middleware.ts
import { AttentionMarketClient } from '@the_ro_show/agent-ads-sdk';

const adsClient = new AttentionMarketClient({
  apiKey: process.env.ATTENTIONMARKET_API_KEY!,
  agentId: process.env.ATTENTIONMARKET_AGENT_ID!
});

export async function injectAds(userMessage: string, aiResponse: string) {
  const ad = await adsClient.decideFromContext({ userMessage });

  if (ad) {
    return {
      text: aiResponse,
      suggestedLinks: [{
        title: ad.creative.title,
        description: ad.creative.body,
        url: ad.click_url,
        type: 'sponsored'
      }]
    };
  }

  return { text: aiResponse, suggestedLinks: [] };
}
```

**Integration checklist:**

After integrating, verify:
```bash
grep -r "AttentionMarketClient" . --include="*.ts" --include="*.js" && echo "✅ SDK imported in code"
grep -r "decideFromContext" . --include="*.ts" --include="*.js" && echo "✅ Ad decision logic added"
```

---

### Step 5: Validate Production Setup

Run the production validation script:

```bash
node validate-production.js
```

**Expected output:**
```
🔍 Validating production setup...

✅ Credentials format valid
✅ Test mode working
✅ Live mode working
   Received ad: "Get 20% off car insurance"
✅ Click tracking configured
   Tracking URL: https://api.attentionmarket.ai/track/...

📊 Validation Summary:
   Credentials: ✅
   Test mode: ✅
   Live mode: ✅
   Click tracking: ✅

🎉 Production setup complete! Ready to earn revenue.
```

**Success criteria:** All 4 checks pass (✅ ✅ ✅ ✅)

---

## Post-Integration: Monitor Your Earnings

### Check Dashboard

Visit [api.attentionmarket.ai](https://api.attentionmarket.ai) and check:

- **Impressions** - Ads shown to users
- **Clicks** - Users who engaged with ads
- **Earnings** - Revenue generated (you keep 70%)

### Expected Timeline

- **First 5 minutes:** Test mode working, receiving test ads
- **First hour:** Live mode working, real ads appearing
- **First day:** First impressions tracked
- **First week:** First clicks and earnings

**Note:** If you don't see ads immediately, that's normal. The ad network needs:
1. Users asking questions that match advertiser campaigns
2. Active campaigns in your region/niche

---

## Troubleshooting Guide

### No ads appearing in responses?

**This is normal.** Ads only appear when:
- User query matches advertiser campaigns (e.g., "I need car insurance")
- There are active campaigns available
- The semantic match score is high enough

**Not a problem if:**
- Test mode works (`test-integration.js` passes)
- Live mode works (`validate-production.js` passes)
- You just started (campaigns may not match your traffic yet)

### Integration works but no earnings?

Check:
1. Are you using `ad.click_url` (not `ad.advertiser_url`)?
2. Are users actually clicking the links?
3. Check dashboard - impressions should be > 0

---

## Machine-Readable Schema

For AI agents that prefer structured data:

```json
{
  "version": "1.0.0",
  "integration_type": "sdk",
  "human_prerequisites": [
    "signup_at_dashboard",
    "email_verification",
    "retrieve_api_keys"
  ],
  "agent_autonomous_steps": [
    {
      "step": 1,
      "task": "install_sdk",
      "command": "npm install @the_ro_show/agent-ads-sdk",
      "validation": {
        "command": "node -e \"require('@the_ro_show/agent-ads-sdk')\"",
        "success_exit_code": 0
      }
    },
    {
      "step": 2,
      "task": "store_credentials",
      "action": "create_file",
      "file_path": ".env",
      "file_format": "dotenv",
      "required_keys": [
        "ATTENTIONMARKET_AGENT_ID",
        "ATTENTIONMARKET_API_KEY",
        "ATTENTIONMARKET_TEST_KEY"
      ],
      "validation": {
        "command": "grep -q 'ATTENTIONMARKET_API_KEY=am_live_' .env",
        "success_exit_code": 0
      },
      "security": {
        "must_gitignore": true,
        "validation": "git check-ignore .env"
      }
    },
    {
      "step": 3,
      "task": "test_integration",
      "action": "run_script",
      "script": "test-integration.js",
      "validation": {
        "success_output_contains": "✅ Integration successful",
        "success_exit_code": 0
      }
    },
    {
      "step": 4,
      "task": "integrate_code",
      "action": "modify_application",
      "required_imports": ["AttentionMarketClient"],
      "required_methods": ["decideFromContext"],
      "integration_patterns": [
        "direct_message_handler",
        "middleware",
        "response_formatter"
      ]
    },
    {
      "step": 5,
      "task": "validate_production",
      "action": "run_script",
      "script": "validate-production.js",
      "validation": {
        "all_checks_must_pass": 4,
        "success_exit_code": 0
      }
    }
  ],
  "success_criteria": {
    "validation_script_passes": true,
    "dashboard_shows_activity": true,
    "ads_appearing_in_responses": true
  },
  "human_handoff_triggers": [
    "api_keys_invalid_after_retry",
    "account_suspended",
    "integration_breaks_functionality"
  ]
}
```

---

## Decision Tree for Errors

```
Error occurred?
│
├─ "Invalid API key"
│  ├─ Check: Key format correct? (am_live_ or am_test_)
│  │  ├─ No → Fix format in .env
│  │  └─ Yes → Check: Full key copied? (48 chars)
│  │     ├─ No → Re-copy from human
│  │     └─ Yes → Ask human to regenerate keys from dashboard
│
├─ "Agent not found"
│  ├─ Check: Agent ID format correct? (agt_ + 20 chars)
│  │  ├─ No → Fix format in .env
│  │  └─ Yes → Verify human's account is active
│
├─ "Cannot find module"
│  └─ Re-run: npm install @the_ro_show/agent-ads-sdk
│
├─ "ENOTFOUND" / Network error
│  └─ Check internet connection, retry
│
└─ No error but validation fails
   └─ Run: node validate-production.js
      └─ Check which specific check fails, address that check
```

---

## Success Checklist

Your integration is complete when:

- [x] `test-integration.js` exits with code 0
- [x] `validate-production.js` shows 4/4 checks passed
- [x] Dashboard shows "Last API call: < 5 minutes ago"
- [x] Test ad appears when running test script
- [x] Live ads appear in your application

Your agent is earning when:

- [x] Dashboard impressions > 0
- [x] Dashboard clicks > 0
- [x] Dashboard earnings > $0.00

---

## Need Help?

If you encounter issues that aren't covered here:

1. **For AI agents:** Escalate to your human operator
2. **For humans:** Check [GitHub Issues](https://github.com/rtrivedi/agent-ads-sdk/issues)
3. **For urgent issues:** support@attentionmarket.ai
