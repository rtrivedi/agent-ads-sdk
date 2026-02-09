-- ============================================================================
-- MANUAL PAYOUT RECORDING SCRIPT
-- ============================================================================
-- Use this after you've wire transferred money to a developer
-- This maintains proper accounting in the database
--
-- Steps:
-- 1. Replace the variables below with actual values
-- 2. Run this script in Supabase SQL Editor
-- 3. Verify the balances updated correctly
--
-- IMPORTANT: Wrapped in transaction for data consistency
-- ============================================================================

BEGIN;  -- Start transaction

-- CONFIGURATION: Update these values
-- ----------------------------------------
DO $$
DECLARE
  v_developer_id UUID := '00000000-0000-0000-0000-000000000000'; -- Replace with developer UUID
  v_agent_id TEXT := 'agent-name';                                -- Replace with agent_id
  v_amount DECIMAL := 150.00;                                     -- Amount paid out
  v_period_start TIMESTAMP := '2026-02-01 00:00:00';             -- Payout period start
  v_period_end TIMESTAMP := '2026-02-09 23:59:59';               -- Payout period end
  v_payment_method TEXT := 'wire_transfer';                       -- Payment method
  v_transaction_id TEXT := 'WIRE-20260209-001';                  -- Your transaction ID

  -- Internal variables
  v_payout_id UUID;
  v_developer_balance DECIMAL;
  v_click_count INTEGER;
  v_revenue_before_share DECIMAL;
  v_platform_fee DECIMAL;
BEGIN

  -- Step 1: Get earnings summary for this period
  -- NOTE: Looking for 'reconciled' status (earnings moved from pending to available)
  SELECT
    COUNT(*),
    SUM(gross_amount),
    SUM(platform_fee)
  INTO v_click_count, v_revenue_before_share, v_platform_fee
  FROM earnings
  WHERE developer_id = v_developer_id
    AND occurred_at >= v_period_start
    AND occurred_at <= v_period_end
    AND status = 'reconciled';

  RAISE NOTICE '📊 Payout Summary:';
  RAISE NOTICE '   Developer: % (%)', v_agent_id, v_developer_id;
  RAISE NOTICE '   Clicks: %', v_click_count;
  RAISE NOTICE '   Revenue (before share): $%', v_revenue_before_share;
  RAISE NOTICE '   Platform fee (30%%): $%', v_platform_fee;
  RAISE NOTICE '   Amount paying out: $%', v_amount;
  RAISE NOTICE '';

  -- Step 2: Get current developer balance
  SELECT available_balance INTO v_developer_balance
  FROM developers
  WHERE id = v_developer_id;

  -- Validate sufficient balance
  IF v_developer_balance < v_amount THEN
    RAISE EXCEPTION 'Insufficient balance: Developer has $% but payout is $%',
      v_developer_balance, v_amount;
  END IF;

  -- Validate that earnings exist for this period
  IF v_click_count = 0 OR v_revenue_before_share IS NULL THEN
    RAISE EXCEPTION 'No reconciled earnings found for period % to %. Run reconcile-to-available.sql first.',
      v_period_start, v_period_end;
  END IF;

  -- Step 3: Create payout record
  INSERT INTO payouts (
    developer_id,
    agent_id,
    amount,
    currency,
    status,
    payment_method,
    transaction_id,
    period_start,
    period_end,
    click_count,
    revenue_before_share,
    platform_fee,
    initiated_at,
    completed_at
  ) VALUES (
    v_developer_id,
    v_agent_id,
    v_amount,
    'USD',
    'paid',
    v_payment_method,
    v_transaction_id,
    v_period_start,
    v_period_end,
    v_click_count,
    v_revenue_before_share,
    v_platform_fee,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_payout_id;

  RAISE NOTICE '✅ Created payout record: %', v_payout_id;

  -- Step 4: Mark earnings as paid_out
  UPDATE earnings
  SET
    status = 'paid_out',
    payout_id = v_payout_id
  WHERE developer_id = v_developer_id
    AND occurred_at >= v_period_start
    AND occurred_at <= v_period_end
    AND status = 'reconciled';  -- Changed from 'pending' to 'reconciled'

  RAISE NOTICE '✅ Marked % earnings as paid_out', v_click_count;

  -- Step 5: Update developer balances
  UPDATE developers
  SET
    available_balance = available_balance - v_amount,
    total_paid_out = total_paid_out + v_amount,
    last_payout_at = NOW()
  WHERE id = v_developer_id;

  RAISE NOTICE '✅ Updated developer balances';
  RAISE NOTICE '';
  RAISE NOTICE '💸 Payout Complete!';
  RAISE NOTICE '   Transaction ID: %', v_transaction_id;
  RAISE NOTICE '   Amount: $%', v_amount;
  RAISE NOTICE '   New balance: $%', v_developer_balance - v_amount;

END $$;

COMMIT;  -- Commit transaction
