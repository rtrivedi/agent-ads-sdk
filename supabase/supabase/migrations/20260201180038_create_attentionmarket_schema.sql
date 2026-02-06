-- AttentionMarket Platform Database Schema
-- This creates all tables needed to run the ad platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADVERTISERS TABLE
-- Companies/individuals who buy ads on your platform
-- ============================================================================
CREATE TABLE advertisers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  budget_total DECIMAL(10,2) DEFAULT 0.00,
  budget_spent DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_advertisers_email ON advertisers(contact_email);
CREATE INDEX idx_advertisers_status ON advertisers(status);

-- ============================================================================
-- CAMPAIGNS TABLE
-- Ad campaigns with targeting and budgets
-- ============================================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  budget_spent DECIMAL(10,2) DEFAULT 0.00,
  bid_cpm DECIMAL(10,2), -- Cost per 1000 impressions (optional)
  bid_cpc DECIMAL(10,2), -- Cost per click (optional)

  -- Targeting (JSON for flexibility)
  targeting_taxonomies TEXT[], -- ['local_services.movers.quote', ...]
  targeting_countries TEXT[], -- ['US', 'CA', ...]
  targeting_languages TEXT[], -- ['en', 'es', ...]
  targeting_platforms TEXT[], -- ['ios', 'android', 'web', ...]

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'out_of_budget')),

  -- Dates
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for targeting and queries
CREATE INDEX idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_taxonomies ON campaigns USING GIN(targeting_taxonomies);
CREATE INDEX idx_campaigns_countries ON campaigns USING GIN(targeting_countries);

-- ============================================================================
-- AD_UNITS TABLE
-- The actual ads (sponsored suggestions, sponsored tools, etc.)
-- ============================================================================
CREATE TABLE ad_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Ad metadata
  unit_type TEXT NOT NULL CHECK (unit_type IN ('sponsored_suggestion', 'sponsored_tool', 'sponsored_block')),

  -- Sponsored Suggestion fields
  title TEXT,
  body TEXT,
  cta TEXT, -- Call to action
  action_url TEXT,

  -- Sponsored Tool fields (future)
  tool_name TEXT,
  tool_description TEXT,
  tool_schema JSONB,

  -- Disclosure
  sponsor_name TEXT NOT NULL,
  disclosure_label TEXT DEFAULT 'Sponsored',
  disclosure_explanation TEXT DEFAULT 'This is a paid advertisement',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'rejected')),

  -- Metrics (denormalized for performance)
  impressions_count INT DEFAULT 0,
  clicks_count INT DEFAULT 0,
  conversions_count INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ad_units_campaign ON ad_units(campaign_id);
CREATE INDEX idx_ad_units_status ON ad_units(status);
CREATE INDEX idx_ad_units_type ON ad_units(unit_type);

-- ============================================================================
-- AGENTS TABLE
-- Developers/apps that use the SDK
-- ============================================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL UNIQUE, -- agt_01HV...

  -- API Keys
  api_key_live TEXT UNIQUE, -- am_live_...
  api_key_test TEXT UNIQUE, -- am_test_...

  -- Owner info
  owner_email TEXT NOT NULL,
  agent_name TEXT NOT NULL,

  -- SDK info
  sdk_type TEXT, -- 'typescript', 'python', 'other'
  sdk_version TEXT,

  -- Platform
  environment TEXT DEFAULT 'test' CHECK (environment IN ('test', 'live')),

  -- Capabilities (what types of ads they can show)
  declared_placements TEXT[], -- ['sponsored_suggestion', 'sponsored_tool']
  declared_capabilities TEXT[],

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_agent_id ON agents(agent_id);
CREATE INDEX idx_agents_api_key_live ON agents(api_key_live);
CREATE INDEX idx_agents_api_key_test ON agents(api_key_test);
CREATE INDEX idx_agents_email ON agents(owner_email);

-- ============================================================================
-- EVENTS TABLE
-- Track impressions, clicks, conversions, etc.
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event info
  event_id TEXT NOT NULL UNIQUE, -- From SDK (evt_...)
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'action', 'conversion', 'dismiss', 'hide_advertiser', 'report')),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- References
  agent_id TEXT NOT NULL, -- Which developer/app
  request_id TEXT NOT NULL, -- Groups events from same ad request
  decision_id TEXT, -- From decide endpoint
  ad_unit_id UUID REFERENCES ad_units(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  -- Tracking
  tracking_token TEXT,

  -- Context (for analytics)
  taxonomy TEXT,
  country TEXT,
  language TEXT,
  platform TEXT,

  -- Additional data
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for querying events
CREATE INDEX idx_events_event_id ON events(event_id);
CREATE INDEX idx_events_agent_id ON events(agent_id);
CREATE INDEX idx_events_request_id ON events(request_id);
CREATE INDEX idx_events_ad_unit_id ON events(ad_unit_id);
CREATE INDEX idx_events_campaign_id ON events(campaign_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);

-- ============================================================================
-- DECISIONS TABLE
-- Log all ad decision requests (for debugging and analytics)
-- ============================================================================
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Request info
  request_id TEXT NOT NULL UNIQUE,
  decision_id TEXT NOT NULL UNIQUE,

  -- Who requested
  agent_id TEXT NOT NULL,

  -- What they requested
  placement_type TEXT NOT NULL,
  placement_surface TEXT,
  taxonomy TEXT,
  query TEXT,

  -- Context
  country TEXT,
  language TEXT,
  platform TEXT,
  region TEXT,
  city TEXT,

  -- Response
  status TEXT NOT NULL CHECK (status IN ('filled', 'no_fill')),
  ad_unit_ids UUID[], -- IDs of ads returned

  -- Timing
  response_time_ms INT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_decisions_request_id ON decisions(request_id);
CREATE INDEX idx_decisions_agent_id ON decisions(agent_id);
CREATE INDEX idx_decisions_taxonomy ON decisions(taxonomy);
CREATE INDEX idx_decisions_created_at ON decisions(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ad_units_updated_at BEFORE UPDATE ON ad_units FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate agent IDs (agt_...)
CREATE OR REPLACE FUNCTION generate_agent_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'agt_' || substr(md5(random()::text), 1, 24);
END;
$$ LANGUAGE plpgsql;

-- Function to generate API keys (am_live_... or am_test_...)
CREATE OR REPLACE FUNCTION generate_api_key(prefix TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN prefix || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 32);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (for analytics)
-- ============================================================================

-- Campaign performance view
CREATE VIEW campaign_performance AS
SELECT
  c.id as campaign_id,
  c.name as campaign_name,
  a.company_name as advertiser_name,
  c.budget,
  c.budget_spent,
  c.status,
  COUNT(DISTINCT CASE WHEN e.event_type = 'impression' THEN e.id END) as total_impressions,
  COUNT(DISTINCT CASE WHEN e.event_type = 'click' THEN e.id END) as total_clicks,
  COUNT(DISTINCT CASE WHEN e.event_type = 'conversion' THEN e.id END) as total_conversions,
  CASE
    WHEN COUNT(DISTINCT CASE WHEN e.event_type = 'impression' THEN e.id END) > 0
    THEN (COUNT(DISTINCT CASE WHEN e.event_type = 'click' THEN e.id END)::FLOAT /
          COUNT(DISTINCT CASE WHEN e.event_type = 'impression' THEN e.id END)) * 100
    ELSE 0
  END as ctr_percentage
FROM campaigns c
JOIN advertisers a ON a.id = c.advertiser_id
LEFT JOIN ad_units au ON au.campaign_id = c.id
LEFT JOIN events e ON e.ad_unit_id = au.id
GROUP BY c.id, c.name, a.company_name, c.budget, c.budget_spent, c.status;

-- ============================================================================
-- COMMENTS (documentation)
-- ============================================================================

COMMENT ON TABLE advertisers IS 'Companies/individuals who purchase ads on AttentionMarket';
COMMENT ON TABLE campaigns IS 'Ad campaigns with targeting rules and budgets';
COMMENT ON TABLE ad_units IS 'Individual ads (sponsored suggestions, tools, etc.)';
COMMENT ON TABLE agents IS 'Developers/apps using the AttentionMarket SDK';
COMMENT ON TABLE events IS 'Tracks all ad events (impressions, clicks, conversions)';
COMMENT ON TABLE decisions IS 'Logs all ad decision requests for analytics';
