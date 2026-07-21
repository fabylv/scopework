import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Supabase session refresh — called by middleware.js on every protected request.
 * Required by @supabase/ssr to keep auth tokens alive.
 */
export async function proxy(request) {
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


