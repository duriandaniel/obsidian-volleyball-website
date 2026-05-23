import { NextRequest, NextResponse } from "next/server";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await ctx.params;
  const sb = supabaseAdmin();
  const { data: existing } = await sb.from("sessions").select("status").eq("id", id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const { error } = await sb.from("sessions").update({ status: "cancelled" }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cancel any confirmed/pending bookings for this session too
  await sb
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: "admin",
      cancellation_reason: "Session cancelled by admin",
    })
    .eq("session_id", id)
    .in("status", ["confirmed", "pending"]);

  await sb.from("audit_log").insert({
    actor_user_id: admin.auth_user_id,
    actor_email: admin.email,
    actor_role: admin.role,
    action: "session.cancel",
    entity_type: "session",
    entity_id: id,
    before: { status: existing.status },
    after: { status: "cancelled" },
  });

  return NextResponse.json({ ok: true });
}
