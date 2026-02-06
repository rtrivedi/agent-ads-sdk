-- Add password column to advertisers table for login
ALTER TABLE advertisers
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_advertisers_email 
ON advertisers(contact_email);

COMMENT ON COLUMN advertisers.password_hash IS 'Bcrypt hashed password for advertiser login';
