-- Simple test data insert using correct column names (id instead of campaign_id)
-- Run this manually via Supabase SQL Editor

-- Insert 3 campaigns for shopping.ecommerce.platform with different bids
INSERT INTO campaigns (
  id, advertiser_id, campaign_name,
  targeting_taxonomies, targeting_countries, targeting_languages, targeting_platforms,
  status, budget, budget_spent, bid_cpm, quality_score
)
VALUES
  -- Campaign 1: High bid (5.50), high quality (0.95) → composite: 5.225
  ('camp_ecom_pietra', 'adv_pietra_001', 'Pietra Platform',
   ARRAY['shopping.ecommerce.platform'], ARRAY['US','CA','UK'], ARRAY['en'], ARRAY['web','desktop','ios','android'],
   'active', 10000, 0, 5.50, 0.95),

  -- Campaign 2: Medium bid (4.00), medium quality (0.80) → composite: 3.200
  ('camp_ecom_shopify', 'adv_pietra_001', 'Shopify Platform',
   ARRAY['shopping.ecommerce.platform'], ARRAY['US','CA'], ARRAY['en'], ARRAY['web','desktop'],
   'active', 8000, 0, 4.00, 0.80),

  -- Campaign 3: Lower bid (3.00), good quality (0.85) → composite: 2.550
  ('camp_ecom_woo', 'adv_pietra_001', 'WooCommerce',
   ARRAY['shopping.ecommerce.platform'], ARRAY['US'], ARRAY['en'], ARRAY['web'],
   'active', 5000, 0, 3.00, 0.85)
ON CONFLICT (id) DO UPDATE SET
  bid_cpm = EXCLUDED.bid_cpm,
  quality_score = EXCLUDED.quality_score;

-- Insert corresponding ad units
INSERT INTO ad_units (
  id, campaign_id, unit_type, status,
  title, body, cta, action_url,
  disclosure_label, disclosure_explanation, sponsor_name
)
VALUES
  ('unit_pietra_001', 'camp_ecom_pietra', 'sponsored_suggestion', 'active',
   'Pietra - Launch Your Product Brand in 30 Days',
   'Turn your idea into a real product. All-in-one platform with design, manufacturing, fulfillment, and branded storefront. Join 10,000+ creators.',
   'Start Free Trial →',
   'https://pietra.com/signup?ref=am_test',
   'Sponsored', 'Paid advertisement', 'Pietra'),

  ('unit_shopify_001', 'camp_ecom_shopify', 'sponsored_suggestion', 'active',
   'Shopify - Start Selling Online Today',
   'Build your online store with Shopify. No coding needed. 14-day free trial. Over 2 million merchants trust us worldwide.',
   'Try Free for 14 Days →',
   'https://shopify.com/trial?ref=am_test',
   'Sponsored', 'Paid advertisement', 'Shopify'),

  ('unit_woo_001', 'camp_ecom_woo', 'sponsored_suggestion', 'active',
   'WooCommerce - Free WordPress E-commerce',
   'Transform your WordPress site into a powerful online store. 100% free and open source. Used by 5+ million stores.',
   'Download Free →',
   'https://woocommerce.com?ref=am_test',
   'Sponsored', 'Paid advertisement', 'WooCommerce')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body;

SELECT '✅ Test data inserted! 3 campaigns + 3 ad units for shopping.ecommerce.platform' AS status;
