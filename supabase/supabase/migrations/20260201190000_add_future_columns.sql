-- Add Future-Proof Columns to Support Advanced Matching
-- These columns will be NULL/default until we implement the features
-- But adding them NOW prevents breaking changes later

-- ============================================================================
-- CAMPAIGNS TABLE - Add Advanced Targeting
-- ============================================================================

-- Keyword-based targeting (for Phase 2)
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS targeting_keywords TEXT[] DEFAULT NULL;

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS negative_keywords TEXT[] DEFAULT NULL;

-- Quality scoring (for auction ranking)
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS quality_score DECIMAL(3,2) DEFAULT 1.0;

-- Flexible metadata for future signals
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN campaigns.targeting_keywords IS 'Keywords that should match user queries (Phase 2 feature)';
COMMENT ON COLUMN campaigns.negative_keywords IS 'Keywords that should NOT match (Phase 2 feature)';
COMMENT ON COLUMN campaigns.quality_score IS 'Campaign quality score 0.0-1.0 based on performance (used in auction)';
COMMENT ON COLUMN campaigns.metadata IS 'Flexible JSON field for future targeting signals';

-- ============================================================================
-- EVENTS TABLE - Add Context for ML Training
-- ============================================================================

-- Position where ad was shown (for CTR analysis)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS position_shown INTEGER;

-- Raw query text (for ML training)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS query_text TEXT;

-- Relevance score at time of showing (for analysis)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS relevance_score DECIMAL(3,2);

-- How many other ads were shown alongside this one
ALTER TABLE events
ADD COLUMN IF NOT EXISTS competing_ads_count INTEGER;

COMMENT ON COLUMN events.position_shown IS 'Position in results (1=first, 2=second, etc). For CTR analysis.';
COMMENT ON COLUMN events.query_text IS 'Raw user query text. For ML training and analysis.';
COMMENT ON COLUMN events.relevance_score IS 'Calculated relevance score when ad was shown. For performance analysis.';
COMMENT ON COLUMN events.competing_ads_count IS 'Number of other ads shown in same response. For auction analysis.';

-- ============================================================================
-- DECISIONS TABLE - Add Scoring Metadata
-- ============================================================================

-- Store which ads were considered but not shown
ALTER TABLE decisions
ADD COLUMN IF NOT EXISTS candidate_ad_count INTEGER DEFAULT 0;

-- Store scoring details for analysis
ALTER TABLE decisions
ADD COLUMN IF NOT EXISTS scoring_metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN decisions.candidate_ad_count IS 'Total ads that matched before ranking. For fill-rate analysis.';
COMMENT ON COLUMN decisions.scoring_metadata IS 'Details about how ads were scored. For debugging and optimization.';

-- ============================================================================
-- INDEXES for Future Performance
-- ============================================================================

-- Index for keyword searching (Phase 2)
CREATE INDEX IF NOT EXISTS idx_campaigns_keywords
ON campaigns USING GIN(targeting_keywords);

CREATE INDEX IF NOT EXISTS idx_campaigns_negative_keywords
ON campaigns USING GIN(negative_keywords);

-- Index for quality scoring (auction ranking)
CREATE INDEX IF NOT EXISTS idx_campaigns_quality_score
ON campaigns(quality_score DESC);

-- Index for event analysis
CREATE INDEX IF NOT EXISTS idx_events_position
ON events(position_shown);

CREATE INDEX IF NOT EXISTS idx_events_query_text
ON events USING GIN(to_tsvector('english', query_text));

-- ============================================================================
-- LOG MIGRATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Added future-proof columns to campaigns table';
  RAISE NOTICE '✅ Added ML training columns to events table';
  RAISE NOTICE '✅ Added scoring metadata to decisions table';
  RAISE NOTICE '✅ Created indexes for performance';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Database is now ready for:';
  RAISE NOTICE '   - Multi-ad responses (Option C)';
  RAISE NOTICE '   - Keyword matching (Phase 2)';
  RAISE NOTICE '   - AI-powered ranking (Phase 2)';
  RAISE NOTICE '   - Real-time auctions (Phase 3)';
END $$;
