import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
        db: { schema: 'dyouth' }
      }
    )

    // 1. ลองแลกเปลี่ยน Code เป็น Session
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    // 🚨 ถ้า Auth พัง ให้ล็อก Error ออกมาดู
    if (authError) {
      console.error('🔥 Auth Error:', authError.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(authError.message)}`)
    }

    if (data.user) {
      // 2. เช็ค Profile 
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // 🚨 ถ้าเช็ค Profile พัง (ที่ไม่ใช่ Error โค้ด PGRST116 แปลว่าหาข้อมูลไม่เจอ) ให้ล็อกออกมา
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('🔥 Profile Query Error:', profileError.message, profileError.details)
      }

      // 3. ถ้าไม่มี Profile ให้เด้งไปหน้าสร้าง
      if (!profile) {
        return NextResponse.redirect(`${origin}/setup-profile`) 
      }

      // 4. ถ้ามี Profile แล้ว ให้เข้าเว็บปกติ
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else {
    console.error('🔥 ไม่เจอค่า ?code= ใน URL ที่ส่งมาจาก Google')
  }

  return NextResponse.redirect(`${origin}/login?error=Missing_Code`)
}
