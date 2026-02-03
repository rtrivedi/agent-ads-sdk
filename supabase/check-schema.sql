-- Check actual schema of tables
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('campaigns', 'ad_units', 'advertisers')
ORDER BY table_name, ordinal_position;
