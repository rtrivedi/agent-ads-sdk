# Developer Earnings & Payout Workflow

Complete guide to managing developer earnings and manual payouts for AttentionMarket MVP.

## System Overview

**Revenue Split**: 70% to developers, 30% platform fee

**Balance Types**:
- `pending_earnings`: Clicks tracked but not yet reviewed (updated daily)
- `available_balance`: Reviewed earnings ready for payout (updated weekly)
- `lifetime_earnings`: Total earned all-time (never decreases)
- `total_paid_out`: Total amount paid out all-time

**Status Flow**:
```
Unreconciled Click → pending earnings → reconciled/available → paid_out
```

## Daily Workflow

### 1. Run Earnings Reconciliation (Daily)

Process all unreconciled clicks and create earnings records:

```bash
./scripts/run-reconciliation.sh
```

**What this does:**
- Finds all unreconciled click events in `events` table
- Creates detailed earnings records in `earnings` table
- Calculates revenue split (70% developer, 30% platform)
- Updates `developers.pending_earnings`
- Updates `developers.lifetime_earnings`
- Marks events as reconciled with `reconciled_at` timestamp

**Example output:**
```
🔄 Starting earnings reconciliation...
📊 Found 47 unreconciled clicks
💰 Creating 47 earnings records
✅ Marking 47 events as reconciled
💸 Updating 3 developer balances
✅ Reconciliation complete
   - Processed: 47 clicks
   - Total earnings: $94.00
   - Developers updated: 3
```

## Weekly Workflow

### 2. Move Pending to Available (Weekly)

After reviewing pending earnings, move them to available balance:

```bash
# In Supabase SQL Editor, run:
psql < scripts/reconcile-to-available.sql
```

**What this does:**
- Reviews all developers with `pending_earnings > 0`
- Marks earnings status from `pending` → `reconciled`
- Moves money from `pending_earnings` → `available_balance`
- Prepares balances for payout

**Example output:**
```
🔄 Moving pending earnings to available balance...

👤 Developer: MyAgent (agent-123)
   Pending earnings: $94.00
   Pending clicks: 47
   ✅ Moved $94.00 to available balance

✅ Reconciliation Complete!
   Developers updated: 1
   Total moved: $94.00
```

### 3. Review Earnings Before Payout

View all developer balances and payout eligibility:

```bash
./scripts/view-developer-earnings.sh
```

**What you'll see:**
```json
[
  {
    "developer_id": "uuid-here",
    "agent_id": "my-agent",
    "agent_name": "My AI Agent",
    "pending_earnings": "0.00",
    "available_balance": "150.00",
    "lifetime_earnings": "150.00",
    "total_paid_out": "0.00",
    "clicks_this_month": 75,
    "payout_threshold": "100.00",
    "payout_schedule": "monthly",
    "eligible_for_payout": true,
    "payment_method_type": "wire_transfer"
  }
]
```

## Payout Processing (Manual)

### 4. Wire Transfer Money

For each developer with `eligible_for_payout: true`:

1. Review their `available_balance`
2. Confirm payment details (email, wire info)
3. Initiate wire transfer through your bank
4. Note the transaction ID

### 5. Record Payout in Database

After wire transfer completes, record it in the database:

```bash
# Edit scripts/record-manual-payout.sql with:
# - developer_id
# - agent_id
# - amount (must be <= available_balance)
# - period_start and period_end dates
# - transaction_id from your bank

# Then run in Supabase SQL Editor:
psql < scripts/record-manual-payout.sql
```

**What this does:**
- Creates payout record in `payouts` table with status `paid`
- Marks all earnings in period as `paid_out`
- Deducts amount from `available_balance`
- Updates `total_paid_out`
- Sets `last_payout_at` timestamp

**Example output:**
```
📊 Payout Summary:
   Developer: MyAgent (uuid-here)
   Clicks: 75
   Revenue (before share): $214.29
   Platform fee (30%): $64.29
   Amount paying out: $150.00

✅ Created payout record: payout-uuid
✅ Marked 75 earnings as paid_out
✅ Updated developer balances

💸 Payout Complete!
   Transaction ID: WIRE-20260209-001
   Amount: $150.00
   New balance: $0.00
```

## Developer Dashboard API

Developers can view their earnings via API:

```bash
curl https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/developer-earnings \
  -H "X-API-Key: developer-api-key-here"
```

**Response includes:**
- Current balances (pending, available, lifetime, paid_out)
- This month's clicks and earnings
- Payout eligibility status
- Recent earnings breakdown (last 100 clicks)
- Payout history (last 20 payouts)

## Database Tables

### `developers` table (updated columns)
- `pending_earnings`: Unreviewed earnings
- `available_balance`: Ready for payout
- `lifetime_earnings`: Total earned
- `total_paid_out`: Total paid
- `revenue_share_pct`: Developer's cut (default 70%)
- `payout_threshold`: Min balance for payout (default $100)
- `last_payout_at`: Last payout date

### `earnings` table (new)
- Detailed per-click revenue tracking
- Status: `pending` → `reconciled` → `paid_out`
- Links to: developer, campaign, advertiser, event
- Tracks: gross_amount, platform_fee, net_amount

### `payouts` table (new)
- Payout history and status
- Payment method and transaction ID
- Period covered (start/end dates)
- Click count and revenue breakdown

## Automation (Future)

For production, consider automating:

1. **Daily reconciliation**: Cron job or Supabase scheduled function
2. **Weekly review**: Auto-approve reconciled earnings after N days
3. **Automated payouts**: Stripe Connect or PayPal integration
4. **Email notifications**: Alert developers when payout is sent

For MVP, manual process gives you control and visibility before automating.

## Troubleshooting

**No unreconciled clicks found:**
- Check if events are being tracked (`SELECT * FROM events WHERE event_type='click'`)
- Verify budget is incrementing (`SELECT budget_spent FROM campaigns`)

**Insufficient balance error:**
- Check `available_balance` vs payout amount
- Verify earnings were moved from pending → available

**Developer not found:**
- Verify agent_id is registered in `developers` table
- Check API key is active

## Support

For questions or issues, check:
- Supabase logs: https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/logs
- Database directly via SQL Editor
- Event tracking in `events` table
