# 📊 TRACKING SYSTEM AUDIT V2 - AFTER SIMPLIFICATION

**Date:** March 1, 2026
**Auditor:** Senior Staff Engineer Review
**System Health:** ⚠️ **NEEDS ATTENTION** (2 critical issues remain)

---

## ✅ IMPROVEMENTS MADE

Good progress on simplification:

1. **Removed `decide-enhanced`** ✅ - Single decide endpoint
2. **Removed `tracking-redirect`** ✅ - Eliminated one tracking function
3. **Standardized event types** ✅ - Using "click" instead of "ad_click"
4. **Impressions being tracked** ✅ - Events are recording

---

## 🔴 CRITICAL ISSUES REMAINING

### Issue 1: LOW IMPRESSION TRACKING RATE (35.3%)
**Severity:** HIGH
**Impact:** Missing 65% of impression data = inaccurate analytics

**Root Cause:** SDK tracks impressions client-side, but if the call fails or is blocked, no fallback exists.

**FIX REQUIRED:**
```typescript
// In decide/index.ts, after line 1002 (decision insert), add:
if (matchingAds.length > 0) {
  // Server-side impression tracking (don't rely on SDK)
  void supabase.from('events').insert({
    id: crypto.randomUUID(),
    event_id: `evt_${crypto.randomUUID()}`,
    event_type: 'impression',
    occurred_at: new Date().toISOString(),
    agent_id,
    request_id,
    decision_id,
    ad_unit_id: firstAd.unit_id || firstAd.id,
    campaign_id: firstAd.campaign_id,
    tracking_token: trackingToken,
    metadata: {
      server_side: true,
      auto_tracked: true
    }
  });
}
```

### Issue 2: DUPLICATE CLICK TRACKING FUNCTIONS
**Severity:** MEDIUM
**Impact:** Confusion, maintenance burden, potential data inconsistency

You still have **TWO** click tracking functions:
- `/functions/v1/click` (old, 15 invocations)
- `/functions/v1/track-click` (current, 31 invocations)

**FIX REQUIRED:**
```bash
# Delete the old click function immediately
supabase functions delete click
```

---

## 📈 CURRENT METRICS (24H)

| Metric | Value | Status |
|--------|--------|--------|
| Decisions | 34 | ✅ Normal |
| Impressions | 12 | 🔴 LOW (35.3% rate) |
| Clicks | 0 | ⚠️ No recent clicks |
| Impression Rate | 35.3% | 🔴 Should be >90% |
| CTR | 0% | ⚠️ No click data |

---

## 🛠️ IMMEDIATE ACTION PLAN

### Step 1: Fix Impression Tracking (5 minutes)
```bash
# Apply the patch to add server-side impression tracking
patch supabase/functions/decide/index.ts < patches/add-impression-tracking.patch
supabase functions deploy decide
```

### Step 2: Delete Redundant Function (1 minute)
```bash
# Remove old click function
supabase functions delete click
```

### Step 3: Verify Fixes (2 minutes)
```bash
# Run the audit again
npx tsx audit-v2.ts

# Check impression rate improvement
curl -s "https://peruwnbrqkvmrldhpoom.supabase.co/rest/v1/decisions?select=id&created_at=gte.$(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%S')" \
  -H "apikey: YOUR_KEY" | jq '. | length'

curl -s "https://peruwnbrqkvmrldhpoom.supabase.co/rest/v1/events?select=id&event_type=eq.impression&created_at=gte.$(date -u -d '1 hour ago' '+%Y-%m-%dT%H:%M:%S')" \
  -H "apikey: YOUR_KEY" | jq '. | length'
```

---

## 📊 MONITORING QUERY

Run this SQL to track your improvements:

```sql
WITH tracking_stats AS (
  SELECT
    DATE(d.created_at) as day,
    COUNT(DISTINCT d.id) as total_decisions,
    COUNT(DISTINCT CASE WHEN d.status = 'filled' THEN d.id END) as filled_decisions,
    COUNT(DISTINCT e_imp.decision_id) as tracked_impressions,
    COUNT(DISTINCT e_clk.decision_id) as tracked_clicks
  FROM decisions d
  LEFT JOIN events e_imp ON e_imp.decision_id = d.id
    AND e_imp.event_type = 'impression'
  LEFT JOIN events e_clk ON e_clk.decision_id = d.id
    AND e_clk.event_type = 'click'
  WHERE d.created_at > NOW() - INTERVAL '7 days'
  GROUP BY 1
)
SELECT
  day,
  filled_decisions,
  tracked_impressions,
  tracked_clicks,
  ROUND(100.0 * tracked_impressions / NULLIF(filled_decisions, 0), 1) as impression_rate,
  ROUND(100.0 * tracked_clicks / NULLIF(tracked_impressions, 0), 1) as ctr
FROM tracking_stats
ORDER BY day DESC;
```

---

## 🎯 SUCCESS CRITERIA

After implementing the fixes, you should see:

| Metric | Current | Target |
|--------|---------|--------|
| Impression Rate | 35.3% | >90% |
| Active Click Functions | 2 | 1 |
| Event Type Consistency | ✅ Good | ✅ Maintain |
| Decision Recording | ✅ 100% | ✅ Maintain |

---

## 💡 LONG-TERM RECOMMENDATIONS

1. **Add Circuit Breaker** - If impression rate drops below 80%, alert immediately
2. **Create Health Dashboard** - Real-time tracking metrics visualization
3. **Implement Retry Logic** - Retry failed impression tracking with exponential backoff
4. **Add Integration Tests** - Automated tests for the complete tracking flow
5. **Version Your Events** - Add `event_version` field for future migrations

---

## ✅ SUMMARY

**Good News:** Your simplification helped! Removed 2 functions, standardized event types.

**Action Needed:**
1. Add server-side impression tracking (critical)
2. Delete old click function (cleanup)

**Time to Fix:** ~8 minutes

**Impact:** Impression tracking will jump from 35% → 90%+

---

*Run `npx tsx audit-v2.ts` after fixes to verify improvements.*