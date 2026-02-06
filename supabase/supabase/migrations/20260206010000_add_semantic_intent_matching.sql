-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- UPDATE CAMPAIGNS TABLE - Add Intent-Based Targeting
-- ============================================================================

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS intent_description TEXT,
ADD COLUMN IF NOT EXISTS ideal_customer TEXT,
ADD COLUMN IF NOT EXISTS trigger_contexts TEXT[],
ADD COLUMN IF NOT EXISTS intent_embedding vector(1536);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_campaigns_intent_embedding ON campaigns
USING ivfflat (intent_embedding vector_cosine_ops)
WITH (lists = 100);

COMMENT ON COLUMN campaigns.intent_description IS 'Plain English: What problems does this advertiser solve?';
COMMENT ON COLUMN campaigns.ideal_customer IS 'Plain English: Who is the ideal customer?';
COMMENT ON COLUMN campaigns.trigger_contexts IS 'Array of trigger phrases that indicate need';
COMMENT ON COLUMN campaigns.intent_embedding IS '1536-dim vector embedding of advertiser intent (OpenAI text-embedding-3-small)';

-- ============================================================================
-- UPDATE DECISIONS TABLE - Track Semantic Matching
-- ============================================================================

ALTER TABLE decisions
ADD COLUMN IF NOT EXISTS conversation_context TEXT,
ADD COLUMN IF NOT EXISTS user_intent_detected TEXT,
ADD COLUMN IF NOT EXISTS context_embedding vector(1536),
ADD COLUMN IF NOT EXISTS match_method TEXT CHECK (match_method IN ('semantic', 'taxonomy', 'hybrid')),
ADD COLUMN IF NOT EXISTS semantic_similarity_score DECIMAL(5,4);

COMMENT ON COLUMN decisions.conversation_context IS 'Agent context sent in decide request';
COMMENT ON COLUMN decisions.user_intent_detected IS 'Detected user intent from agent';
COMMENT ON COLUMN decisions.context_embedding IS 'Embedding of query context for analytics';
COMMENT ON COLUMN decisions.match_method IS 'How ad was matched: semantic, taxonomy, or hybrid';
COMMENT ON COLUMN decisions.semantic_similarity_score IS 'Cosine similarity 0-1 (higher = better match)';

-- ============================================================================
-- HELPER FUNCTION - Calculate Cosine Similarity
-- ============================================================================

CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS DECIMAL(5,4) AS $$
BEGIN
  RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION cosine_similarity IS 'Returns cosine similarity (0-1) between two vectors';

-- ============================================================================
-- LOG MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Enabled pgvector extension';
  RAISE NOTICE '✅ Added intent columns to campaigns table';
  RAISE NOTICE '✅ Created vector similarity index';
  RAISE NOTICE '✅ Added semantic tracking to decisions table';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for semantic intent matching!';
  RAISE NOTICE '   - Advertisers describe their business in plain English';
  RAISE NOTICE '   - System generates embeddings automatically';
  RAISE NOTICE '   - Agents get best-match ads via vector search';
END $$;
