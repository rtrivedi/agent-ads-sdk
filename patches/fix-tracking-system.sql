-- ============================================================================
-- TRACKING SYSTEM FIX MIGRATION
-- Run this to fix all tracking inconsistencies
-- ============================================================================

BEGIN;

-- 1. Fix existing event type inconsistencies
UPDATE events
SET event_type = 'click'
WHERE event_type = 'ad_click';

-- 2. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_agent_type_created
ON events(agent_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_decision_id
ON events(decision_id)
WHERE decision_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_request_id
ON events(request_id)
WHERE request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_campaign_id
ON events(campaign_id)
WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_tracking_token
ON events(tracking_token)
WHERE tracking_token IS NOT NULL;

-- 3. Create tracking status view for debugging
CREATE OR REPLACE VIEW tracking_status AS
SELECT
  d.id as decision_id,
  d.request_id,
  d.agent_id,
  d.campaign_id,
  d.created_at as decision_time,
  EXISTS(
    SELECT 1 FROM events e
    WHERE e.decision_id = d.id
    AND e.event_type = 'impression'
  ) as has_impression,
  EXISTS(
    SELECT 1 FROM events e
    WHERE e.decision_id = d.id
    AND e.event_type IN ('click', 'ad_click')
  ) as has_click,
  (
    SELECT occurred_at FROM events e
    WHERE e.decision_id = d.id
    AND e.event_type = 'impression'
    ORDER BY occurred_at ASC
    LIMIT 1
  ) as first_impression_time,
  (
    SELECT occurred_at FROM events e
    WHERE e.decision_id = d.id
    AND e.event_type IN ('click', 'ad_click')
    ORDER BY occurred_at ASC
    LIMIT 1
  ) as first_click_time
FROM decisions d;

-- 4. Create function to check tracking health
CREATE OR REPLACE FUNCTION check_tracking_health()
RETURNS TABLE(
  metric_name TEXT,
  metric_value NUMERIC,
  status TEXT
) AS $$
BEGIN
  -- Check impression rate
  RETURN QUERY
  SELECT
    'impression_rate_24h'::TEXT,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN has_impression THEN decision_id END) /
          COUNT(DISTINCT decision_id), 1) as metric_value,
    CASE
      WHEN ROUND(100.0 * COUNT(DISTINCT CASE WHEN has_impression THEN decision_id END) /
                 COUNT(DISTINCT decision_id), 1) >= 90 THEN 'HEALTHY'
      WHEN ROUND(100.0 * COUNT(DISTINCT CASE WHEN has_impression THEN decision_id END) /
                 COUNT(DISTINCT decision_id), 1) >= 70 THEN 'WARNING'
      ELSE 'CRITICAL'
    END as status
  FROM tracking_status
  WHERE decision_time > NOW() - INTERVAL '24 hours';

  -- Check click-through rate
  RETURN QUERY
  SELECT
    'click_rate_24h'::TEXT,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN has_click THEN decision_id END) /
          NULLIF(COUNT(DISTINCT CASE WHEN has_impression THEN decision_id END), 0), 1) as metric_value,
    'INFO'::TEXT as status
  FROM tracking_status
  WHERE decision_time > NOW() - INTERVAL '24 hours';

  -- Check for orphaned events
  RETURN QUERY
  SELECT
    'orphaned_events_24h'::TEXT,
    COUNT(*)::NUMERIC as metric_value,
    CASE
      WHEN COUNT(*) = 0 THEN 'HEALTHY'
      WHEN COUNT(*) < 10 THEN 'WARNING'
      ELSE 'CRITICAL'
    END as status
  FROM events e
  WHERE e.decision_id IS NULL
  AND e.created_at > NOW() - INTERVAL '24 hours'
  AND e.event_type IN ('impression', 'click', 'ad_click');
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to fix orphaned events (match by tracking token)
CREATE OR REPLACE FUNCTION fix_orphaned_events()
RETURNS INTEGER AS $$
DECLARE
  fixed_count INTEGER := 0;
BEGIN
  -- Match orphaned events to decisions by tracking token
  UPDATE events e
  SET decision_id = d.id,
      campaign_id = COALESCE(e.campaign_id, d.campaign_id)
  FROM decisions d
  WHERE e.decision_id IS NULL
  AND e.tracking_token IS NOT NULL
  AND d.tracking_token = e.tracking_token
  AND e.created_at > NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  RETURN fixed_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Run the fix for orphaned events
SELECT fix_orphaned_events();

-- 7. Grant permissions
GRANT SELECT ON tracking_status TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_tracking_health() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION fix_orphaned_events() TO service_role;

-- 8. Create tracking metrics table for monitoring
CREATE TABLE IF NOT EXISTS tracking_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE NOT NULL,
  total_decisions INTEGER NOT NULL DEFAULT 0,
  total_impressions INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  impression_rate DECIMAL(5, 2),
  click_through_rate DECIMAL(5, 2),
  orphaned_events INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tracking_metrics_date
ON tracking_metrics(metric_date);

-- 9. Create function to update daily metrics
CREATE OR REPLACE FUNCTION update_tracking_metrics()
RETURNS VOID AS $$
DECLARE
  today DATE := CURRENT_DATE;
  decisions_count INTEGER;
  impressions_count INTEGER;
  clicks_count INTEGER;
  orphaned_count INTEGER;
BEGIN
  -- Count today's metrics
  SELECT COUNT(DISTINCT d.id)
  INTO decisions_count
  FROM decisions d
  WHERE DATE(d.created_at) = today;

  SELECT COUNT(DISTINCT e.decision_id)
  INTO impressions_count
  FROM events e
  WHERE e.event_type = 'impression'
  AND DATE(e.created_at) = today;

  SELECT COUNT(DISTINCT e.decision_id)
  INTO clicks_count
  FROM events e
  WHERE e.event_type IN ('click', 'ad_click')
  AND DATE(e.created_at) = today;

  SELECT COUNT(*)
  INTO orphaned_count
  FROM events e
  WHERE e.decision_id IS NULL
  AND DATE(e.created_at) = today
  AND e.event_type IN ('impression', 'click', 'ad_click');

  -- Upsert metrics
  INSERT INTO tracking_metrics (
    metric_date,
    total_decisions,
    total_impressions,
    total_clicks,
    impression_rate,
    click_through_rate,
    orphaned_events
  ) VALUES (
    today,
    decisions_count,
    impressions_count,
    clicks_count,
    CASE WHEN decisions_count > 0
         THEN ROUND(100.0 * impressions_count / decisions_count, 2)
         ELSE 0 END,
    CASE WHEN impressions_count > 0
         THEN ROUND(100.0 * clicks_count / impressions_count, 2)
         ELSE 0 END,
    orphaned_count
  )
  ON CONFLICT (metric_date) DO UPDATE SET
    total_decisions = EXCLUDED.total_decisions,
    total_impressions = EXCLUDED.total_impressions,
    total_clicks = EXCLUDED.total_clicks,
    impression_rate = EXCLUDED.impression_rate,
    click_through_rate = EXCLUDED.click_through_rate,
    orphaned_events = EXCLUDED.orphaned_events;
END;
$$ LANGUAGE plpgsql;

-- 10. Schedule daily metrics update (run at midnight UTC)
SELECT cron.schedule(
  'update-tracking-metrics',
  '0 0 * * *',
  'SELECT update_tracking_metrics();'
) WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'update-tracking-metrics'
);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES - Run these after migration
-- ============================================================================

-- Check tracking health
SELECT * FROM check_tracking_health();

-- View recent tracking status
SELECT * FROM tracking_status
WHERE decision_time > NOW() - INTERVAL '1 hour'
ORDER BY decision_time DESC
LIMIT 10;

-- Check today's metrics
SELECT * FROM tracking_metrics
WHERE metric_date = CURRENT_DATE;