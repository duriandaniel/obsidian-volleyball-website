import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";
import { hasValidSimpleAdminCookie, SYNTHETIC_ADMIN } from "@/lib/admin/simple-auth";

// Server-side Supabase client that reads/writes the auth cookie.
// Use from server components, layouts, and route handlers that need to know
// who the current user is.
export async function supabaseServer() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        // In server components, setting cookies is a no-op; that's expected.
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Silently ignore — middleware handles cookie refresh
        }
      },
    },
  });
}

export type AdminRole = "admin" | "owner";

export type AdminUser = {
  id: string;
  auth_user_id: string;
  email: string;
  role: AdminRole;
};

// Returns the admin record for the currently-logged-in user, or null if they're
// not logged in or not an admin. Bypasses RLS (uses service role) for the lookup
// because admin_users itself has no RLS.
export async function currentAdmin(): Promise<AdminUser | null> {
  // Simple shared-password gate: if the cookie is valid, treat as owner.
  if (await hasValidSimpleAdminCookie()) {
    return SYNTHETIC_ADMIN;
  }

  // Fallback: Supabase email+password (still works for existing admin_users rows)
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("admin_users")
    .select("id, auth_user_id, email, role")
    .eq("auth_user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  return (data as AdminUser | null) ?? null;
}
