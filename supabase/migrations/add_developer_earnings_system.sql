-- ============================================================================
-- Developer Earnings & Payout System
-- ============================================================================
-- Run this migration to add earnings tracking and payout management

-- ============================================================================
-- 1. ADD EARNINGS COLUMNS TO DEVELOPERS TABLE
-- ============================================================================

ALTER TABLE developers
ADD COLUMN IF NOT EXISTS pending_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS lifetime_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_paid_out DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS revenue_share_pct DECIMAL(5,2) DEFAULT 70.00,
ADD COLUMN IF NOT EXISTS payout_threshold DECIMAL(10,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS payout_schedule TEXT DEFAULT 'monthly' CHECK (payout_schedule IN ('weekly', 'monthly', 'manual')),
ADD COLUMN IF NOT EXISTS payment_method JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tax_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_payout_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN developers.pending_earnings IS 'Clicks tracked but not yet reconciled (updated daily)';
COMMENT ON COLUMN developers.available_balance IS 'Reconciled earnings ready for payout';
COMMENT ON COLUMN developers.lifetime_earnings IS 'Total earned all-time (never decreases)';
COMMENT ON COLUMN developers.total_paid_out IS 'Total amount paid out all-time';
COMMENT ON COLUMN developers.revenue_share_pct IS 'Developer revenue share percentage (default 70%)';
COMMENT ON COLUMN developers.payout_threshold IS 'Minimum balance to trigger payout (default $100)';
COMMENT ON COLUMN developers.payout_schedule IS 'How often payouts occur';
COMMENT ON COLUMN developers.payment_method IS 'Payment details: {type: "stripe|paypal|bank", details: {...}}';
COMMENT ON COLUMN developers.tax_info IS 'Tax information for 1099 reporting';

-- ============================================================================
-- 2. CREATE PAYOUTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),

  -- External payment tracking
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer'
  transaction_id TEXT, -- External transaction ID from payment processor
  failure_reason TEXT,

  -- Time period covered
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Metadata
  click_count INTEGER DEFAULT 0,
  revenue_before_share DECIMAL(10,2), -- Total advertiser spend
  platform_fee DECIMAL(10,2), -- 30% platform cut

  -- Timestamps
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payouts_developer_id ON payouts(developer_id);
CREATE INDEX idx_payouts_agent_id ON payouts(agent_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_period ON payouts(period_start, period_end);

COMMENT ON TABLE payouts IS 'Developer payout history and status';
COMMENT ON COLUMN payouts.amount IS 'Amount paid to developer (after revenue share)';
COMMENT ON COLUMN payouts.revenue_before_share IS 'Total advertiser spend this period';
COMMENT ON COLUMN payouts.platform_fee IS 'Platform cut (typically 30%)';

-- ============================================================================
-- 3. CREATE EARNINGS TABLE (Detailed Revenue Breakdown)
-- ============================================================================

CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who earned
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,

  -- From which campaign
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Amounts
  gross_amount DECIMAL(10,2) NOT NULL, -- Full CPC amount
  platform_fee DECIMAL(10,2) NOT NULL, -- 30% cut
  net_amount DECIMAL(10,2) NOT NULL,   -- Developer's 70%
  revenue_share_pct DECIMAL(5,2) DEFAULT 70.00,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reconciled', 'paid_out')),
  reconciled_at TIMESTAMP WITH TIME ZONE,
  payout_id UUID REFERENCES payouts(id) ON DELETE SET NULL,

  -- Context
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_earnings_developer_id ON earnings(developer_id);
CREATE INDEX idx_earnings_agent_id ON earnings(agent_id);
CREATE INDEX idx_earnings_campaign_id ON earnings(campaign_id);
CREATE INDEX idx_earnings_status ON earnings(status);
CREATE INDEX idx_earnings_occurred_at ON earnings(occurred_at);
CREATE INDEX idx_earnings_payout_id ON earnings(payout_id);

COMMENT ON TABLE earnings IS 'Detailed earnings per click for revenue breakdown';
COMMENT ON COLUMN earnings.gross_amount IS 'Full CPC amount advertiser paid';
COMMENT ON COLUMN earnings.net_amount IS 'Developer receives after platform fee';
COMMENT ON COLUMN earnings.status IS 'pending -> reconciled -> paid_out';

-- ============================================================================
-- 4. CREATE HELPER VIEW FOR DASHBOARD
-- ============================================================================

CREATE OR REPLACE VIEW developer_earnings_summary AS
SELECT
  d.id as developer_id,
  d.agent_id,
  d.agent_name,

  -- Balances
  d.pending_earnings,
  d.available_balance,
  d.lifetime_earnings,
  d.total_paid_out,

  -- Current period stats
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'pending' AND e.occurred_at >= NOW() - INTERVAL '30 days') as clicks_this_month,
  SUM(e.net_amount) FILTER (WHERE e.status = 'pending' AND e.occurred_at >= NOW() - INTERVAL '30 days') as pending_this_month,

  -- Payout info
  d.payout_threshold,
  d.payout_schedule,
  d.last_payout_at,
  CASE
    WHEN d.available_balance >= d.payout_threshold THEN true
    ELSE false
  END as eligible_for_payout,

  -- Payment method
  d.payment_method->>'type' as payment_method_type,
  d.payment_method->>'status' as payment_method_status

FROM developers d
LEFT JOIN earnings e ON d.id = e.developer_id
GROUP BY d.id;

COMMENT ON VIEW developer_earnings_summary IS 'Dashboard view for developer earnings';

-- ============================================================================
-- 5. ADD RECONCILIATION TRACKING TO EVENTS
-- ============================================================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS earning_id UUID REFERENCES earnings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_reconciled ON events(reconciled_at) WHERE reconciled_at IS NOT NULL;

COMMENT ON COLUMN events.reconciled_at IS 'When this event was included in earnings reconciliation';
COMMENT ON COLUMN events.earning_id IS 'Link to earnings record created from this event';

-- ============================================================================
-- 6. LOG MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Added earnings columns to developers table';
  RAISE NOTICE '✅ Created payouts table for payout history';
  RAISE NOTICE '✅ Created earnings table for detailed revenue tracking';
  RAISE NOTICE '✅ Created developer_earnings_summary view for dashboard';
  RAISE NOTICE '✅ Added reconciliation tracking to events';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for:';
  RAISE NOTICE '   - Daily earnings reconciliation';
  RAISE NOTICE '   - Developer dashboard with earnings breakdown';
  RAISE NOTICE '   - Automated payout processing';
END $$;
