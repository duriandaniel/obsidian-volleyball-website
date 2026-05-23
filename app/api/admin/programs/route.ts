import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/booking/slug";

const Body = z.object({
  type: z.enum(["term", "camp"]),
  title: z.string().min(1).max(200),
  season: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  venue_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid id"),
  default_capacity: z.number().int().positive(),
  skill_level: z.enum(["beginner", "intermediate", "advanced", "mixed", ""]).optional(),
  age_min: z.number().int().nullable().optional(),
  age_max: z.number().int().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  pricing_rule_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).or(z.literal("")).optional().nullable(),
  trial_eligible: z.boolean().default(true),
  refund_policy: z.enum(["forfeit", "credit", "cash"]).default("credit"),
  cancel_window_hours: z.number().int().min(0).default(24),
});

export async function POST(req: NextRequest) {
  const admin = await currentAdmin();
  if (!admin || admin.role !== "owner") return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : "Invalid";
    return NextResponse.json({ error: `Invalid: ${msg}` }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const baseSlug = slugify(body.title);
  // Ensure slug uniqueness by appending a short hash if collision
  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await sb.from("programs").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: inserted, error } = await sb
    .from("programs")
    .insert({
      type: body.type,
      title: body.title,
      slug,
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
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("audit_log").insert({
    actor_user_id: admin.auth_user_id,
    actor_email: admin.email,
    actor_role: admin.role,
    action: "program.create",
    entity_type: "program",
    entity_id: inserted.id,
    after: body,
  });

  return NextResponse.json({ id: inserted.id });
}
