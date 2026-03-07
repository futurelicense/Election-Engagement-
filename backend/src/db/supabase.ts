import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Set them in Vercel → Project → Settings → Environment Variables.');
  }
  _client = createClient(url, key);
  return _client;
}

/** Use getSupabase() in routes so missing env returns 503 on first request instead of crashing at import. */
export function getSupabase(): SupabaseClient {
  return getClient();
}

/** @deprecated Use getSupabase() for better error handling on Vercel. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});
