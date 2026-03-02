import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // ตัวแปร next เอาไว้เก็บ URL ปลายทางหลังจากล็อกอินเสร็จ (ค่าเริ่มต้นคือหน้า Home)
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()

    // สร้าง Supabase Client โดยอย่าลืมระบุ Schema dyouth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
        },
        db: { schema: 'dyouth' }, // ชี้เป้าไปที่ห้อง dyouth
      }
    )

    // 1. แลกเปลี่ยน Code จาก Google เพื่อสร้าง Session ในระบบ
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // 2. เช็คว่า User คนนี้มีข้อมูลในตาราง dyouth.profiles หรือยัง
      //    ดู user_name ด้วย เพราะ upsert จาก setup-profile ถึงจะกรอกข้อมูลจริง
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_name')
        .eq('id', user.id)
        .single()

      // 3. ถ้ายังไม่มี Profile หรือยังไม่ได้กรอก user_name → ไปหน้าตั้งค่าโปรไฟล์
      if (!profile || !profile.user_name) {
        return NextResponse.redirect(`${origin}/setup-profile`)
      }

      // 4. มี Profile ครบแล้ว → ไปหน้าหลัก หรือหน้าที่ตั้งใจจะไปแต่แรก
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // ถ้ามี Error ตอนล็อกอิน ให้เด้งกลับไปหน้า login พร้อมส่งแจ้งเตือน
  return NextResponse.redirect(`${origin}/login?error=true`)
}
