-- Add dedicated api_key column to advertisers table for better performance
-- This allows indexed lookups instead of slow full table scans

-- Add the column
ALTER TABLE advertisers
ADD COLUMN IF NOT EXISTS api_key TEXT;

-- Add other missing columns for complete advertiser record
ALTER TABLE advertisers
ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE advertisers
ADD COLUMN IF NOT EXISTS industry TEXT;

-- Create unique index for fast API key lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_advertisers_api_key
ON advertisers(api_key)
WHERE api_key IS NOT NULL;

-- Add comments
COMMENT ON COLUMN advertisers.api_key IS 'Advertiser dashboard API key for authentication (format: adv_...)';
COMMENT ON COLUMN advertisers.website IS 'Advertiser company website URL';
COMMENT ON COLUMN advertisers.industry IS 'Industry/vertical (e.g., ecommerce, SaaS, finance)';
