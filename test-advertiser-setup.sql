-- Test Advertiser & Campaign Setup for click_context Testing
-- Run this to create a test advertiser, campaign, and ad unit

-- 1. Create test advertiser
INSERT INTO advertisers (id, company_name, contact_email, contact_name, budget_total, status)
VALUES (
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Test Advertiser Inc',
  'test@advertiser.com',
  'Test User',
  10000.00,
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_email = EXCLUDED.contact_email,
  updated_at = NOW();

-- 2. Create test campaign
INSERT INTO campaigns (
  id,
  advertiser_id,
  name,
  budget,
  bid_cpc,
  targeting_taxonomies,
  targeting_countries,
  targeting_languages,
  targeting_platforms,
  status,
  start_date
)
VALUES (
  'c2222222-2222-2222-2222-222222222222'::uuid,
  'a1111111-1111-1111-1111-111111111111'::uuid,
  'Test Campaign - Legal Services',
  5000.00,
  2.50,
  ARRAY['legal', 'legal.estate_planning'],
  ARRAY['US'],
  ARRAY['en'],
  ARRAY['web', 'ios', 'android'],
  'active',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  budget = EXCLUDED.budget,
  bid_cpc = EXCLUDED.bid_cpc,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 3. Create test ad unit (sponsored suggestion)
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
)
VALUES (
  'd3333333-3333-3333-3333-333333333333'::uuid,
  'c2222222-2222-2222-2222-222222222222'::uuid,
  'sponsored_suggestion',
  'Estate Planning Services',
  'Get expert help with wills, trusts, and estate planning. Free consultation.',
  'Schedule Free Consultation',
  'https://example.com/estate-planning',
  'LegalPro Services',
  'Sponsored',
  'This is a paid advertisement',
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  cta = EXCLUDED.cta,
  action_url = EXCLUDED.action_url,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Show created data
SELECT 'Advertiser Created:' as status, company_name, contact_email, budget_total
FROM advertisers
WHERE id = 'a1111111-1111-1111-1111-111111111111'::uuid;

SELECT 'Campaign Created:' as status, name, budget, bid_cpc, status
FROM campaigns
WHERE id = 'c2222222-2222-2222-2222-222222222222'::uuid;

SELECT 'Ad Unit Created:' as status, title, body, cta, action_url
FROM ad_units
WHERE id = 'd3333333-3333-3333-3333-333333333333'::uuid;
