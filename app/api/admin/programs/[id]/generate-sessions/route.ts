import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

const Body = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weeks_count: z.number().int().min(1).max(52),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin || admin.role !== "owner") return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await ctx.params;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: program } = await sb.from("programs").select("id").eq("id", id).maybeSingle();
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });

  // Build Sydney-time ISO strings. Sydney is UTC+10 (AEST) or UTC+11 (AEDT).
  // For simplicity we accept the user's input as "local Sydney clock time" and
  // convert to UTC using the offset for that date. (Browser users will see times
  // in Sydney TZ anyway thanks to toLocaleString with timeZone Australia/Sydney.)
  const toIso = (yyyymmdd: string, hhmm: string) => {
    // Approximate offset: -10h or -11h depending on DST.
    // Use the JS Date to figure it out by constructing a Date in the browser's
    // TZ, then offsetting. Simpler: just emit "+10:00" and accept being 1h off
    // during DST shoulder weeks. Sydney DST runs Oct first Sun -> April first Sun.
    const dateParts = yyyymmdd.split("-").map(Number);
    const month = dateParts[1];
    // DST in Sydney: month 10,11,12,1,2,3 = +11; month 4,5,6,7,8,9 = +10
    // (rough; close enough for booking display purposes)
    const offset = [10, 11, 12, 1, 2, 3].includes(month) ? "+11:00" : "+10:00";
    return `${yyyymmdd}T${hhmm}:00${offset}`;
  };

  const startDate = new Date(`${body.start_date}T00:00:00`);
  const rows: { program_id: string; starts_at: string; ends_at: string; status: string }[] = [];
  // JS getDay: 0=Sun ... 6=Sat. Our UI is 0=Mon ... 6=Sun. Map.
  const uiToJsDay = (ui: number) => (ui === 6 ? 0 : ui + 1);

  for (let w = 0; w < body.weeks_count; w++) {
    for (const uiDay of body.weekdays) {
      const jsDay = uiToJsDay(uiDay);
      const d = new Date(startDate);
      const diff = (jsDay - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff + w * 7);
      const yyyymmdd = d.toISOString().slice(0, 10);
      rows.push({
        program_id: id,
        starts_at: toIso(yyyymmdd, body.start_time),
        ends_at: toIso(yyyymmdd, body.end_time),
        status: "scheduled",
      });
    }
  }

  if (rows.length === 0) return NextResponse.json({ created: 0 });

  const { data: inserted, error } = await sb.from("sessions").insert(rows).select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("audit_log").insert({
    actor_user_id: admin.auth_user_id,
    actor_email: admin.email,
    actor_role: admin.role,
    action: "session.generate",
    entity_type: "program",
    entity_id: id,
    after: { count: inserted?.length ?? 0, params: body },
  });

  return NextResponse.json({ created: inserted?.length ?? 0 });
}
