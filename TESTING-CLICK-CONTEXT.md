# Testing click_context Feature

This guide helps you verify that the `click_context` field is being stored correctly in Supabase.

## Prerequisites

You need:
1. ✅ Supabase deployed (already done)
2. ✅ Edge Function deployed (already done)
3. ✅ Database migration applied (already done)
4. 🔑 Your API key and Agent ID
5. 📊 At least one active campaign with an ad unit

## Option 1: Automated Test Script

### Step 1: Set Environment Variables

```bash
export AM_API_KEY="am_test_YOUR_KEY_HERE"
export AM_AGENT_ID="agt_YOUR_AGENT_ID"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

### Step 2: Run Test

```bash
npx tsx test-click-context.ts
```

### Expected Output

```
🧪 Testing click_context feature

1️⃣  Requesting ad from API...
✅ Received ad:
   Title: Estate Planning Services
   Body: Get expert help with wills, trusts, and estate planning...
   CTA: Schedule Free Consultation
   URL: https://example.com/estate-planning

2️⃣  Tracking impression...
✅ Impression tracked

3️⃣  Tracking click with click_context...
   Displayed to user:
   💼 Estate Planning Services

   Get expert help with wills, trusts, and estate planning...

   👉 Schedule Free Consultation
✅ Click tracked with event_id: abc-123-def

4️⃣  Verifying click_context in Supabase...
✅ Found click event in database:
   Event ID: abc-123-def
   Event Type: click
   Occurred At: 2026-02-07T01:30:45Z
   Click Context (column): ✅ PRESENT

   📝 Click Context Content:
   💼 Estate Planning Services

   Get expert help with wills, trusts, and estate planning...

   👉 Schedule Free Consultation

🎉 SUCCESS! click_context is being stored correctly!
```

## Option 2: Manual Test with cURL

### Step 1: Track a Click Event

```bash
curl -X POST 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/event' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'X-AM-API-Key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "event_id": "test-click-001",
    "occurred_at": "2026-02-07T01:00:00Z",
    "agent_id": "YOUR_AGENT_ID",
    "request_id": "test-req-001",
    "decision_id": "test-dec-001",
    "unit_id": "d3333333-3333-3333-3333-333333333333",
    "event_type": "click",
    "tracking_token": "test-token",
    "metadata": {
      "href": "https://example.com/test",
      "click_context": "💼 Estate Planning Services\n\nGet expert help with wills and trusts.\n\n👉 Schedule Free Consultation"
    }
  }'
```

### Step 2: Verify in Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/peruwnbrqkvmrldhpoom/editor
2. Open the **Table Editor**
3. Select the `events` table
4. Click **SQL Editor** and run:

```sql
SELECT
  event_id,
  event_type,
  occurred_at,
  click_context,
  metadata->>'click_context' as metadata_click_context
FROM events
WHERE event_type = 'click'
ORDER BY occurred_at DESC
LIMIT 5;
```

### Expected Result

You should see:
- ✅ `click_context` column populated with the message
- ✅ `metadata->>'click_context'` also contains the same text
- ✅ Both fields should match exactly

## Option 3: Query Existing Click Events

If you already have click events in production:

```sql
-- Check if click_context column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'click_context';

-- Count click events with/without click_context
SELECT
  COUNT(*) FILTER (WHERE click_context IS NOT NULL) as with_context,
  COUNT(*) FILTER (WHERE click_context IS NULL) as without_context,
  COUNT(*) as total
FROM events
WHERE event_type = 'click';

-- Show recent click events
SELECT
  event_id,
  occurred_at,
  agent_id,
  CASE
    WHEN click_context IS NOT NULL THEN 'HAS CONTEXT ✅'
    ELSE 'NO CONTEXT ❌'
  END as status,
  LEFT(click_context, 50) as context_preview
FROM events
WHERE event_type = 'click'
ORDER BY occurred_at DESC
LIMIT 10;
```

## Troubleshooting

### "No ad returned"
- Make sure you have active campaigns in Supabase
- Run `test-advertiser-setup.sql` to create test data
- Check campaign targeting matches your test query

### "click_context is NULL"
- Check SDK version: `npm list @the_ro_show/agent-ads-sdk` (should be 0.6.0)
- Verify Edge Function is deployed: `supabase functions list`
- Check Edge Function logs for errors

### "Failed to query Supabase"
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Check that you're using the service role key, not the anon key
- Verify the Supabase URL is correct

## Success Criteria

✅ **Feature is working correctly if:**
1. Click events are created with `event_type = 'click'`
2. The `click_context` column contains the displayed message
3. The `metadata->>'click_context'` also contains the message
4. You can query and filter by `click_context` for analytics

## Next Steps

Once verified, you can:
- Create analytics queries to see which ad copy converts best
- A/B test different presentation formats
- Optimize campaigns based on what users actually clicked
