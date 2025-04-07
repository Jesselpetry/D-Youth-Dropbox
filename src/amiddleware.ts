// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // ✅ ไม่ต้อง auth สำหรับ static files
  const publicPaths = ['/_next/', '/favicon.ico', '/logo.png', '/api/', '/login']
  const isPublic = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (isPublic) return res

  // 🔐 Auth check
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // fallback safety
}
