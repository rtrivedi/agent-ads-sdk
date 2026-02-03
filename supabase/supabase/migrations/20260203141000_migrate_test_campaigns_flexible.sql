-- Migrate test campaigns to new taxonomy format
-- Flexible approach: Updates campaigns based on their old taxonomies

-- ============================================================================
-- Update all campaigns targeting old e-commerce taxonomy
-- ============================================================================

UPDATE campaigns
SET targeting_taxonomies = ARRAY[
  'business.ecommerce.platform.trial',
  'business.ecommerce.platform.compare',
  'business.ecommerce.platform.research'
]
WHERE 'shopping.ecommerce.platform' = ANY(targeting_taxonomies);

-- ============================================================================
-- Update all campaigns targeting old movers taxonomy
-- ============================================================================

UPDATE campaigns
SET targeting_taxonomies = ARRAY[
  'home_services.moving.local.quote',
  'home_services.moving.local.compare',
  'home_services.moving.local.research'
]
WHERE 'local_services.movers.quote' = ANY(targeting_taxonomies);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  ecommerce_count INT;
  movers_count INT;
BEGIN
  SELECT COUNT(*) INTO ecommerce_count
  FROM campaigns
  WHERE 'business.ecommerce.platform.trial' = ANY(targeting_taxonomies);

  SELECT COUNT(*) INTO movers_count
  FROM campaigns
  WHERE 'home_services.moving.local.quote' = ANY(targeting_taxonomies);

  RAISE NOTICE '✅ Taxonomy migration completed!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Updated campaigns:';
  RAISE NOTICE '   E-commerce: % campaigns', ecommerce_count;
  RAISE NOTICE '   Home services: % campaigns', movers_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Mappings applied:';
  RAISE NOTICE '   shopping.ecommerce.platform → business.ecommerce.platform.*';
  RAISE NOTICE '   local_services.movers.quote → home_services.moving.local.*';
END $$;
