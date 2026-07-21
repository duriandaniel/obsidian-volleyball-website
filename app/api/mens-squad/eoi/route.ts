import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

// Men's Development Squad expression of interest. No payment, no booking:
// just a row in mens_eoi so we can email everyone when a batch opens.

const POSITIONS = ["setter", "outside", "middle", "opposite", "libero", "flex"] as const;

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  preferred_position: z.enum(POSITIONS).optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Please check your name and email and try again." }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const email = body.email.toLowerCase().trim();
  const row = {
    name: body.name.trim(),
    email,
    phone: body.phone?.trim() || null,
    preferred_position: body.preferred_position ?? null,
  };

  // One active row per email: if they've registered before, refresh their details.
  const { data: existing } = await sb
    .from("mens_eoi")
    .select("id")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    const { error } = await sb.from("mens_eoi").update(row).eq("id", existing.id);
    if (error) {
      console.error("mens eoi update failed", error.message);
      return NextResponse.json({ error: "Could not save right now. Please try again." }, { status: 500 });
    }
  } else {
    const { error } = await sb.from("mens_eoi").insert(row);
    if (error) {
      // 23505 = someone double-submitted; that's still a success for them.
      if (error.code !== "23505") {
        console.error("mens eoi insert failed", error.message);
        return NextResponse.json({ error: "Could not save right now. Please try again." }, { status: 500 });
      }
    }
  }

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "mens_eoi.join",
    entity_type: "customer",
    entity_id: null,
    after: { email, name: row.name, preferred_position: row.preferred_position },
  });

  return NextResponse.json({ ok: true });
}
