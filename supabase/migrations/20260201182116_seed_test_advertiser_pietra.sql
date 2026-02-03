-- Seed Test Advertiser: Pietra Inc
-- This creates a complete test advertiser with campaign and ads

-- ============================================================================
-- 1. Create Test Advertiser: Pietra Inc
-- ============================================================================
INSERT INTO advertisers (
  id,
  company_name,
  contact_email,
  contact_name,
  budget_total,
  budget_spent,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID, -- Fixed UUID for easy reference
  'Pietra Inc',
  'ronak@pietrastudio.com',
  'Ronak Trivedi',
  10000.00, -- $10,000 total budget
  0.00,     -- Nothing spent yet
  'active'
);

-- ============================================================================
-- 2. Create Test Campaign: E-Commerce Platform Launch
-- ============================================================================
INSERT INTO campaigns (
  id,
  advertiser_id,
  name,
  budget,
  budget_spent,
  bid_cpm,
  bid_cpc,
  targeting_taxonomies,
  targeting_countries,
  targeting_languages,
  targeting_platforms,
  status,
  start_date,
  end_date
) VALUES (
  '00000000-0000-0000-0000-000000000002'::UUID, -- Fixed UUID for easy reference
  '00000000-0000-0000-0000-000000000001'::UUID, -- Links to Pietra advertiser
  'Pietra - E-Commerce Platform Launch',
  5000.00, -- $5,000 campaign budget
  0.00,
  5.00,    -- $5 CPM (cost per 1000 impressions)
  0.50,    -- $0.50 CPC (cost per click)

  -- Targeting: Show when users ask about e-commerce, online stores, or business tools
  ARRAY[
    'shopping.ecommerce.platform',
    'business.software.ecommerce',
    'shopping.store_setup',
    'business.startup.tools',
    'shopping.online_store'
  ],

  ARRAY['US', 'CA', 'UK'], -- US, Canada, UK
  ARRAY['en'],              -- English only
  ARRAY['web', 'ios', 'android'], -- All platforms

  'active',
  NOW(),                    -- Start now
  NOW() + INTERVAL '90 days' -- Run for 90 days
);

-- ============================================================================
-- 3. Create Test Ad Unit: Pietra Sponsored Suggestion
-- ============================================================================
INSERT INTO ad_units (
  id,
  campaign_id,
  unit_type,
  title,
  body,
  cta,
  action_url,
  sponsor_name,
  disclosure_label,
  disclosure_explanation,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000003'::UUID, -- Fixed UUID for easy reference
  '00000000-0000-0000-0000-000000000002'::UUID, -- Links to campaign
  'sponsored_suggestion',

  -- Ad creative
  'Pietra - E-Commerce Platform for Product Brands',
  'Launch your online store in minutes. Built-in inventory, shipping, and payments. Trusted by 10,000+ brands.',
  'Start Free Trial',
  'https://pietrastudio.com',

  -- Disclosure
  'Pietra Inc',
  'Sponsored',
  'This is a paid advertisement',

  'active'
);

-- ============================================================================
-- 4. Create Test Agent (for SDK testing)
-- ============================================================================
INSERT INTO agents (
  id,
  agent_id,
  api_key_live,
  api_key_test,
  owner_email,
  agent_name,
  sdk_type,
  environment,
  declared_placements,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000004'::UUID,
  'agt_test_worldview_app',
  'am_live_test_key_12345678901234567890', -- Test live key
  'am_test_test_key_12345678901234567890', -- Test test key
  'developer@example.com',
  'Worldview Test Agent',
  'typescript',
  'test',
  ARRAY['sponsored_suggestion'],
  'active'
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- Log what we created
DO $$
BEGIN
  RAISE NOTICE '✅ Created test advertiser: Pietra Inc';
  RAISE NOTICE '✅ Created test campaign with $5,000 budget';
  RAISE NOTICE '✅ Created test ad unit for e-commerce platform';
  RAISE NOTICE '✅ Created test agent for SDK testing';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Test API Key: am_test_test_key_12345678901234567890';
  RAISE NOTICE '🆔 Test Agent ID: agt_test_worldview_app';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Campaign targets these taxonomies:';
  RAISE NOTICE '  - shopping.ecommerce.platform';
  RAISE NOTICE '  - business.software.ecommerce';
  RAISE NOTICE '  - shopping.store_setup';
  RAISE NOTICE '  - business.startup.tools';
  RAISE NOTICE '  - shopping.online_store';
END $$;
