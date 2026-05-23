import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresh the Supabase auth session cookie on every request so that
// server components see a valid session. Only runs on routes we actually need
// auth on (admin + booking portal) to keep marketing routes fast.
export async function middleware(request: NextRequest) {
  // Set the pathname as a header so server layouts can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the session so the cookie refreshes
  await supabase.auth.getUser();

  return response;
}

// /booking/portal uses its own cookie-based session (not Supabase Auth), so
// it doesn't need middleware. Only /admin needs the Supabase session refresh.
export const config = {
  matcher: ["/admin/:path*"],
};
