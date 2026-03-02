import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 1. ระบุ Generic Type ให้รู้ว่าเราใช้ schema 'dyouth' 
let supabaseClient: SupabaseClient<any, 'dyouth'> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'dyouth',
    },
  });
} else if (typeof window === 'undefined') {
  // Only log warning on server side during build
  console.warn('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a mock client for build time when env vars are not available
const mockSupabase = {
  from: () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
  }),
};

// 2. Cast Type ของ Mock ให้ตรงกับ Schema dyouth ด้วย
export const supabase = supabaseClient || (mockSupabase as unknown as SupabaseClient<any, 'dyouth'>);