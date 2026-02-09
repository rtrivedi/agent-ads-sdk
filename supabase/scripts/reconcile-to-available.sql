-- ============================================================================
-- MOVE PENDING EARNINGS TO AVAILABLE BALANCE
-- ============================================================================
-- Run this weekly after reviewing pending earnings
-- This marks earnings as "reconciled" and moves them from pending to available
-- Developers can then see their available balance for payout
--
-- What this does:
-- 1. Marks all pending earnings as "reconciled"
-- 2. Moves money from pending_earnings to available_balance
-- 3. Available balance is what you'll pay out via wire transfer
-- ============================================================================

DO $$
DECLARE
  v_developer RECORD;
  v_total_moved DECIMAL := 0;
  v_developers_updated INTEGER := 0;
BEGIN

  RAISE NOTICE '🔄 Moving pending earnings to available balance...';
  RAISE NOTICE '';

  -- Loop through each developer with pending earnings
  FOR v_developer IN
    SELECT
      d.id,
      d.agent_id,
      d.agent_name,
      d.pending_earnings,
      d.available_balance,
      COUNT(e.id) as pending_count
    FROM developers d
    LEFT JOIN earnings e ON d.id = e.developer_id AND e.status = 'pending'
    WHERE d.pending_earnings > 0
    GROUP BY d.id, d.agent_id, d.agent_name, d.pending_earnings, d.available_balance
  LOOP

    RAISE NOTICE '👤 Developer: % (%)', v_developer.agent_name, v_developer.agent_id;
    RAISE NOTICE '   Pending earnings: $%', v_developer.pending_earnings;
    RAISE NOTICE '   Pending clicks: %', v_developer.pending_count;

    -- Mark earnings as reconciled
    UPDATE earnings
    SET
      status = 'reconciled',
      reconciled_at = NOW()
    WHERE developer_id = v_developer.id
      AND status = 'pending';

    -- Move pending to available
    UPDATE developers
    SET
      available_balance = available_balance + pending_earnings,
      pending_earnings = 0
    WHERE id = v_developer.id;

    v_total_moved := v_total_moved + v_developer.pending_earnings;
    v_developers_updated := v_developers_updated + 1;

    RAISE NOTICE '   ✅ Moved $% to available balance', v_developer.pending_earnings;
    RAISE NOTICE '';

  END LOOP;

  RAISE NOTICE '✅ Reconciliation Complete!';
  RAISE NOTICE '   Developers updated: %', v_developers_updated;
  RAISE NOTICE '   Total moved: $%', v_total_moved;
  RAISE NOTICE '';
  RAISE NOTICE '💡 Next steps:';
  RAISE NOTICE '   1. Run view-developer-earnings.sh to see available balances';
  RAISE NOTICE '   2. Wire transfer money to developers';
  RAISE NOTICE '   3. Use record-manual-payout.sql to log each payout';

END $$;
