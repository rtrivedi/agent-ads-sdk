-- Create RPC functions to atomically increment ad unit counters
-- These are called by the /v1/event Edge Function

-- Function to increment impressions_count
CREATE OR REPLACE FUNCTION increment_impressions(unit_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ad_units
  SET impressions_count = impressions_count + 1,
      updated_at = NOW()
  WHERE id = unit_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment clicks_count
CREATE OR REPLACE FUNCTION increment_clicks(unit_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ad_units
  SET clicks_count = clicks_count + 1,
      updated_at = NOW()
  WHERE id = unit_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment conversions_count
CREATE OR REPLACE FUNCTION increment_conversions(unit_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ad_units
  SET conversions_count = conversions_count + 1,
      updated_at = NOW()
  WHERE id = unit_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION increment_impressions IS 'Atomically increments impression count for an ad unit';
COMMENT ON FUNCTION increment_clicks IS 'Atomically increments click count for an ad unit';
COMMENT ON FUNCTION increment_conversions IS 'Atomically increments conversion count for an ad unit';
