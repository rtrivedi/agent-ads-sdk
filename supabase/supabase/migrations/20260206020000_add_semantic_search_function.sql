-- SQL function for fast semantic ad matching via vector similarity
CREATE OR REPLACE FUNCTION find_ads_by_semantic_similarity(
  query_embedding TEXT,          -- JSON string of embedding vector
  match_threshold DECIMAL,       -- Minimum similarity (0-1)
  match_count INT,               -- Max results to return
  placement_type TEXT            -- Filter by ad type
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
    jsonb_build_object(
      'id', c.id,
      'advertiser_id', c.advertiser_id,
      'targeting_taxonomies', c.targeting_taxonomies,
      'targeting_countries', c.targeting_countries,
      'targeting_languages', c.targeting_languages,
      'targeting_platforms', c.targeting_platforms,
      'status', c.status,
      'budget', c.budget,
      'budget_spent', c.budget_spent,
      'bid_cpm', c.bid_cpm,
      'bid_cpc', c.bid_cpc,
      'quality_score', c.quality_score
    ) as campaigns,
    (1 - (c.intent_embedding <=> query_embedding::vector))::DECIMAL(5,4) as semantic_similarity
  FROM ad_units au
  INNER JOIN campaigns c ON c.id = au.campaign_id
  WHERE
    au.status = 'active'
    AND c.status = 'active'
    AND c.intent_embedding IS NOT NULL
    AND au.unit_type = placement_type
    AND c.budget_spent < c.budget
    AND (1 - (c.intent_embedding <=> query_embedding::vector)) >= match_threshold
  ORDER BY
    (1 - (c.intent_embedding <=> query_embedding::vector)) *
    COALESCE(c.bid_cpc, 1.0) *
    COALESCE(c.quality_score, 1.0) DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_ads_by_semantic_similarity IS 'Find ads using vector similarity search, ranked by: similarity × bid × quality';

-- Log migration
DO $$
BEGIN
  RAISE NOTICE '✅ Created semantic search function: find_ads_by_semantic_similarity()';
  RAISE NOTICE '   - Uses pgvector cosine similarity (<=>)';
  RAISE NOTICE '   - Ranks by: similarity × bid × quality';
  RAISE NOTICE '   - Returns ads above match_threshold';
END $$;
