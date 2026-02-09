# Critical Bugs Found in Earnings System - Code Review

**Reviewer**: Test Engineering Review
**Date**: 2026-02-09
**Severity Levels**: CRITICAL (launch blocker), HIGH (must fix soon), MEDIUM (should fix), LOW (nice to have)

---

## 🚨 CRITICAL BUGS (Launch Blockers)

### 1. STATUS FLOW MISMATCH - Payouts Will Fail ❌
**Location**:
- `reconcile-to-available.sql` Line 46
- `record-manual-payout.sql` Lines 43, 107

**Bug**:
```sql
-- reconcile-to-available.sql marks earnings as 'reconciled':
UPDATE earnings SET status = 'reconciled' WHERE status = 'pending';

-- But record-manual-payout.sql looks for 'pending':
SELECT * FROM earnings WHERE status = 'pending';  -- FINDS NOTHING!
```

**Impact**: Payout script will always find 0 earnings, show $0 revenue, but still deduct from balance.

**Fix**: Change record-manual-payout.sql to look for `status = 'reconciled'` or `status IN ('pending', 'reconciled')`

---

### 2. NO TRANSACTION WRAPPER - Race Condition ❌
**Location**: `reconcile-earnings/index.ts` Lines 156-208

**Bug**:
```typescript
// These are 3 separate operations with no transaction:
await supabase.from('earnings').insert(earningsToCreate);  // Step 1
await supabase.from('events').update(...);                  // Step 2
await supabase.from('developers').update(...);              // Step 3

// If crash between steps, data is inconsistent!
```

**Impact**:
- Earnings created but events not marked → double counting on retry
- Developer balances not updated → developers lose money
- Partial failures leave database in inconsistent state

**Fix**: Wrap in database transaction or add idempotency checks

---

### 3. NO IDEMPOTENCY - Double Payments Risk ❌
**Location**: `reconcile-earnings/index.ts` Lines 39-63

**Bug**:
```typescript
// Query finds unreconciled events
.is('reconciled_at', null)

// But no check for existing earnings records!
// If reconciliation runs twice (retry, manual trigger),
// creates duplicate earnings for same event_id
```

**Impact**:
- Developers get paid twice for same clicks
- Platform loses money
- lifetime_earnings inflated

**Fix**: Add unique constraint on `earnings.event_id` or check for existing earnings before insert

---

### 4. NO TRANSACTION IN PAYOUT SCRIPTS ❌
**Location**:
- `reconcile-to-available.sql` Lines 44-56
- `record-manual-payout.sql` Lines 64-117

**Bug**:
```sql
-- Multiple UPDATEs with no transaction wrapper
UPDATE earnings SET status = 'reconciled';  -- Step 1
UPDATE developers SET available_balance = ...;  -- Step 2

-- If fails between steps, money disappears!
```

**Impact**:
- Earnings marked reconciled but balance not updated → developer loses money
- Payout recorded but balance not deducted → platform loses money

**Fix**: Wrap entire script in `BEGIN; ... COMMIT;` or handle as single transaction

---

## ⚠️ HIGH SEVERITY BUGS

### 5. N+1 QUERY PROBLEM - Performance Degrades
**Location**: `reconcile-earnings/index.ts` Lines 175-184, 189-207

**Bug**:
```typescript
// Updates one row at a time in loops:
for (const eventId of eventsToUpdate) {  // Could be 10,000 events!
  await supabase.from('events').update(...).eq('id', eventId);
}

for (const [developerId, netEarnings] of developerEarnings.entries()) {
  await supabase.from('developers').update(...).eq('id', developerId);
}
```

**Impact**:
- 10,000 clicks = 10,000 individual UPDATE queries
- Function timeout risk
- Database connection exhaustion

**Fix**: Use batch updates or `WHERE IN` clause

---

### 6. MISSING DATA CONSTRAINTS ❌
**Location**: `add_developer_earnings_system.sql`

**Bugs**:
```sql
-- No validation that amounts are positive:
gross_amount DECIMAL(10,2) NOT NULL  -- Could be negative!
platform_fee DECIMAL(10,2) NOT NULL  -- Could be negative!
net_amount DECIMAL(10,2) NOT NULL    -- Could be negative!

-- No validation of revenue share percentage:
revenue_share_pct DECIMAL(5,2) DEFAULT 70.00  -- Could be 999.99%!

-- No unique constraint on event_id:
event_id UUID REFERENCES events(id)  -- Can create duplicates!
```

**Impact**:
- Negative earnings corrupt balances
- Revenue share >100% = platform loses money
- Duplicate earnings for same click

**Fix**: Add CHECK constraints and UNIQUE constraint

---

### 7. FLOATING POINT PRECISION ERRORS 💰
**Location**: `reconcile-earnings/index.ts` Lines 129-130, 148-149

**Bug**:
```typescript
const platformFee = (grossAmount * platformFeePct) / 100;  // JavaScript float!
const netAmount = (grossAmount * revenueSharePct) / 100;   // JavaScript float!
developerEarnings.set(developer.id, currentEarnings + netAmount);  // Accumulation!
```

**Impact**:
- 0.1 + 0.2 = 0.30000000000000004 in JavaScript
- Penny rounding errors accumulate over thousands of clicks
- Developer balance != sum of earnings

**Fix**: Use integer cents or Decimal.js library

---

## 🔶 MEDIUM SEVERITY ISSUES

### 8. WEAK PAYOUT VALIDATION
**Location**: `record-manual-payout.sql` Lines 58-61

**Bug**:
```sql
-- Only checks if balance >= amount
IF v_developer_balance < v_amount THEN
  RAISE EXCEPTION 'Insufficient balance';
END IF;

-- But doesn't check if earnings exist in period!
-- Could pay $150 for 0 clicks if previous balance exists
```

**Fix**: Validate that earnings exist and sum matches payout amount

---

### 9. DECIMAL PRECISION TOO SMALL
**Location**: `add_developer_earnings_system.sql` Lines 11-14

**Bug**:
```sql
lifetime_earnings DECIMAL(10,2)  -- Max $99,999,999.99
total_paid_out DECIMAL(10,2)     -- Max $99,999,999.99
```

**Impact**: If a developer earns >$99M (unlikely for MVP but possible long-term), overflow error

**Fix**: Use DECIMAL(12,2) for lifetime fields

---

### 10. MISSING PERIOD VALIDATION
**Location**: `add_developer_earnings_system.sql` Lines 54-55

**Bug**:
```sql
period_start TIMESTAMP WITH TIME ZONE NOT NULL,
period_end TIMESTAMP WITH TIME ZONE NOT NULL,
-- No constraint ensuring period_start < period_end!
```

**Fix**: Add CHECK constraint: `CHECK (period_start < period_end)`

---

## 🔷 LOW SEVERITY / NICE TO HAVE

### 11. No Pagination in Earnings API
**Location**: `developer-earnings/index.ts` Lines 101-114

**Issue**: Always fetches 100 earnings, could be slow with many clicks

**Fix**: Add pagination parameters

### 12. Missing Rate Limit on Reconciliation
**Location**: `reconcile-earnings/index.ts`

**Issue**: No rate limiting - could be called multiple times triggering duplicate processing

**Fix**: Add rate limiting or mutex lock

---

## SUMMARY

| Severity | Count | Must Fix Before Launch |
|----------|-------|------------------------|
| CRITICAL | 4 | ✅ YES |
| HIGH | 3 | ✅ YES |
| MEDIUM | 3 | ⚠️ Recommended |
| LOW | 2 | ❌ Optional |

## LAUNCH BLOCKERS (Must Fix):

1. ✅ Fix status flow mismatch (reconciled vs pending)
2. ✅ Add transaction wrappers to all multi-step operations
3. ✅ Add idempotency check (unique constraint on earnings.event_id)
4. ✅ Add CHECK constraints for amounts and revenue share
5. ✅ Fix N+1 query performance issues
6. ✅ Improve payout validation logic

## ESTIMATED TIME TO FIX:
- Critical bugs: ~2-3 hours
- High severity: ~1-2 hours
- **Total**: ~4 hours to be launch-ready
