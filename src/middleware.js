import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Middleware — refreshes Supabase session tokens on every protected request.
 * Required by @supabase/ssr to keep sessions alive.
 */
export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove, required by @supabase/ssr
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/project/:path*',
    '/account/:path*',
    '/contractors/:path*',
  ],
};
