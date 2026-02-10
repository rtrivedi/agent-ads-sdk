-- Budget Rollback Function
-- Adds ability to rollback budget charges in case of failures
-- Run this in Supabase SQL Editor

-- Create function to decrement campaign budget_spent (for rollbacks)
CREATE OR REPLACE FUNCTION decrement_campaign_budget(
  p_campaign_id UUID,
  p_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate amount is positive
  IF p_amount < 0 THEN
    RAISE EXCEPTION 'Budget amount must be non-negative, got %', p_amount;
  END IF;

  -- Atomic decrement with row locking to prevent race conditions
  UPDATE campaigns
  SET
    budget_spent = GREATEST(COALESCE(budget_spent, 0) - p_amount::DECIMAL(10,2), 0),
    updated_at = NOW()
  WHERE id = p_campaign_id;

  -- Verify update happened
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found: %', p_campaign_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION decrement_campaign_budget IS 'Decrements campaign budget_spent for rollback scenarios. Uses GREATEST to prevent negative values.';
