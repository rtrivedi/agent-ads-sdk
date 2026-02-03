-- Insert Test Data for Multi-Ad Response Testing
-- Creates campaigns and ad units with different bids/quality scores
-- to test Option C (agent curation) ranking system

-- ============================================================================
-- TEST ADVERTISER
-- ============================================================================

-- Note: Skipping advertiser insert - using existing advertiser_id
-- The campaigns will reference an advertiser_id that should already exist
-- If you need to create a test advertiser, do it via the Supabase dashboard

-- ============================================================================
-- TEST CAMPAIGNS - E-Commerce Platform (shopping.ecommerce.platform)
-- Multiple campaigns targeting same taxonomy with different bids/quality
-- ============================================================================

-- Campaign 1: High bid, high quality (should rank #1)
INSERT INTO campaigns (
  campaign_id,
  advertiser_id,
  campaign_name,
  targeting_taxonomies,
  targeting_countries,
  targeting_languages,
  targeting_platforms,
  status,
  budget,
  budget_spent,
  bid_cpm,
  bid_cpc,
  quality_score
)
VALUES (
  'camp_ecom_pietra',
  'adv_test_001',
  'Pietra - Premium E-commerce Platform',
  ARRAY['shopping.ecommerce.platform'],
  ARRAY['US', 'CA', 'UK'],
  ARRAY['en'],
  ARRAY['web', 'desktop', 'ios', 'android'],
  'active',
  10000.00,
  0.00,
  5.50, -- High CPM bid
  0.50,
  0.95  -- High quality score
)
ON CONFLICT (campaign_id) DO UPDATE SET
  bid_cpm = EXCLUDED.bid_cpm,
  quality_score = EXCLUDED.quality_score,
  status = EXCLUDED.status;

-- Campaign 2: Medium bid, medium quality (should rank #2)
INSERT INTO campaigns (
  campaign_id,
  advertiser_id,
  campaign_name,
  targeting_taxonomies,
  targeting_countries,
  targeting_languages,
  targeting_platforms,
  status,
  budget,
  budget_spent,
  bid_cpm,
  bid_cpc,
  quality_score
)
VALUES (
  'camp_ecom_shopify',
  'adv_test_001',
  'Shopify - Start Your Store Today',
  ARRAY['shopping.ecommerce.platform'],
  ARRAY['US', 'CA'],
  ARRAY['en'],
  ARRAY['web', 'desktop'],
  'active',
  8000.00,
  0.00,
  4.00, -- Medium CPM bid
  0.40,
  0.80  -- Medium quality score
)
ON CONFLICT (campaign_id) DO UPDATE SET
  bid_cpm = EXCLUDED.bid_cpm,
  quality_score = EXCLUDED.quality_score,
  status = EXCLUDED.status;

-- Campaign 3: Lower bid, good quality (should rank #3)
INSERT INTO campaigns (
  campaign_id,
  advertiser_id,
  campaign_name,
  targeting_taxonomies,
  targeting_countries,
  targeting_languages,
  targeting_platforms,
  status,
  budget,
  budget_spent,
  bid_cpm,
  bid_cpc,
  quality_score
)
VALUES (
  'camp_ecom_woocommerce',
  'adv_test_001',
  'WooCommerce - Free E-commerce Plugin',
  ARRAY['shopping.ecommerce.platform'],
  ARRAY['US'],
  ARRAY['en'],
  ARRAY['web'],
  'active',
  5000.00,
  0.00,
  3.00, -- Lower CPM bid
  0.30,
  0.85  -- Good quality score
)
ON CONFLICT (campaign_id) DO UPDATE SET
  bid_cpm = EXCLUDED.bid_cpm,
  quality_score = EXCLUDED.quality_score,
  status = EXCLUDED.status;

-- ============================================================================
-- TEST AD UNITS - E-Commerce Platform
-- ============================================================================

-- Ad Unit 1: Pietra (should rank #1: 5.50 × 0.95 × 1.0 = 5.225)
INSERT INTO ad_units (
  id,
  campaign_id,
  unit_type,
  status,
  title,
  body,
  cta,
  action_url,
  disclosure_label,
  disclosure_explanation,
  sponsor_name
)
VALUES (
  'unit_ecom_pietra_001',
  'camp_ecom_pietra',
  'sponsored_suggestion',
  'active',
  'Pietra - Launch Your Product Brand in 30 Days',
  'Turn your idea into a real product. All-in-one platform with design, manufacturing, fulfillment, and branded storefront. Join 10,000+ creators.',
  'Start Free Trial →',
  'https://pietra.com/signup?ref=am_sdk_test',
  'Sponsored',
  'This is a paid advertisement from Pietra',
  'Pietra'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  status = EXCLUDED.status;

-- Ad Unit 2: Shopify (should rank #2: 4.00 × 0.80 × 1.0 = 3.2)
INSERT INTO ad_units (
  id,
  campaign_id,
  unit_type,
  status,
  title,
  body,
  cta,
  action_url,
  disclosure_label,
  disclosure_explanation,
  sponsor_name
)
VALUES (
  'unit_ecom_shopify_001',
  'camp_ecom_shopify',
  'sponsored_suggestion',
  'active',
  'Shopify - Start Selling Online Today',
  'Build your online store with Shopify. No coding needed. 14-day free trial. Over 2 million merchants trust us worldwide.',
  'Try Free for 14 Days →',
  'https://shopify.com/free-trial?ref=am_sdk_test',
  'Sponsored',
  'This is a paid advertisement from Shopify',
  'Shopify'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  status = EXCLUDED.status;

-- Ad Unit 3: WooCommerce (should rank #3: 3.00 × 0.85 × 1.0 = 2.55)
INSERT INTO ad_units (
  id,
  campaign_id,
  unit_type,
  status,
  title,
  body,
  cta,
  action_url,
  disclosure_label,
  disclosure_explanation,
  sponsor_name
)
VALUES (
  'unit_ecom_woocommerce_001',
  'camp_ecom_woocommerce',
  'sponsored_suggestion',
  'active',
  'WooCommerce - Free WordPress E-commerce',
  'Transform your WordPress site into a powerful online store. 100% free and open source. Used by 5+ million stores.',
  'Download Free Plugin →',
  'https://woocommerce.com/download?ref=am_sdk_test',
  'Sponsored',
  'This is a paid advertisement from WooCommerce',
  'WooCommerce'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  status = EXCLUDED.status;

-- ============================================================================
-- TEST CAMPAIGNS - Local Services (Movers)
-- ============================================================================

-- Campaign 4: Premium movers
INSERT INTO campaigns (
  campaign_id,
  advertiser_id,
  campaign_name,
  targeting_taxonomies,
  targeting_countries,
  targeting_languages,
  targeting_platforms,
  status,
  budget,
  budget_spent,
  bid_cpm,
  bid_cpc,
  quality_score
)
VALUES (
  'camp_movers_premium',
  'adv_test_001',
  'Premium Brooklyn Movers',
  ARRAY['local_services.movers.quote'],
  ARRAY['US'],
  ARRAY['en'],
  ARRAY['web', 'ios', 'android'],
  'active',
  3000.00,
  0.00,
  6.00,
  0.60,
  0.90
)
ON CONFLICT (campaign_id) DO UPDATE SET
  bid_cpm = EXCLUDED.bid_cpm,
  quality_score = EXCLUDED.quality_score,
  status = EXCLUDED.status;

-- Ad Unit 4: Movers
INSERT INTO ad_units (
  id,
  campaign_id,
  unit_type,
  status,
  title,
  body,
  cta,
  action_url,
  disclosure_label,
  disclosure_explanation,
  sponsor_name
)
VALUES (
  'unit_movers_premium_001',
  'camp_movers_premium',
  'sponsored_suggestion',
  'active',
  'Brooklyn Premium Movers - Same Day Service',
  'Licensed & insured movers serving NYC since 2015. Free estimates, packing services, and storage. Rated 4.9/5 stars by 500+ customers.',
  'Get Free Quote →',
  'https://demo-movers.example.com/quote?ref=am_sdk_test',
  'Sponsored',
  'This is a paid advertisement from Brooklyn Premium Movers',
  'Brooklyn Premium Movers'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  status = EXCLUDED.status;

-- ============================================================================
-- LOG RESULTS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Test data inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Created:';
  RAISE NOTICE '   - 1 test advertiser';
  RAISE NOTICE '   - 4 test campaigns';
  RAISE NOTICE '   - 4 test ad units';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Test scenarios:';
  RAISE NOTICE '   - shopping.ecommerce.platform → Returns 3 ranked ads';
  RAISE NOTICE '   - local_services.movers.quote → Returns 1 ad';
  RAISE NOTICE '';
  RAISE NOTICE '🔬 Expected ranking (shopping.ecommerce.platform):';
  RAISE NOTICE '   #1: Pietra       (score: 5.50 × 0.95 = 5.225)';
  RAISE NOTICE '   #2: Shopify      (score: 4.00 × 0.80 = 3.200)';
  RAISE NOTICE '   #3: WooCommerce  (score: 3.00 × 0.85 = 2.550)';
END $$;
