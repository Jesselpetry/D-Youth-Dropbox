import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

type DyouthClient = SupabaseClient<Record<string, unknown>, 'dyouth'>;

let _client: DyouthClient | null = null;

function getSupabaseClient(): DyouthClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: { flowType: 'pkce' },
    db: { schema: 'dyouth' },
  }) as DyouthClient;

  return _client;
}

// Proxy so all existing `supabase.xxx` call-sites work without changes,
// but the client is only created when first used (never during SSR/prerender).
export const supabase = new Proxy({} as DyouthClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});