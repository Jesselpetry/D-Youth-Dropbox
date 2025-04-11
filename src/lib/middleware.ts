import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";


export const updateSession = async (request: NextRequest) => {
    console.log('🔥 updateSession called') // You should see this if it's called
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
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
                            request.cookies.set(name, value),
                        );
                        response = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options),
                        );
                    },
                },
            },
        );

        // This will refresh session if expired - required for Server Components
        // https://supabase.com/docs/guides/auth/server-side/nextjs
        const user = await supabase.auth.getUser();
     
 
        // protected routes
        const publicPaths = ["/login", "/setup-profile", "/auth", "/auth/callback", '/family'];
        
        // Check if current path is in public paths
        const isPublicPath = publicPaths.some(path => 
            request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)
        );
        console
        // Redirect to login if user has error and not on a public path
        if ((user.error !== null) && ( !isPublicPath && request.nextUrl.pathname !== "/" && request.nextUrl.pathname !== "/walls" )) {
          
            return NextResponse.redirect(new URL("/login", request.url));
     
        }
        if (!isPublicPath && request.nextUrl.pathname !== "/" && request.nextUrl.pathname !== "/walls" && request.nextUrl.pathname !== "/profile") {
      
            return NextResponse.redirect(new URL("/", request.url));
        }


        return response;

    } catch {

        // If you are here, a Supabase client could not be created!
        // This is likely because you have not set up environment variables.
        // Check out http://:3000 for Next Steps.
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
};