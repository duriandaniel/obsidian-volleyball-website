import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

const Body = z.object({
  parent_email: z.string().email(),
  parent_first_name: z.string().min(1).max(100),
  parent_last_name: z.string().min(1).max(100),
  parent_phone: z.string().max(40).optional().nullable(),
  kid_first_name: z.string().min(1).max(100),
  kid_last_name: z.string().min(1).max(100),
  kid_year_at_school: z.string().max(40).optional().nullable(),
  kid_volleyball_level: z.enum(["beginner", "intermediate", "advanced"]).optional().nullable(),
  kid_school_name: z.string().max(200).optional().nullable(),
  kid_medical_notes: z.string().max(2000).optional().nullable(),
  payment_mode: z.enum(["comp", "paid_offline", "owed"]),
  amount_cents: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id: sessionId } = await ctx.params;

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : "Invalid";
    return NextResponse.json({ error: `Invalid: ${msg}` }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Validate session
  const { data: session } = await sb
    .from("sessions")
    .select("id, status, program_id, capacity_override")
    .eq("id", sessionId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status !== "scheduled") return NextResponse.json({ error: "Session is not bookable" }, { status: 400 });

  // Upsert customer
  const email = body.parent_email.toLowerCase();
  let customerId: string;
  {
    const { data: existing } = await sb
      .from("customers")
      .select("id")
      .eq("email", email)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) {
      customerId = existing.id;
      await sb
        .from("customers")
        .update({
          first_name: body.parent_first_name,
          last_name: body.parent_last_name,
          phone: body.parent_phone ?? null,
        })
        .eq("id", customerId);
    } else {
      const { data: created, error: cErr } = await sb
        .from("customers")
        .insert({
          email,
          first_name: body.parent_first_name,
          last_name: body.parent_last_name,
          phone: body.parent_phone ?? null,
        })
        .select("id")
        .single();
      if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
      customerId = created.id;
    }
  }

  // Find or create participant
  let participantId: string;
  {
    const { data: existingPart } = await sb
      .from("participants")
      .select("id")
      .eq("customer_id", customerId)
      .ilike("first_name", body.kid_first_name)
      .ilike("last_name", body.kid_last_name)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingPart) {
      participantId = existingPart.id;
      await sb
        .from("participants")
        .update({
          year_at_school: body.kid_year_at_school ?? null,
          volleyball_level: body.kid_volleyball_level ?? null,
          school_name: body.kid_school_name ?? null,
          medical_notes: body.kid_medical_notes ?? null,
        })
        .eq("id", participantId);
    } else {
      const { data: created, error: pErr } = await sb
        .from("participants")
        .insert({
          customer_id: customerId,
          first_name: body.kid_first_name,
          last_name: body.kid_last_name,
          year_at_school: body.kid_year_at_school ?? null,
          volleyball_level: body.kid_volleyball_level ?? null,
          school_name: body.kid_school_name ?? null,
          medical_notes: body.kid_medical_notes ?? null,
        })
        .select("id")
        .single();
      if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
      participantId = created.id;
    }
  }

  // Create booking
  const source = body.payment_mode === "comp" ? "comp" : "admin_manual";
  const paidAmount = body.payment_mode === "comp" ? 0 : body.amount_cents ?? null;
  const paidAt = body.payment_mode === "paid_offline" || body.payment_mode === "comp" ? new Date().toISOString() : null;

  const { data: booking, error: bErr } = await sb
    .from("bookings")
    .insert({
      session_id: sessionId,
      participant_id: participantId,
      customer_id: customerId,
      source,
      status: "confirmed",
      paid_amount_cents: paidAmount,
      paid_at: paidAt,
      cancellation_reason: body.notes || null,
    })
    .select("id")
    .single();
  if (bErr) {
    // Capacity guard message
    if (bErr.message?.includes("capacity")) {
      return NextResponse.json({ error: "Session is at capacity" }, { status: 409 });
    }
    return NextResponse.json({ error: bErr.message }, { status: 500 });
  }

  await sb.from("audit_log").insert({
    actor_user_id: admin.auth_user_id,
    actor_email: admin.email,
    actor_role: admin.role,
    action: "booking.manual_create",
    entity_type: "booking",
    entity_id: booking.id,
    after: { session_id: sessionId, customer_id: customerId, participant_id: participantId, payment_mode: body.payment_mode, amount_cents: paidAmount },
  });

  return NextResponse.json({ ok: true, booking_id: booking.id });
}
