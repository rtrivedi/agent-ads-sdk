-- Verify Enhanced Matching System Deployment
-- Run this to confirm everything is working

-- 1. Check all critical tables exist
SELECT 'Tables Created' as check_type, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'market_cpc_rates',
    'conversion_patterns',
    'session_intelligence',
    'embedding_cache',
    'circuit_breakers',
    'api_rate_limits',
    'distributed_locks',
    'api_cost_tracking',
    'error_logs',
    'dead_letter_queue'
  );

-- 2. Check market rates populated
SELECT 'Market Rates' as check_type, COUNT(*) as count
FROM market_cpc_rates;

-- 3. Check circuit breakers initialized
SELECT 'Circuit Breakers' as check_type, service_name, state
FROM circuit_breakers;

-- 4. Check critical functions exist
SELECT 'Functions' as check_type, COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'calculate_enhanced_relevance',
    'calculate_pattern_boost',
    'check_rate_limit',
    'circuit_breaker_can_proceed',
    'system_health_check'
  );

-- 5. Test health check function
SELECT * FROM system_health_check();