import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const supa = await supabaseServer();
  const { data, error } = await supa.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });
  if (error || !data.user) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }

  // Confirm they're in admin_users
  const sb = supabaseAdmin();
  const { data: admin } = await sb
    .from("admin_users")
    .select("id, role")
    .eq("auth_user_id", data.user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!admin) {
    await supa.auth.signOut();
    return NextResponse.json({ error: "This account is not authorised for admin access." }, { status: 403 });
  }

  await sb.from("audit_log").insert({
    actor_user_id: data.user.id,
    actor_email: data.user.email,
    actor_role: admin.role,
    action: "admin.login",
    entity_type: "admin_user",
    entity_id: admin.id,
  });

  return NextResponse.json({ redirect: "/admin" });
}
