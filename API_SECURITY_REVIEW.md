# AttentionMarket API Security Review
**Reviewer**: Expert API Security Audit (Google-standard)
**Date**: 2026-02-02
**Scope**: All 5 MVP APIs

---

## 🚨 CRITICAL Issues (Blocks MVP Launch)

### 1. **Unbounded Database Queries - DoS Risk**
**Impact**: Memory exhaustion, database overload, service outage
**APIs Affected**: agent-stats, advertiser-stats

**agent-stats/index.ts:63-68**
```typescript
const { data: events } = await supabase
  .from('events')
  .select('event_type, occurred_at, unit_id, decision_id')
  .eq('agent_id', agent_id)
  .gte('occurred_at', start_date)
  .lte('occurred_at', end_date);
// ❌ Could fetch millions of rows, no LIMIT clause
```

**advertiser-stats/index.ts:100-105**
```typescript
const { data: events } = await supabase
  .from('events')
  .select('event_type, unit_id, occurred_at')
  .in('unit_id', unitIds)
  .gte('occurred_at', start_date)
  .lte('occurred_at', end_date);
// ❌ Could fetch millions of rows per campaign
```

**Fix**: Add LIMIT 10000 and aggregate in SQL instead of memory

---

### 2. **API Key Storage Architecture - Performance & Security**
**Impact**: Slow authentication, can't index, full table scans
**APIs Affected**: advertiser-signup, campaign-create, advertiser-stats

**advertiser-signup/index.ts:99**
```typescript
metadata: { dashboard_api_key }
// ❌ Stored in JSONB - can't create index
```

**advertiser-stats/index.ts:52**
```typescript
.contains('metadata', { dashboard_api_key: advertiserKey })
// ❌ Full table scan on JSONB field
```

**Fix**: Move advertiser API key to dedicated indexed column

---

### 3. **No Rate Limiting - Abuse & DoS Risk**
**Impact**: Spam signups, API abuse, cost overruns
**APIs Affected**: ALL 5 APIs

**Current**: Zero rate limiting on any endpoint
**Risk**:
- Unlimited agent/advertiser signups
- Unlimited campaign creation
- Stats endpoint hammering
- Database connection exhaustion

**Fix**: Implement rate limiting (10 req/min per IP for signups, 60 req/min for stats)

---

### 4. **No Input Validation on Money Fields**
**Impact**: Financial loss, negative budgets, $1B campaigns
**APIs Affected**: campaign-create

**campaign-create/index.ts:129**
```typescript
budget: parseFloat(budget),
bid_cpm: bid_cpm ? parseFloat(bid_cpm) : null,
bid_cpc: bid_cpc ? parseFloat(bid_cpc) : null,
// ❌ No validation: could be negative, zero, or $999,999,999
```

**Fix**: Validate budget range ($100 - $100,000), bid range ($0.01 - $100)

---

### 5. **Revenue Calculation Not Implemented**
**Impact**: Agents can't see earnings, broken business model
**APIs Affected**: agent-stats

**agent-stats/index.ts:89-93**
```typescript
revenue: {
  total: 0, // TODO: Calculate based on campaign pricing
  cpm: 0,
  cpc: 0,
  currency: 'USD'
},
```

**Fix**: Calculate actual revenue from events + campaign bids

---

## ⚠️ HIGH Priority Issues (Should Fix for MVP)

### 6. **N+1 Query Patterns**
**Impact**: Performance degradation at scale
**advertiser-stats/index.ts**: Multiple sequential queries instead of JOINs

```typescript
// Line 74: Get campaigns
const { data: campaigns } = await supabase.from('campaigns')...
// Line 92: Get ad_units for campaigns
const { data: adUnits } = await supabase.from('ad_units')...
// Line 100: Get events for ad_units
const { data: events } = await supabase.from('events')...
// ❌ Should be single JOIN query
```

**Fix**: Use SQL JOIN or RPC function

---

### 7. **No Pagination on List Endpoints**
**Impact**: Poor UX, performance issues
**advertiser-stats/index.ts:169**: Returns ALL campaigns unbounded

**Fix**: Add `?limit=50&offset=0` query params

---

### 8. **Array Operations in Memory Instead of SQL**
**Impact**: Performance, memory usage
**agent-stats/index.ts:70-72, advertiser-stats/index.ts:108-110**

```typescript
const impressions = events?.filter(e => e.event_type === 'impression').length || 0;
const clicks = events?.filter(e => e.event_type === 'click').length || 0;
// ❌ Filtering millions of rows in Node.js memory
```

**Fix**: Use SQL aggregation: `COUNT(*) ... WHERE event_type = 'impression'`

---

### 9. **Duplicate Check Race Condition**
**Impact**: Duplicate agent/advertiser records
**advertiser-signup/index.ts:65-69**

```typescript
const { data: existing } = await supabase
  .from('advertisers')
  .select('id')
  .eq('contact_email', contact_email)
  .single();
// ❌ Race condition: two requests at same time both pass check
```

**Fix**: Rely on database unique constraint, handle error gracefully

---

### 10. **No Budget/Bid Limits**
**Impact**: Advertiser can create absurd campaigns
**campaign-create/index.ts**:
- Budget: min $100, but no maximum
- Bids: no minimum or maximum
- Could create campaign with $0.0001 CPC or $10,000 CPM

**Fix**: Add max budget ($100,000), min/max bids ($0.01 - $100)

---

## 📋 MEDIUM Priority (Can Defer Post-MVP)

### 11. **No Email Verification**
Anyone can sign up with fake@example.com

### 12. **No Payment Method Requirement**
Advertisers can create campaigns without payment on file

### 13. **Dashboard URL Generation Broken**
advertiser-signup returns URL that doesn't exist

### 14. **quality_score Hardcoded**
campaign-create sets quality to 1.0, no actual calculation

### 15. **No Caching**
Expensive stats calculations run on every request

### 16. **CORS Allows All Origins**
`'Access-Control-Allow-Origin': '*'` - fine for MVP but should restrict

### 17. **Error Messages Leak Internal Details**
agent-signup/index.ts:126 returns `error.message` from database

### 18. **No Monitoring/Tracing**
No correlation IDs, no structured logging

---

## 📊 Issue Summary

| Severity | Count | Blocks MVP? |
|----------|-------|-------------|
| CRITICAL | 5     | ✅ YES      |
| HIGH     | 5     | ⚠️ Should   |
| MEDIUM   | 8     | ❌ No       |

---

## 🔧 Recommended Fix Priority

### Phase 1: MVP Blockers (Fix Now)
1. ✅ Fix unbounded queries (add LIMIT + SQL aggregation)
2. ✅ Move advertiser API key to indexed column
3. ✅ Add rate limiting middleware
4. ✅ Validate money fields (budget/bid ranges)
5. ✅ Implement revenue calculation

### Phase 2: Performance & UX (Fix This Week)
6. Optimize N+1 queries with JOINs
7. Add pagination to list endpoints
8. Add budget/bid validation limits
9. Fix duplicate race conditions

### Phase 3: Production Hardening (Post-MVP)
10. Email verification
11. Payment method requirement
12. API caching layer
13. Request tracing & monitoring
14. Restrict CORS origins

---

## 🎯 MVP Risk Assessment

**Current State**: 🔴 **NOT READY FOR PRODUCTION**

**Risks**:
- DoS attacks via unbounded queries
- Database performance collapse at scale
- Advertiser abuse (fake budgets, spam campaigns)
- Agent can't see earnings (broken value prop)

**After Phase 1 Fixes**: 🟡 **ACCEPTABLE MVP RISK**

**After Phase 2 Fixes**: 🟢 **PRODUCTION READY**
