// src/utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isAuthPage =
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/responder/login" ||
    path === "/auth/responder/register";
  const isPublicRoot = path === "/";

  // 1. Not logged in → redirect to login (except public pages)
  if (!user && !isAuthPage && !isPublicRoot) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    // 2. Logged-in user visiting /auth pages → send them home
    if (isAuthPage) {
      const { data: official } = await supabase
        .from("municipal_officials")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      const url = request.nextUrl.clone();
      url.pathname = official ? "/responder/dashboard" : "/citizen/dashboard";
      return NextResponse.redirect(url);
    }

    // 3. Non-officials trying to access /responder → redirect to citizen dashboard
    if (path.startsWith("/responder")) {
      const { data: official } = await supabase
        .from("municipal_officials")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!official) {
        const url = request.nextUrl.clone();
        url.pathname = "/citizen/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
