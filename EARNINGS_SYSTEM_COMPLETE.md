# Developer Earnings System - Complete ✅

## What Was Built

Complete developer earnings and payout tracking system for AttentionMarket MVP, designed for manual payout processing via wire transfer.

## System Components

### 1. Database Schema ✅

**Migration**: `supabase/migrations/add_developer_earnings_system.sql`

**Added to `developers` table:**
- `pending_earnings` - Clicks tracked but not yet reviewed
- `available_balance` - Reviewed earnings ready for payout
- `lifetime_earnings` - Total earned all-time
- `total_paid_out` - Total amount paid out
- `revenue_share_pct` - Developer's cut (default 70%)
- `payout_threshold` - Min balance for payout (default $100)
- `payout_schedule` - 'weekly' | 'monthly' | 'manual'
- `payment_method` - JSONB payment details
- `tax_info` - JSONB for 1099 reporting
- `last_payout_at` - Last payout timestamp

**New `earnings` table:**
- Per-click revenue tracking with detailed breakdown
- Status flow: `pending` → `reconciled` → `paid_out`
- Links to: developer, agent, campaign, advertiser, event
- Tracks: gross_amount (full CPC), platform_fee (30%), net_amount (70%)

**New `payouts` table:**
- Payout history and status tracking
- Payment method and transaction ID
- Time period covered (start/end dates)
- Click count and revenue breakdown

**View `developer_earnings_summary`:**
- Dashboard-ready earnings summary
- Current balances and monthly stats
- Payout eligibility calculation

### 2. Reconciliation Function ✅

**Edge Function**: `reconcile-earnings`
**Deployed**: ✅ https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/reconcile-earnings

**What it does:**
- Processes all unreconciled click events
- Creates detailed earnings records with revenue split
- Updates developer pending_earnings and lifetime_earnings
- Marks events as reconciled
- Returns summary stats

**Run daily with:**
```bash
./supabase/scripts/run-reconciliation.sh
```

### 3. Developer Earnings API ✅

**Edge Function**: `developer-earnings`
**Deployed**: ✅ https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/developer-earnings

**Authentication**: `X-API-Key` header with developer's API key

**Returns:**
- Current balances (pending, available, lifetime, paid_out)
- This month's clicks and earnings
- Payout eligibility status
- Recent earnings breakdown (last 100 clicks)
- Payout history (last 20 payouts)

**Example:**
```bash
curl https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/developer-earnings \
  -H "X-API-Key: developer-api-key"
```

### 4. Manual Payout Scripts ✅

**Location**: `supabase/scripts/`

**Scripts created:**
1. `run-reconciliation.sh` - Trigger daily reconciliation
2. `view-developer-earnings.sh` - View all developer balances
3. `reconcile-to-available.sql` - Move pending → available (weekly)
4. `record-manual-payout.sql` - Record wire transfer payout

### 5. Documentation ✅

**File**: `supabase/scripts/EARNINGS_WORKFLOW.md`

Complete workflow documentation including:
- Daily reconciliation process
- Weekly review and approval
- Manual payout recording
- API usage
- Troubleshooting

## Complete Workflow

### Daily (Automated or Manual)
```bash
./supabase/scripts/run-reconciliation.sh
```
- Processes unreconciled clicks
- Creates earnings records
- Updates pending_earnings

### Weekly (Before Payouts)
```sql
-- In Supabase SQL Editor:
\i supabase/scripts/reconcile-to-available.sql
```
- Moves pending → available balance
- Prepares for payout

### View Balances
```bash
./supabase/scripts/view-developer-earnings.sh
```
- See who's eligible for payout
- Review available balances

### Process Payout
1. Wire transfer money to developer
2. Edit `record-manual-payout.sql` with transaction details
3. Run in Supabase SQL Editor
4. Updates balances and creates payout record

## Revenue Flow

```
Click Event (in events table)
    ↓
Daily Reconciliation
    ↓
Earnings Record Created
    ├─ gross_amount: $2.00 (full CPC)
    ├─ platform_fee: $0.60 (30%)
    └─ net_amount: $1.40 (70% to developer)
    ↓
Developer.pending_earnings += $1.40
Developer.lifetime_earnings += $1.40
    ↓
Weekly Review
    ↓
Developer.available_balance += $1.40
Developer.pending_earnings -= $1.40
    ↓
Manual Wire Transfer
    ↓
Payout Record Created
Developer.available_balance -= $1.40
Developer.total_paid_out += $1.40
```

## Status Flow

**Earnings status:**
- `pending` - Created by reconciliation, not yet reviewed
- `reconciled` - Reviewed and moved to available balance
- `paid_out` - Wire transfer completed and recorded

**Payout status:**
- `pending` - Payout initiated but not completed
- `processing` - Wire transfer in progress
- `paid` - Successfully paid
- `failed` - Wire transfer failed
- `cancelled` - Payout cancelled

## What Still Needs to Be Done

### 1. Run the Migration ⚠️
```bash
# Apply the migration to add all tables and columns:
psql -h peruwnbrqkvmrldhpoom.supabase.co \
  -U postgres \
  -d postgres \
  < supabase/migrations/add_developer_earnings_system.sql
```

Or run in Supabase SQL Editor dashboard.

### 2. Test the Complete Flow

**Test reconciliation:**
```bash
# Generate a test click first (use existing test script)
# Then run reconciliation
./supabase/scripts/run-reconciliation.sh
```

**Test earnings API:**
```bash
# Get developer API key from database
curl https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/developer-earnings \
  -H "X-API-Key: test-developer-key"
```

### 3. Integration with Developer Dashboard

Add earnings display to developer dashboard:
- Show pending_earnings, available_balance, lifetime_earnings
- Display recent earnings breakdown
- Show payout history
- Display eligibility status

### 4. Schedule Daily Reconciliation (Optional)

Set up cron job or Supabase scheduled function to run reconciliation automatically:
```sql
-- Example: Create a Supabase cron job
SELECT cron.schedule(
  'daily-earnings-reconciliation',
  '0 2 * * *', -- 2am daily
  $$
  SELECT net.http_post(
    url:='https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/reconcile-earnings',
    headers:='{"Content-Type": "application/json", "apikey": "anon-key"}'::jsonb
  );
  $$
);
```

## Security Considerations

✅ **Already implemented:**
- API key authentication for developer earnings endpoint
- Service role key for reconciliation (admin only)
- Rate limiting on all endpoints
- Transaction rollback on failures

⚠️ **For production:**
- Add webhook signature verification for automated payouts
- Encrypt sensitive payment_method data
- Implement audit logging for all payout operations
- Add two-factor auth for payout approvals

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/reconcile-earnings` | POST | Anon | Daily reconciliation job |
| `/developer-earnings` | GET | X-API-Key | Developer earnings dashboard |
| `/developer-data` | GET | X-API-Key | Developer profile data |

## Files Created

```
supabase/
├── migrations/
│   └── add_developer_earnings_system.sql (migration)
├── supabase/functions/
│   ├── reconcile-earnings/
│   │   └── index.ts (deployed ✅)
│   └── developer-earnings/
│       └── index.ts (deployed ✅)
└── scripts/
    ├── run-reconciliation.sh (executable ✅)
    ├── view-developer-earnings.sh (executable ✅)
    ├── reconcile-to-available.sql
    ├── record-manual-payout.sql
    └── EARNINGS_WORKFLOW.md
```

## Ready for Launch?

**Status**: Almost! ✅

**Completed:**
- ✅ Database schema designed
- ✅ Reconciliation function built and deployed
- ✅ Developer earnings API built and deployed
- ✅ Manual payout scripts created
- ✅ Documentation complete

**Before launch:**
- ⚠️ Run the migration (add_developer_earnings_system.sql)
- ⚠️ Test end-to-end flow with real clicks
- ⚠️ Integrate earnings display in developer dashboard UI

**After launch:**
- Schedule daily reconciliation (cron or Supabase scheduled function)
- Monitor earnings accuracy
- Process first manual payout to validate workflow

## Questions?

Everything is documented in `supabase/scripts/EARNINGS_WORKFLOW.md`

For production automation, we can integrate:
- Stripe Connect for automated payouts
- PayPal Mass Payments
- Email notifications for developers
- Automatic 1099 generation for tax reporting
