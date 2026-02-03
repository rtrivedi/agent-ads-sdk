-- Minimal test data insert using only required columns
-- Based on what the /v1/decide function actually queries

-- Insert 3 campaigns for shopping.ecommerce.platform
INSERT INTO campaigns (
  id,
  advertiser_id,
  targeting_taxonomies,
  targeting_countries,
  targeting_languages,
  targeting_platforms,
  status,
  budget,
  budget_spent,
  bid_cpm,
  quality_score
)
VALUES
  -- Campaign 1: High bid, high quality (score: 5.50 × 0.95 = 5.225)
  ('camp_ecom_pietra',
   'adv_pietra_001',
   ARRAY['shopping.ecommerce.platform'],
   ARRAY['US', 'CA', 'UK'],
   ARRAY['en'],
   ARRAY['web', 'desktop', 'ios', 'android'],
   'active',
   10000.00,
   0.00,
   5.50,
   0.95),

  -- Campaign 2: Medium bid, medium quality (score: 4.00 × 0.80 = 3.200)
  ('camp_ecom_shopify',
   'adv_pietra_001',
   ARRAY['shopping.ecommerce.platform'],
   ARRAY['US', 'CA'],
   ARRAY['en'],
   ARRAY['web', 'desktop'],
   'active',
   8000.00,
   0.00,
   4.00,
   0.80),

  -- Campaign 3: Lower bid, good quality (score: 3.00 × 0.85 = 2.550)
  ('camp_ecom_woo',
   'adv_pietra_001',
   ARRAY['shopping.ecommerce.platform'],
   ARRAY['US'],
   ARRAY['en'],
   ARRAY['web'],
   'active',
   5000.00,
   0.00,
   3.00,
   0.85)
ON CONFLICT (id) DO UPDATE SET
  bid_cpm = EXCLUDED.bid_cpm,
  quality_score = EXCLUDED.quality_score;

-- Insert corresponding ad units
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
VALUES
  ('unit_pietra_001',
   'camp_ecom_pietra',
   'sponsored_suggestion',
   'active',
   'Pietra - Launch Your Product Brand in 30 Days',
   'All-in-one platform with design, manufacturing, fulfillment, and branded storefront. Join 10,000+ creators.',
   'Start Free Trial →',
   'https://pietra.com/signup?ref=am_test',
   'Sponsored',
   'This is a paid advertisement from Pietra',
   'Pietra'),

  ('unit_shopify_001',
   'camp_ecom_shopify',
   'sponsored_suggestion',
   'active',
   'Shopify - Start Selling Online Today',
   'Build your online store with Shopify. No coding needed. 14-day free trial. Over 2 million merchants worldwide.',
   'Try Free for 14 Days →',
   'https://shopify.com/trial?ref=am_test',
   'Sponsored',
   'This is a paid advertisement from Shopify',
   'Shopify'),

  ('unit_woo_001',
   'camp_ecom_woo',
   'sponsored_suggestion',
   'active',
   'WooCommerce - Free WordPress E-commerce',
   'Transform your WordPress site into a powerful online store. 100% free and open source. Used by 5+ million stores.',
   'Download Free Plugin →',
   'https://woocommerce.com?ref=am_test',
   'Sponsored',
   'This is a paid advertisement from WooCommerce',
   'WooCommerce')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body;

-- Verify
SELECT '✅ Inserted 3 test campaigns + 3 ad units' AS result;
SELECT 'Expected ranking when requesting shopping.ecommerce.platform with max_units=3:' AS info;
SELECT 1 AS rank, 'Pietra' AS name, 5.50 AS bid, 0.95 AS quality, 5.225 AS composite_score
UNION ALL
SELECT 2, 'Shopify', 4.00, 0.80, 3.200
UNION ALL
SELECT 3, 'WooCommerce', 3.00, 0.85, 2.550
ORDER BY rank;
