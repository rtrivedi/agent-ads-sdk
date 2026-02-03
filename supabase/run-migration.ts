/**
 * Quick script to run SQL migrations against remote Supabase
 * Usage: deno run --allow-net --allow-read run-migration.ts <migration-file>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  Deno.exit(1);
}

const migrationFile = Deno.args[0];
if (!migrationFile) {
  console.error('❌ Usage: deno run --allow-net --allow-read run-migration.ts <migration-file>');
  Deno.exit(1);
}

console.log(`📄 Reading migration: ${migrationFile}`);
const sql = await Deno.readTextFile(migrationFile);

console.log(`🔌 Connecting to: ${SUPABASE_URL}`);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log(`⚡ Executing SQL...`);
const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('❌ Migration failed:', error);
  Deno.exit(1);
}

console.log('✅ Migration executed successfully!');
console.log(data);
