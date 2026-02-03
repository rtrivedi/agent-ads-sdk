-- Insert test data with proper UUIDs

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
  (gen_random_uuid(),
   'adv_pietra_001'::uuid,
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
  (gen_random_uuid(),
   'adv_pietra_001'::uuid,
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
  (gen_random_uuid(),
   'adv_pietra_001'::uuid,
   ARRAY['shopping.ecommerce.platform'],
   ARRAY['US'],
   ARRAY['en'],
   ARRAY['web'],
   'active',
   5000.00,
   0.00,
   3.00,
   0.85)
RETURNING id, bid_cpm, quality_score;

-- Note: You'll need to manually insert ad_units after getting the campaign IDs from above
-- Or use a transaction with CTEs:

WITH inserted_campaigns AS (
  INSERT INTO campaigns (
    id, advertiser_id, targeting_taxonomies, targeting_countries, targeting_languages,
    targeting_platforms, status, budget, budget_spent, bid_cpm, quality_score
  )
  VALUES
    (gen_random_uuid(), 'adv_pietra_001'::uuid, ARRAY['shopping.ecommerce.platform'],
     ARRAY['US','CA','UK'], ARRAY['en'], ARRAY['web','desktop','ios','android'],
     'active', 10000, 0, 5.50, 0.95),
    (gen_random_uuid(), 'adv_pietra_001'::uuid, ARRAY['shopping.ecommerce.platform'],
     ARRAY['US','CA'], ARRAY['en'], ARRAY['web','desktop'],
     'active', 8000, 0, 4.00, 0.80),
    (gen_random_uuid(), 'adv_pietra_001'::uuid, ARRAY['shopping.ecommerce.platform'],
     ARRAY['US'], ARRAY['en'], ARRAY['web'],
     'active', 5000, 0, 3.00, 0.85)
  RETURNING id, bid_cpm
)
INSERT INTO ad_units (id, campaign_id, unit_type, status, title, body, cta, action_url,
                      disclosure_label, disclosure_explanation, sponsor_name)
SELECT
  gen_random_uuid(),
  c.id,
  'sponsored_suggestion',
  'active',
  CASE c.bid_cpm
    WHEN 5.50 THEN 'Pietra - Launch Your Product Brand'
    WHEN 4.00 THEN 'Shopify - Start Selling Online'
    WHEN 3.00 THEN 'WooCommerce - Free E-commerce'
  END,
  CASE c.bid_cpm
    WHEN 5.50 THEN 'All-in-one platform with design, manufacturing, fulfillment. Join 10,000+ creators.'
    WHEN 4.00 THEN 'Build your online store. No coding needed. 14-day free trial. 2M+ merchants.'
    WHEN 3.00 THEN 'Transform your WordPress site. 100% free and open source. 5M+ stores.'
  END,
  'Start Free →',
  CASE c.bid_cpm
    WHEN 5.50 THEN 'https://pietra.com/signup?ref=am_test'
    WHEN 4.00 THEN 'https://shopify.com/trial?ref=am_test'
    WHEN 3.00 THEN 'https://woocommerce.com?ref=am_test'
  END,
  'Sponsored',
  'This is a paid advertisement',
  CASE c.bid_cpm
    WHEN 5.50 THEN 'Pietra'
    WHEN 4.00 THEN 'Shopify'
    WHEN 3.00 THEN 'WooCommerce'
  END
FROM inserted_campaigns c;

-- Verify
SELECT '✅ Inserted 3 campaigns + 3 ad units for shopping.ecommerce.platform' AS status;
