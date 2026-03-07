#!/usr/bin/env node
/**
 * Confirm Supabase connection. Run from backend/: node check-supabase.mjs
 * Loads .env from backend dir, creates client, runs a simple query.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in backend/.env');
  process.exit(1);
}

if (url.includes('your-project') || key.includes('your-service')) {
  console.error('❌ Replace placeholder values in backend/.env with your real Supabase URL and service_role key.');
  process.exit(1);
}

const supabase = createClient(url, key);

try {
  // Try a simple query (countries table exists in this project's schema)
  const { data, error } = await supabase.from('countries').select('id, name').limit(1);
  if (error) throw error;
  console.log('✅ Supabase connection OK');
  console.log('   Sample:', data?.length ? data : '(table empty)');
} catch (e) {
  console.error('❌ Supabase connection failed:', e.message);
  if (e.code) console.error('   Code:', e.code);
  process.exit(1);
}
