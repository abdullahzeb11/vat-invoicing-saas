import { createServerClient, type CookieOptions } from "@supabase/ssr";
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
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession reads from cookies — no network call to Supabase Auth.
  // Server components still call auth.getUser() via requireOrgContext for proper
  // server-side validation; this middleware only decides "redirect-or-not".
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const url = request.nextUrl.clone();
  const path = url.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup") || path.startsWith("/auth");
  const isAppRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/invoices") ||
    path.startsWith("/products") ||
    path.startsWith("/customers") ||
    path.startsWith("/settings") ||
    path.startsWith("/onboarding");

  if (!user && isAppRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
