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

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // Define public paths that don't require authentication
    const publicPaths = [
      "/login",
      "/setup-profile",
      "/auth",
      "/auth/callback",
      "/family",
      "/shake", // Add /shake as a public path if it doesn't require authentication
    ];

    const isPublicPath = publicPaths.some(
      (path) =>
        request.nextUrl.pathname === path ||
        request.nextUrl.pathname.startsWith(path + "/")
    );

    // Redirect to login if user has error and not on a public path
    if (
      !user.data.user &&
      !isPublicPath &&
      request.nextUrl.pathname !== "/" &&
      request.nextUrl.pathname !== "/walls" &&
      request.nextUrl.pathname !== "/message"
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Additional logic for protected paths
    if (
      !isPublicPath &&
      request.nextUrl.pathname !== "/" &&
      !request.nextUrl.pathname.startsWith("/walls") &&
      request.nextUrl.pathname !== "/profile" &&
      !request.nextUrl.pathname.startsWith("/message")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};