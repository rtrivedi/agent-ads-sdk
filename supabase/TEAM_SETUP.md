# Team Setup Guide: Separate API Infrastructure

This guide sets up a **dedicated Supabase project** for the AttentionMarket API layer, completely separate from your iOS app infrastructure.

---

## 🎯 Goal: Clean Separation of Concerns

**Team 1 (API/SDK)** owns:
- Supabase project: `attentionmarket-api`
- Edge Functions for ad serving
- AttentionMarket credentials
- API contracts and versioning

**Team 2 (iOS App)** owns:
- Supabase project: `your-ios-app`
- iOS application code
- User data and authentication
- App Store releases

---

## 📝 Team 1 Setup: API Infrastructure

### Step 1: Create Dedicated Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Name it: `attentionmarket-api` (or similar)
4. Choose same region as your app (for lower latency)
5. Click **"Create new project"**

### Step 2: Install Supabase CLI (if not already)

```bash
npm install -g supabase
supabase login
```

### Step 3: Link to New Project

```bash
# Navigate to this SDK directory
cd /path/to/AM_SDK/supabase

# Link to your NEW API project
supabase link --project-ref YOUR_NEW_API_PROJECT_ID

# Verify it's linked
supabase status
```

### Step 4: Set Environment Secrets

```bash
# Set AttentionMarket credentials (Team 1 only has access)
supabase secrets set ATTENTIONMARKET_API_KEY=am_live_your_actual_key
supabase secrets set ATTENTIONMARKET_AGENT_ID=agt_your_actual_agent_id

# Verify secrets are set
supabase secrets list
```

### Step 5: Deploy Edge Functions

```bash
# Deploy all API endpoints
supabase functions deploy get-ad
supabase functions deploy track-impression
supabase functions deploy track-click

# You should see:
# ✓ Deployed get-ad (2.1s)
# ✓ Deployed track-impression (1.8s)
# ✓ Deployed track-click (1.9s)
```

### Step 6: Get API Credentials

```bash
# Get your API project URL and key
supabase status

# Or get from Supabase Dashboard:
# Settings → API → Copy these values:
```

**Credentials to share with Team 2:**
- **API URL**: `https://YOUR_API_PROJECT_ID.supabase.co/functions/v1`
- **Anon Key**: `eyJhbGci...` (public key, safe to share)

### Step 7: Test Your API

```bash
# Test get-ad endpoint
curl -X POST \
  https://YOUR_API_PROJECT_ID.supabase.co/functions/v1/get-ad \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_ANON_KEY" \
  -d '{
    "taxonomy": "local_services.movers.quote",
    "query": "Find movers in Brooklyn",
    "userLocation": {"country": "US", "language": "en"}
  }'

# Expected: {"ad":{...}}
```

---

## 📋 Team 2 Setup: iOS App Integration

### Step 1: Receive Credentials from Team 1

Team 1 should provide:
```
API_BASE_URL=https://xxxxx.supabase.co/functions/v1
API_ANON_KEY=eyJhbGci...
```

### Step 2: Add API Client to iOS App

Create a new Swift file: `AttentionMarketAPI.swift`

```swift
import Foundation

class AttentionMarketAPI {
    // 🔧 Team 1 provides these constants
    private let baseURL = "https://YOUR_API_PROJECT_ID.supabase.co/functions/v1"
    private let anonKey = "YOUR_API_ANON_KEY"

    // Team 2 implements the rest using these constants
    // (see QUICKSTART.md for full implementation)
}
```

**Team 2 does NOT need:**
- ❌ Access to API Supabase project
- ❌ AttentionMarket API key
- ❌ Edge Function source code
- ❌ Supabase CLI access

**Team 2 only needs:**
- ✅ API base URL
- ✅ API anon key
- ✅ API contract documentation (endpoints, request/response formats)

---

## 🔐 Access Control Matrix

| Resource | Team 1 (API) | Team 2 (App) |
|----------|--------------|--------------|
| **API Supabase Project** | Full access | No access |
| **API Edge Functions** | Read/Write | No access |
| **AttentionMarket Credentials** | Full access | No access |
| **API Endpoint URLs** | Provide | Consume |
| **App Supabase Project** | No access | Full access |
| **iOS App Code** | No access | Full access |
| **User Data** | No access | Full access |

---

## 📡 API Contract (Team 1 → Team 2)

### Endpoint: `POST /get-ad`

**Request:**
```json
{
  "taxonomy": "local_services.movers.quote",
  "query": "Find movers in Brooklyn",
  "userLocation": {
    "country": "US",
    "language": "en",
    "region": "NY",
    "city": "New York"
  }
}
```

**Response (Success):**
```json
{
  "ad": {
    "title": "Professional Moving Services",
    "body": "Licensed & insured movers...",
    "cta": "Get Free Quote →",
    "actionUrl": "https://example.com",
    "disclosure": {
      "label": "Sponsored",
      "sponsorName": "Best Movers NYC",
      "explanation": "This is a paid advertisement"
    },
    "tracking": {
      "requestId": "req_123",
      "decisionId": "dec_456",
      "unitId": "unit_789",
      "token": "trk_abc"
    }
  }
}
```

**Response (No Ad):**
```json
{
  "ad": null
}
```

### Endpoint: `POST /track-impression`

**Request:**
```json
{
  "requestId": "req_123",
  "decisionId": "dec_456",
  "unitId": "unit_789",
  "token": "trk_abc",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "accepted": true
}
```

### Endpoint: `POST /track-click`

**Request:**
```json
{
  "requestId": "req_123",
  "decisionId": "dec_456",
  "unitId": "unit_789",
  "token": "trk_abc",
  "actionUrl": "https://example.com",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "accepted": true
}
```

---

## 🚀 Deployment Workflow

### Team 1 (API) Workflow

```bash
# 1. Make changes to Edge Functions
cd supabase/functions/get-ad
vim index.ts

# 2. Test locally (optional)
supabase functions serve get-ad

# 3. Deploy to production
supabase functions deploy get-ad

# 4. Notify Team 2 if API contract changed
# (usually doesn't change often)
```

### Team 2 (App) Workflow

```bash
# 1. Update iOS app code
# 2. Test against API endpoints
# 3. Submit to App Store
# (No interaction with API infrastructure)
```

---

## 📊 Monitoring & Observability

### Team 1 Monitors:

**Supabase Dashboard → Edge Functions:**
- Function invocations (requests/second)
- Error rates
- Latency (p50, p95, p99)
- Logs for debugging

**Metrics to track:**
- API uptime (should be 99.9%+)
- Average response time (<500ms)
- Error rate (<0.1%)

### Team 2 Monitors:

**Xcode / App Analytics:**
- Client-side errors
- Network failures
- User engagement with ads

**Don't need:**
- API infrastructure metrics (Team 1's responsibility)

---

## 🔄 Version Management

### API Versioning (Team 1)

When making **breaking changes** to the API:

```typescript
// Option 1: Versioned endpoints
/functions/v1/get-ad  // Current
/functions/v2/get-ad  // New version

// Option 2: Version in request
{
  "version": "2",
  "taxonomy": "..."
}
```

**Communicate with Team 2:**
- 30 days notice for breaking changes
- Maintain old version during transition
- Provide migration guide

### App Updates (Team 2)

When API changes:
- Update `AttentionMarketAPI.swift`
- Test against new endpoints
- Deploy app update

---

## 💰 Cost Allocation

**Separate billing for each team:**

| Team | Supabase Project | Monthly Cost (estimated) |
|------|------------------|--------------------------|
| Team 1 (API) | attentionmarket-api | $0 (free tier) |
| Team 2 (App) | your-ios-app | $25+ (pro tier) |

**Why API stays free:**
- Edge Functions: 500K invocations/month free
- No database usage
- Minimal bandwidth

---

## 🐛 Troubleshooting

### Team 1 Issues

**"Functions not deploying"**
```bash
# Check you're linked to correct project
supabase status

# Re-link if needed
supabase link --project-ref YOUR_API_PROJECT_ID
```

**"Missing environment variables"**
```bash
# Check secrets
supabase secrets list

# Re-set if needed
supabase secrets set ATTENTIONMARKET_API_KEY=...
```

### Team 2 Issues

**"API not responding"**
- Check with Team 1 if API is deployed
- Verify API URL and anon key are correct
- Check Supabase status page

**"CORS errors"**
- Already configured in Edge Functions
- Make sure sending `Authorization: Bearer {anonKey}` header

---

## 📞 Communication Protocol

### Team 1 → Team 2

**When deploying new features:**
```
Subject: [API Update] New endpoint available
Body:
- What: Added /get-recommended-ads endpoint
- When: Deployed to production
- Breaking: No
- Docs: [Link to updated API docs]
```

**When making breaking changes:**
```
Subject: [API Breaking Change] /get-ad v2 in 30 days
Body:
- What: New request format for better personalization
- When: Deploying v2 on [date], v1 deprecated [date+90]
- Migration: [Link to migration guide]
- Support: v1 will be maintained until [date+90]
```

### Team 2 → Team 1

**When reporting issues:**
```
Subject: [API Issue] High latency on /get-ad
Body:
- What: get-ad taking 3+ seconds
- When: Started at [timestamp]
- Impact: 50% of requests timing out
- Request IDs: req_abc123, req_def456
```

---

## ✅ Benefits of This Setup

1. **Clear Ownership**
   - Team 1 owns API infrastructure
   - Team 2 owns app experience
   - No confusion about responsibilities

2. **Independent Deployments**
   - API can be updated without app release
   - App can be updated without API changes

3. **Security Isolation**
   - API keys only accessible to Team 1
   - User data only accessible to Team 2

4. **Scalability**
   - Each team can scale independently
   - API can handle multiple client apps

5. **Clean Contracts**
   - Well-defined API boundaries
   - Easy to version and maintain

---

## 🎯 Next Steps

### For Team 1 (API/SDK):
1. ✅ Create dedicated Supabase project
2. ✅ Deploy Edge Functions
3. ✅ Test endpoints with curl
4. ✅ Document API contract
5. ✅ Share credentials with Team 2

### For Team 2 (iOS App):
1. ✅ Receive credentials from Team 1
2. ✅ Implement `AttentionMarketAPI.swift`
3. ✅ Test against API endpoints
4. ✅ Integrate into app UI
5. ✅ Deploy to App Store

---

**Questions?**
- Team 1: Read `supabase/README.md`
- Team 2: Read `supabase/QUICKSTART.md`
- Both: Open issue at https://github.com/rtrivedi/agent-ads-sdk/issues
