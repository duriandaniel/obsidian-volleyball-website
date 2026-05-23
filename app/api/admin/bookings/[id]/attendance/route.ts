import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

const Body = z.object({
  status: z.enum(["confirmed", "attended", "no_show"]),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await ctx.params;

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data: existing } = await sb
    .from("bookings")
    .select("id, status")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const update: Record<string, unknown> = { status: body.status };
  if (body.status === "attended") update.attended_marked_at = new Date().toISOString();
  else if (body.status === "confirmed") update.attended_marked_at = null;

  const { error } = await sb.from("bookings").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("audit_log").insert({
    actor_user_id: admin.auth_user_id,
    actor_email: admin.email,
    actor_role: admin.role,
    action: "booking.attendance",
    entity_type: "booking",
    entity_id: id,
    before: { status: existing.status },
    after: { status: body.status },
  });

  return NextResponse.json({ ok: true });
}
