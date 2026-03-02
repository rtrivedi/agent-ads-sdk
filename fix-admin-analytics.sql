-- Fix for Admin Analytics Functions
-- Simplified version that works with current schema

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_system_health();
DROP FUNCTION IF EXISTS get_financial_metrics(INTEGER);
DROP FUNCTION IF EXISTS get_campaign_analytics();
DROP FUNCTION IF EXISTS get_fraud_indicators();
DROP FUNCTION IF EXISTS get_recent_activity(INTEGER);
DROP FUNCTION IF EXISTS get_api_metrics();

-- ============================================================================
-- SIMPLIFIED SYSTEM HEALTH (without developers table)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_system_health()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH metrics AS (
    SELECT
      -- Active entities
      (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
      (SELECT COUNT(*) FROM advertisers WHERE status = 'active') as active_advertisers,
      (SELECT COUNT(DISTINCT agent_id) FROM events WHERE created_at > NOW() - INTERVAL '24 hours') as active_agents_24h,

      -- Today's activity
      (SELECT COUNT(*) FROM decisions WHERE created_at > CURRENT_DATE) as decisions_today,
      (SELECT COUNT(*) FROM events WHERE event_type = 'impression' AND created_at > CURRENT_DATE) as impressions_today,
      (SELECT COUNT(*) FROM events WHERE event_type = 'click' AND created_at > CURRENT_DATE) as clicks_today,
      (SELECT COUNT(*) FROM events WHERE event_type = 'conversion' AND created_at > CURRENT_DATE) as conversions_today,

      -- Financial snapshot (in dollars)
      (SELECT COALESCE(SUM(bid_cpc), 0) FROM campaigns c
       JOIN events e ON e.campaign_id = c.id
       WHERE e.event_type = 'click' AND e.created_at > CURRENT_DATE) as revenue_today,

      -- System performance
      (SELECT COUNT(*) FROM decisions WHERE created_at > NOW() - INTERVAL '1 hour') as decisions_last_hour,
      (SELECT COUNT(*) FROM rate_limits WHERE window_end > NOW()) as active_rate_limits,

      -- Error indicators
      (SELECT COUNT(*) FROM decisions WHERE status = 'error' AND created_at > CURRENT_DATE) as errors_today
  )
  SELECT json_build_object(
    'timestamp', NOW(),
    'active_campaigns', active_campaigns,
    'active_advertisers', active_advertisers,
    'active_agents_24h', active_agents_24h,
    'active_developers', 0,  -- Placeholder since no developers table
    'decisions_today', decisions_today,
    'impressions_today', impressions_today,
    'clicks_today', clicks_today,
    'conversions_today', conversions_today,
    'revenue_today', ROUND(revenue_today::NUMERIC, 2),
    'decisions_per_hour', decisions_last_hour,
    'active_rate_limits', active_rate_limits,
    'errors_today', errors_today,
    'fill_rate', CASE
      WHEN decisions_today > 0
      THEN ROUND(100.0 * (SELECT COUNT(*) FROM decisions WHERE status = 'filled' AND created_at > CURRENT_DATE) / decisions_today, 1)
      ELSE 0
    END,
    'ctr', CASE
      WHEN impressions_today > 0
      THEN ROUND(100.0 * clicks_today / impressions_today, 2)
      ELSE 0
    END
  ) INTO result
  FROM metrics;

  RETURN result;
END;
$$;

-- ============================================================================
-- SIMPLIFIED FINANCIAL METRICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_financial_metrics(p_days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH daily_metrics AS (
    SELECT
      DATE(e.created_at) as day,
      COUNT(CASE WHEN e.event_type = 'click' THEN 1 END) as clicks,
      SUM(CASE WHEN e.event_type = 'click' THEN c.bid_cpc ELSE 0 END) as gross_revenue,
      SUM(CASE WHEN e.event_type = 'click' THEN c.bid_cpc * 0.7 ELSE 0 END) as developer_earnings,
      SUM(CASE WHEN e.event_type = 'click' THEN c.bid_cpc * 0.3 ELSE 0 END) as platform_fees
    FROM events e
    LEFT JOIN campaigns c ON c.id = e.campaign_id
    WHERE e.created_at > CURRENT_DATE - INTERVAL '1 day' * p_days
    GROUP BY DATE(e.created_at)
    ORDER BY day DESC
  ),
  advertiser_spend AS (
    SELECT
      a.name as advertiser_name,
      COUNT(DISTINCT c.id) as campaign_count,
      SUM(c.budget_spent) as total_spent,
      SUM(c.budget_daily) as daily_budget,
      MIN(c.created_at) as first_campaign
    FROM advertisers a
    JOIN campaigns c ON c.advertiser_id = a.id
    GROUP BY a.id, a.name
    ORDER BY total_spent DESC NULLS LAST
    LIMIT 10
  )
  SELECT json_build_object(
    'summary', json_build_object(
      'total_revenue_30d', (SELECT COALESCE(SUM(gross_revenue), 0) FROM daily_metrics),
      'total_developer_earnings_30d', (SELECT COALESCE(SUM(developer_earnings), 0) FROM daily_metrics),
      'total_platform_fees_30d', (SELECT COALESCE(SUM(platform_fees), 0) FROM daily_metrics),
      'total_advertiser_budget', (SELECT COALESCE(SUM(budget_daily), 0) FROM campaigns WHERE status = 'active'),
      'total_spent_all_time', (SELECT COALESCE(SUM(budget_spent), 0) FROM campaigns)
    ),
    'daily_breakdown', (SELECT json_agg(row_to_json(daily_metrics.*)) FROM daily_metrics),
    'top_advertisers', (SELECT json_agg(row_to_json(advertiser_spend.*)) FROM advertiser_spend),
    'top_developers', json_build_array()  -- Empty array since no developers table
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- CAMPAIGN PERFORMANCE (Simplified)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_campaign_analytics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH campaign_metrics AS (
    SELECT
      c.id,
      c.name,
      a.name as advertiser_name,
      c.status,
      c.budget_daily,
      c.budget_spent,
      c.bid_cpc,
      c.impressions,
      c.clicks,
      c.created_at,
      -- Calculate metrics
      CASE
        WHEN c.budget_daily > 0
        THEN ROUND(100.0 * COALESCE(c.budget_spent, 0) / c.budget_daily, 1)
        ELSE 0
      END as budget_used_pct,
      CASE
        WHEN c.impressions > 0
        THEN ROUND(100.0 * c.clicks / c.impressions, 2)
        ELSE 0
      END as ctr,
      c.quality_score,
      -- Recent activity
      (SELECT COUNT(*) FROM events WHERE campaign_id = c.id AND created_at > NOW() - INTERVAL '24 hours') as events_24h
    FROM campaigns c
    JOIN advertisers a ON a.id = c.advertiser_id
    WHERE c.status = 'active'
  ),
  campaigns_near_limit AS (
    SELECT * FROM campaign_metrics
    WHERE budget_used_pct >= 80
    ORDER BY budget_used_pct DESC
    LIMIT 10
  ),
  low_performing AS (
    SELECT * FROM campaign_metrics
    WHERE impressions > 100 AND ctr < 0.5
    ORDER BY impressions DESC
    LIMIT 10
  ),
  high_performing AS (
    SELECT * FROM campaign_metrics
    WHERE clicks > 10
    ORDER BY ctr DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'total_active', (SELECT COUNT(*) FROM campaign_metrics),
    'campaigns_near_budget_limit', (SELECT json_agg(row_to_json(campaigns_near_limit.*)) FROM campaigns_near_limit),
    'low_performing_campaigns', (SELECT json_agg(row_to_json(low_performing.*)) FROM low_performing),
    'high_performing_campaigns', (SELECT json_agg(row_to_json(high_performing.*)) FROM high_performing),
    'new_campaigns_7d', (
      SELECT COUNT(*) FROM campaigns
      WHERE created_at > NOW() - INTERVAL '7 days'
    ),
    'paused_campaigns_7d', (
      SELECT COUNT(*) FROM campaigns
      WHERE status = 'paused' AND updated_at > NOW() - INTERVAL '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- FRAUD DETECTION (Simplified)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_fraud_indicators()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH click_velocity AS (
    SELECT
      agent_id,
      COUNT(*) as click_count,
      COUNT(DISTINCT campaign_id) as campaigns_clicked,
      MIN(created_at) as first_click,
      MAX(created_at) as last_click,
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 60 as minutes_span
    FROM events
    WHERE event_type = 'click'
      AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY agent_id
    HAVING COUNT(*) > 10
  ),
  suspicious_patterns AS (
    SELECT
      e.agent_id,
      COUNT(CASE WHEN e.event_type = 'impression' THEN 1 END) as impressions,
      COUNT(CASE WHEN e.event_type = 'click' THEN 1 END) as clicks
    FROM events e
    WHERE e.created_at > NOW() - INTERVAL '24 hours'
    GROUP BY e.agent_id
    HAVING COUNT(CASE WHEN e.event_type = 'impression' THEN 1 END) > 5
      AND COUNT(CASE WHEN e.event_type = 'click' THEN 1 END) = COUNT(CASE WHEN e.event_type = 'impression' THEN 1 END)
  )
  SELECT json_build_object(
    'high_velocity_clickers', (
      SELECT json_agg(json_build_object(
        'agent_id', agent_id,
        'clicks_per_minute', CASE
          WHEN minutes_span > 0 THEN ROUND(click_count / minutes_span, 1)
          ELSE click_count
        END,
        'total_clicks', click_count,
        'campaigns_affected', campaigns_clicked,
        'time_span_minutes', ROUND(minutes_span, 1)
      ))
      FROM click_velocity
      WHERE minutes_span > 0
      ORDER BY click_count / GREATEST(minutes_span, 1) DESC
    ),
    'rate_limit_violations', json_build_array(),  -- Empty for now
    'suspicious_100pct_ctr', (
      SELECT json_agg(json_build_object(
        'agent_id', agent_id,
        'impressions', impressions,
        'clicks', clicks,
        'ctr', 100.0
      ))
      FROM suspicious_patterns
    ),
    'hmac_failures_24h', 0,
    'duplicate_events_24h', 0
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- RECENT ACTIVITY (Simplified)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_recent_activity(p_limit INTEGER DEFAULT 50)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH recent_events AS (
    SELECT
      e.event_type,
      e.agent_id,
      e.created_at,
      c.name as campaign_name,
      c.bid_cpc as amount,
      e.metadata
    FROM events e
    LEFT JOIN campaigns c ON c.id = e.campaign_id
    ORDER BY e.created_at DESC
    LIMIT p_limit
  ),
  recent_decisions AS (
    SELECT
      d.id,
      d.status,
      d.agent_id,
      d.created_at,
      d.matched_ads_count
    FROM decisions d
    ORDER BY d.created_at DESC
    LIMIT 20
  )
  SELECT json_build_object(
    'recent_events', (SELECT json_agg(row_to_json(recent_events.*)) FROM recent_events),
    'recent_decisions', (SELECT json_agg(row_to_json(recent_decisions.*)) FROM recent_decisions)
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- API METRICS (Simplified)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_api_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH hourly_metrics AS (
    SELECT
      DATE_TRUNC('hour', created_at) as hour,
      COUNT(*) as total_requests,
      COUNT(CASE WHEN status = 'filled' THEN 1 END) as filled,
      COUNT(CASE WHEN status = 'no_fill' THEN 1 END) as no_fill,
      COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
      AVG(matched_ads_count) as avg_matches
    FROM decisions
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY DATE_TRUNC('hour', created_at)
    ORDER BY hour DESC
  ),
  endpoint_stats AS (
    SELECT
      'decide' as endpoint,
      COUNT(*) as requests_24h,
      ROUND(100.0 * COUNT(CASE WHEN status = 'filled' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as success_rate
    FROM decisions
    WHERE created_at > NOW() - INTERVAL '24 hours'
    UNION ALL
    SELECT
      'event' as endpoint,
      COUNT(*) as requests_24h,
      100.0 as success_rate
    FROM events
    WHERE created_at > NOW() - INTERVAL '24 hours'
  )
  SELECT json_build_object(
    'hourly_breakdown', (SELECT json_agg(row_to_json(hourly_metrics.*)) FROM hourly_metrics),
    'endpoint_stats', (SELECT json_agg(row_to_json(endpoint_stats.*)) FROM endpoint_stats),
    'current_qps', (
      SELECT COUNT(*) / 60.0
      FROM decisions
      WHERE created_at > NOW() - INTERVAL '1 minute'
    ),
    'fill_rate_24h', (
      SELECT ROUND(100.0 * COUNT(CASE WHEN status = 'filled' THEN 1 END) / NULLIF(COUNT(*), 0), 1)
      FROM decisions
      WHERE created_at > NOW() - INTERVAL '24 hours'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_system_health() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_financial_metrics(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_campaign_analytics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fraud_indicators() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activity(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_api_metrics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION get_system_health IS 'Admin dashboard: Real-time system health metrics (fixed)';
COMMENT ON FUNCTION get_financial_metrics IS 'Admin dashboard: Financial performance (fixed)';
COMMENT ON FUNCTION get_campaign_analytics IS 'Admin dashboard: Campaign performance (fixed)';
COMMENT ON FUNCTION get_fraud_indicators IS 'Admin dashboard: Fraud detection (fixed)';
COMMENT ON FUNCTION get_recent_activity IS 'Admin dashboard: Real-time activity (fixed)';
COMMENT ON FUNCTION get_api_metrics IS 'Admin dashboard: API performance (fixed)';