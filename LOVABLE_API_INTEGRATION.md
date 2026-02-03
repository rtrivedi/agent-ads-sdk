# AttentionMarket API - Lovable Integration Guide

## Base URL
```
https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1
```

---

## 🤖 Agent APIs

### 1. Agent Signup
**POST** `/agent-signup`

**Request:**
```json
{
  "owner_email": "developer@example.com",
  "agent_name": "RecipeBot",
  "sdk": "typescript",
  "environment": "test"
}
```

**Response:**
```json
{
  "agent_id": "agt_abc123...",
  "api_key_live": "am_live_xyz...",
  "api_key_test": "am_test_xyz...",
  "status": "active",
  "message": "Agent created successfully...",
  "next_steps": [...]
}
```

### 2. Agent Stats
**GET** `/agent-stats?period=30d`

**Headers:**
```
X-AM-API-Key: am_test_xyz...
```

**Response:**
```json
{
  "agent_id": "agt_abc123",
  "period": { "start": "...", "end": "...", "label": "30d" },
  "metrics": {
    "impressions": 1247,
    "clicks": 89,
    "conversions": 7,
    "ctr": "7.14",
    "cvr": "7.87"
  },
  "revenue": {
    "total": 247.50,
    "cpm": 47.50,
    "cpc": 200.00,
    "currency": "USD"
  }
}
```

---

## 📢 Advertiser APIs

### 3. Advertiser Signup
**POST** `/advertiser-signup`

**Request:**
```json
{
  "contact_email": "advertiser@company.com",
  "company_name": "Acme Inc",
  "website": "https://acme.com",
  "industry": "ecommerce"
}
```

**Response:**
```json
{
  "advertiser_id": "uuid-here",
  "contact_email": "advertiser@company.com",
  "company_name": "Acme Inc",
  "dashboard_api_key": "adv_xyz...",
  "dashboard_url": "https://...",
  "status": "active",
  "next_steps": [...]
}
```

### 4. Create Campaign
**POST** `/campaign-create`

**Headers:**
```
X-Advertiser-Key: adv_xyz...
```

**Request:**
```json
{
  "name": "Q1 E-commerce Campaign",
  "targeting_taxonomies": ["shopping.ecommerce.platform"],
  "targeting_countries": ["US", "CA"],
  "targeting_languages": ["en"],
  "targeting_platforms": ["web", "ios", "android"],
  "budget": 5000,
  "bid_cpm": 5.50,
  "bid_cpc": 0.50
}
```

**Response:**
```json
{
  "campaign_id": "uuid-here",
  "name": "Q1 E-commerce Campaign",
  "status": "active",
  "budget": {
    "total": 5000,
    "spent": 0,
    "remaining": 5000,
    "currency": "USD"
  },
  "targeting": {...},
  "pricing": {
    "cpm": 5.50,
    "cpc": 0.50
  },
  "next_steps": [...]
}
```

### 5. Advertiser Stats
**GET** `/advertiser-stats?period=30d`

**Headers:**
```
X-Advertiser-Key: adv_xyz...
```

**Response:**
```json
{
  "advertiser_id": "uuid",
  "company_name": "Acme Inc",
  "period": {...},
  "budget": {
    "total": 5000,
    "spent": 1247.50,
    "remaining": 3752.50,
    "currency": "USD"
  },
  "metrics": {
    "impressions": 45000,
    "clicks": 1247,
    "conversions": 87,
    "ctr": "2.77",
    "cvr": "6.97",
    "cost_per_click": "1.00",
    "cost_per_conversion": "14.34"
  },
  "spend_breakdown": {
    "cpm_spend": "247.50",
    "cpc_spend": "1000.00",
    "total": "1247.50"
  },
  "campaigns": [
    {
      "campaign_id": "...",
      "name": "Q1 E-commerce Campaign",
      "status": "active",
      "budget": 5000,
      "spent": 1247.50,
      "impressions": 45000,
      "clicks": 1247,
      "ctr": "2.77"
    }
  ]
}
```

---

## 🔑 Authentication

**Agent APIs:**
- Header: `X-AM-API-Key: am_test_...` or `am_live_...`
- Get from `/agent-signup` response

**Advertiser APIs:**
- Header: `X-Advertiser-Key: adv_...`
- Get from `/advertiser-signup` response

---

## 📊 Lovable Integration Examples

### Agent Signup Page

```typescript
async function handleAgentSignup(email: string, agentName: string) {
  const response = await fetch(
    'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/agent-signup',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_email: email,
        agent_name: agentName,
        sdk: 'typescript',
        environment: 'test'
      })
    }
  );

  const data = await response.json();

  if (response.ok) {
    // Show API keys to user
    setApiKeys({
      test: data.api_key_test,
      live: data.api_key_live
    });
  } else {
    // Show error
    setError(data.message);
  }
}
```

### Agent Dashboard

```typescript
async function fetchAgentStats(apiKey: string) {
  const response = await fetch(
    'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/agent-stats?period=30d',
    {
      headers: {
        'X-AM-API-Key': apiKey
      }
    }
  );

  const stats = await response.json();

  return {
    impressions: stats.metrics.impressions,
    clicks: stats.metrics.clicks,
    revenue: stats.revenue.total,
    ctr: stats.metrics.ctr
  };
}
```

### Advertiser Dashboard

```typescript
async function fetchAdvertiserStats(advertiserKey: string) {
  const response = await fetch(
    'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/advertiser-stats?period=30d',
    {
      headers: {
        'X-Advertiser-Key': advertiserKey
      }
    }
  );

  const stats = await response.json();

  return {
    spent: stats.budget.spent,
    remaining: stats.budget.remaining,
    impressions: stats.metrics.impressions,
    clicks: stats.metrics.clicks,
    ctr: stats.metrics.ctr,
    campaigns: stats.campaigns
  };
}
```

### Create Campaign Form

```typescript
async function handleCreateCampaign(advertiserKey: string, campaignData: any) {
  const response = await fetch(
    'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/campaign-create',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Advertiser-Key': advertiserKey
      },
      body: JSON.stringify({
        name: campaignData.name,
        targeting_taxonomies: [campaignData.taxonomy],
        targeting_countries: campaignData.countries,
        budget: parseFloat(campaignData.budget),
        bid_cpm: parseFloat(campaignData.cpm),
        bid_cpc: parseFloat(campaignData.cpc)
      })
    }
  );

  const result = await response.json();

  if (response.ok) {
    return result.campaign_id;
  } else {
    throw new Error(result.message);
  }
}
```

---

## ✅ Ready for Lovable

All 5 APIs are deployed and ready to use. Build your frontend in Lovable and call these endpoints!

**Next Steps:**
1. Build signup forms in Lovable
2. Build dashboards (agent + advertiser)
3. Test end-to-end flow
4. Launch! 🚀
