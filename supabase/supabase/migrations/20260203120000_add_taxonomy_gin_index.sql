-- Add GIN index for efficient taxonomy array operations
-- This enables fast hierarchical matching on targeting_taxonomies

-- GIN index on campaigns.targeting_taxonomies for array containment and pattern matching
CREATE INDEX IF NOT EXISTS idx_campaigns_targeting_taxonomies_gin
ON campaigns USING GIN(targeting_taxonomies);

-- This index accelerates queries like:
-- 1. Array containment: WHERE targeting_taxonomies @> ARRAY['insurance.auto']
-- 2. Array overlap: WHERE targeting_taxonomies && ARRAY['insurance', 'insurance.auto']
-- 3. Custom prefix matching (future): WHERE has_taxonomy_prefix(targeting_taxonomies, 'insurance')

-- Performance impact:
-- - Without index: Full table scan on campaigns (~O(n) campaigns)
-- - With index: Index scan (~O(log n) + O(matching campaigns))
-- - Expected improvement: 10-100x faster for taxonomy filtering

-- Index size estimate: ~10-20% of table size (minimal overhead)
