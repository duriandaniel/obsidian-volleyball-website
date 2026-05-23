import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ProgramForm, type ProgramFormInitial } from "../ProgramForm";
import { SessionGenerator } from "./SessionGenerator";
import { SessionList } from "./SessionList";

export const dynamic = "force-dynamic";

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin || admin.role !== "owner") redirect("/admin");

  const { id } = await params;
  const sb = supabaseAdmin();
  const [{ data: program }, { data: venues }, { data: pricingRules }] = await Promise.all([
    sb.from("programs").select("*").eq("id", id).is("deleted_at", null).maybeSingle(),
    sb.from("venues").select("id, name").is("deleted_at", null).order("name"),
    sb.from("pricing_rules").select("id, name, scope").order("name"),
  ]);
  if (!program) notFound();

  const initial: ProgramFormInitial = {
    id: program.id,
    type: program.type,
    title: program.title,
    slug: program.slug,
    season: program.season ?? "",
    description: program.description ?? "",
    venue_id: program.venue_id,
    default_capacity: program.default_capacity,
    skill_level: program.skill_level ?? "mixed",
    age_min: program.age_min,
    age_max: program.age_max,
    status: program.status,
    pricing_rule_id: program.pricing_rule_id ?? "",
    trial_eligible: program.trial_eligible,
    refund_policy: program.refund_policy,
    cancel_window_hours: program.cancel_window_hours,
  };

  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, status, capacity_override")
    .eq("program_id", id)
    .is("deleted_at", null)
    .order("starts_at");

  // Booking counts per session
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: bookings } = sessionIds.length
    ? await sb
        .from("bookings")
        .select("session_id")
        .in("session_id", sessionIds)
        .in("status", ["confirmed", "pending", "attended"])
        .is("deleted_at", null)
    : { data: [] as { session_id: string }[] };
  const counts = new Map<string, number>();
  for (const b of bookings ?? []) counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/programs" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">
            ← All programs
          </Link>
          <h1 className="font-heading text-3xl mt-2">{program.title}</h1>
          <div className="text-sm text-gray-400 mt-1">
            <span className="uppercase text-xs mr-2">{program.type}</span>
            {program.season && <span>{program.season}</span>}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-xl mb-4">Details</h2>
        <ProgramForm venues={venues ?? []} pricingRules={pricingRules ?? []} initial={initial} />
      </div>

      <div>
        <h2 className="font-heading text-xl mb-4">Generate sessions</h2>
        <SessionGenerator programId={program.id} />
      </div>

      <div>
        <h2 className="font-heading text-xl mb-4">Sessions ({sessions?.length ?? 0})</h2>
        <SessionList
          sessions={(sessions ?? []).map((s) => ({
            id: s.id,
            starts_at: s.starts_at,
            ends_at: s.ends_at,
            status: s.status,
            capacity_override: s.capacity_override,
            booked: counts.get(s.id) ?? 0,
          }))}
          defaultCapacity={program.default_capacity}
        />
      </div>
    </div>
  );
}
