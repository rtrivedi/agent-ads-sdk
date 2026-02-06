-- Fix critical performance and correctness bugs in semantic search

-- 1. Drop old IVFFlat index (requires minimum 100 rows)
DROP INDEX IF EXISTS idx_campaigns_intent_embedding;

-- 2. Create HNSW index instead (no minimum row requirement, better performance)
CREATE INDEX IF NOT EXISTS idx_campaigns_intent_embedding ON campaigns
USING hnsw (intent_embedding vector_cosine_ops);

-- 3. Recreate semantic search function with optimizations:
--    - Calculate cosine similarity once (not 3 times)
--    - Use correct bid type (bid_cpc OR bid_cpm)
CREATE OR REPLACE FUNCTION find_ads_by_semantic_similarity(
  query_embedding TEXT,
  match_threshold DECIMAL,
  match_count INT,
  placement_type TEXT
)
RETURNS TABLE (
  id UUID,
  campaign_id UUID,
  unit_type TEXT,
  title TEXT,
  body TEXT,
  cta TEXT,
  action_url TEXT,
  sponsor_name TEXT,
  status TEXT,
  campaigns JSONB,
  semantic_similarity DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH scored_ads AS (
    SELECT
      au.id,
      au.campaign_id,
      au.unit_type,
      au.title,
      au.body,
      au.cta,
      au.action_url,
      au.sponsor_name,
      au.status,
      c.id as c_id,
      c.advertiser_id,
      c.targeting_taxonomies,
      c.targeting_countries,
      c.targeting_languages,
      c.targeting_platforms,
      c.status as c_status,
      c.budget,
      c.budget_spent,
      c.bid_cpm,
      c.bid_cpc,
      c.quality_score,
      -- Calculate similarity ONCE (not 3x)
      (1 - (c.intent_embedding <=> query_embedding::vector))::DECIMAL(5,4) as similarity
    FROM ad_units au
    INNER JOIN campaigns c ON c.id = au.campaign_id
    WHERE
      au.status = 'active'
      AND c.status = 'active'
      AND c.intent_embedding IS NOT NULL
      AND au.unit_type = placement_type
      AND c.budget_spent < c.budget
  )
  SELECT
    scored_ads.id,
    scored_ads.campaign_id,
    scored_ads.unit_type,
    scored_ads.title,
    scored_ads.body,
    scored_ads.cta,
    scored_ads.action_url,
    scored_ads.sponsor_name,
    scored_ads.status,
    jsonb_build_object(
      'id', scored_ads.c_id,
      'advertiser_id', scored_ads.advertiser_id,
      'targeting_taxonomies', scored_ads.targeting_taxonomies,
      'targeting_countries', scored_ads.targeting_countries,
      'targeting_languages', scored_ads.targeting_languages,
      'targeting_platforms', scored_ads.targeting_platforms,
      'status', scored_ads.c_status,
      'budget', scored_ads.budget,
      'budget_spent', scored_ads.budget_spent,
      'bid_cpm', scored_ads.bid_cpm,
      'bid_cpc', scored_ads.bid_cpc,
      'quality_score', scored_ads.quality_score
    ) as campaigns,
    scored_ads.similarity as semantic_similarity
  FROM scored_ads
  WHERE scored_ads.similarity >= match_threshold
  ORDER BY
    scored_ads.similarity *
    COALESCE(scored_ads.bid_cpc, scored_ads.bid_cpm, 1.0) *
    COALESCE(scored_ads.quality_score, 1.0) DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_ads_by_semantic_similarity IS
  'OPTIMIZED: Find ads using vector similarity (calculated once), ranked by similarity × bid × quality';

-- Log changes
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed Bug #1: Replaced IVFFlat with HNSW index (no minimum row requirement)';
  RAISE NOTICE '✅ Fixed Bug #2: Cosine similarity now calculated once instead of 3x';
  RAISE NOTICE '✅ Fixed Bug #3: Scoring uses bid_cpc OR bid_cpm correctly';
END $$;
