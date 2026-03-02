import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

type DyouthClient = SupabaseClient<Record<string, unknown>, 'dyouth'>;

let _client: DyouthClient | null = null;

/**
 * Returns a singleton Supabase browser client.
 * Lazily instantiated so it is never created during SSR/prerender
 * when NEXT_PUBLIC_* env vars are unavailable.
 */
function getSupabaseClient(): DyouthClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Make sure these are set in your .env.local (local) or Vercel Environment Variables (production).'
    );
  }

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: { flowType: 'pkce' },
    db: { schema: 'dyouth' },
  }) as DyouthClient;

  return _client;
}

/**
 * Proxy that forwards every property access to the lazy client.
 * Allows `import { supabase } from '@/lib/supabaseClient'` to keep
 * working everywhere without any call-site changes.
 */
export const supabase = new Proxy({} as DyouthClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});