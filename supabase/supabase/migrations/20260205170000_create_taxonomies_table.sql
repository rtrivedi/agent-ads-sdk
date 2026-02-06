-- Create taxonomies reference table for UI dropdown
CREATE TABLE IF NOT EXISTS taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT, -- e.g., 'insurance', 'legal', 'financial'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_taxonomies_value ON taxonomies(value);
CREATE INDEX IF NOT EXISTS idx_taxonomies_active ON taxonomies(is_active);

-- Insert initial taxonomy values from LOVABLE_ADVERTISER_SPEC.md
INSERT INTO taxonomies (value, label, category, is_active) VALUES
  ('insurance.auto.full_coverage.quote', 'Auto Insurance - Full Coverage', 'insurance', true),
  ('insurance.home.full_coverage.quote', 'Home Insurance - Quotes', 'insurance', true),
  ('insurance.life.term.quote', 'Life Insurance - Quotes', 'insurance', true),
  ('insurance.health.individual.quote', 'Health Insurance - Quotes', 'insurance', true),
  ('legal.family.divorce.consultation', 'Legal - Divorce Consultation', 'legal', true),
  ('legal.immigration.visa.consultation', 'Legal - Immigration Consultation', 'legal', true),
  ('legal.criminal.defense.consultation', 'Legal - Criminal Defense', 'legal', true),
  ('legal.estate.planning.consultation', 'Legal - Estate Planning', 'legal', true),
  ('business.formation.incorporation.service', 'Business Formation', 'business', true),
  ('business.ecommerce.platform.trial', 'E-commerce Platform Trial', 'business', true),
  ('home_services.moving.local.quote', 'Moving Services - Local Quote', 'home_services', true),
  ('home_services.hvac.repair.quote', 'HVAC Services - Quote', 'home_services', true),
  ('business.accounting.bookkeeping.service', 'Accounting Services', 'business', true),
  ('financial.loans.personal.application', 'Financial - Personal Loans', 'financial', true),
  ('financial.credit_cards.rewards.application', 'Financial - Credit Cards', 'financial', true)
ON CONFLICT (value) DO NOTHING;

COMMENT ON TABLE taxonomies IS 'Reference table of valid taxonomy values for campaign targeting';
COMMENT ON COLUMN taxonomies.value IS 'Taxonomy value used in campaigns.targeting_taxonomies';
COMMENT ON COLUMN taxonomies.label IS 'Human-readable label for UI dropdown';
COMMENT ON COLUMN taxonomies.category IS 'Top-level category for grouping';
