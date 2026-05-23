import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

const Body = z.object({
  type: z.enum(["term", "camp"]),
  title: z.string().min(1).max(200),
  season: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  venue_id: z.string().uuid(),
  default_capacity: z.number().int().positive(),
  skill_level: z.enum(["beginner", "intermediate", "advanced", "mixed", ""]).optional(),
  age_min: z.number().int().nullable().optional(),
  age_max: z.number().int().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]),
  pricing_rule_id: z.string().uuid().or(z.literal("")).optional().nullable(),
  trial_eligible: z.boolean(),
  refund_policy: z.enum(["forfeit", "credit", "cash"]),
  cancel_window_hours: z.number().int().min(0),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin || admin.role !== "owner") return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await ctx.params;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : "Invalid";
    return NextResponse.json({ error: `Invalid: ${msg}` }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: before } = await sb.from("programs").select("*").eq("id", id).maybeSingle();
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await sb
    .from("programs")
    .update({
      type: body.type,
      title: body.title,
      season: body.season || null,
      description: body.description || null,
      venue_id: body.venue_id,
      default_capacity: body.default_capacity,
      skill_level: body.skill_level || null,
      age_min: body.age_min ?? null,
      age_max: body.age_max ?? null,
      status: body.status,
      pricing_rule_id: body.pricing_rule_id || null,
      trial_eligible: body.trial_eligible,
      refund_policy: body.refund_policy,
      cancel_window_hours: body.cancel_window_hours,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("audit_log").insert({
    actor_user_id: admin.auth_user_id,
    actor_email: admin.email,
    actor_role: admin.role,
    action: "program.update",
    entity_type: "program",
    entity_id: id,
    before,
    after: body,
  });

  return NextResponse.json({ id });
}
