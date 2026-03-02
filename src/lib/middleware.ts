import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: {
          schema: "dyouth", // Always query the dyouth schema
        },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session if expired — required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Paths that are always accessible without authentication
    const publicPaths = [
      "/login",
      "/setup-profile",
      "/auth",
      "/auth/callback",
      "/family",
    ];

    const isPublicPath = publicPaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

    // Paths that are accessible whether or not the user is logged in
    const openPaths = ["/", "/walls", "/message"];
    const isOpenPath = openPaths.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

    // Redirect unauthenticated users away from protected pages
    if (!user && !isPublicPath && !isOpenPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  } catch {
    // Supabase client could not be created (e.g. missing env vars at build time)
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};