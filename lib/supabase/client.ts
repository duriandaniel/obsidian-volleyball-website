import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client using the publishable key.
// Safe to ship to client. Use for parent-portal queries with RLS.
let cached: ReturnType<typeof createClient> | null = null;

export function supabaseBrowser() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  cached = createClient(url, key);
  return cached;
}
