import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ใช้ createBrowserClient ของ @supabase/ssr แทน เพื่อให้รองรับ Next.js และ PKCE 100%
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      flowType: 'pkce',
    },
    db: {
      schema: 'dyouth', // ระบุ Schema ชัดเจนเหมือนเดิม
    },
  }
) as SupabaseClient<any, 'dyouth'>;