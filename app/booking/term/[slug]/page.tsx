import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { TermEnrolForm } from "./TermEnrolForm";

export const metadata: Metadata = {
  title: "Enrol | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TermProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = supabaseAdmin();

  const { data: program } = await sb
    .from("programs")
    .select("id, slug, title, season, description, skill_level, age_min, age_max, default_capacity, venue_id, pricing_rule_id")
    .eq("slug", slug)
    .eq("type", "term")
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (!program) notFound();

  // Adults book per-night through the standalone drop-in flow.
  if (isAdultProgram(program)) redirect("/booking/adult");

  const [{ data: venue }, { data: rule }, { data: sessions }] = await Promise.all([
    sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle(),
    sb.from("pricing_rules").select("term_per_session_cents").eq("id", program.pricing_rule_id ?? "").maybeSingle(),
    sb
      .from("sessions")
      .select("id, starts_at, ends_at")
      .eq("program_id", program.id)
      .eq("status", "scheduled")
      .gte("starts_at", new Date().toISOString())
      .is("deleted_at", null)
      .order("starts_at"),
  ]);

  const perWeekCents = rule?.term_per_session_cents ?? 0;
  const remainingSessions = sessions ?? [];

  // Capacity check on the next upcoming session
  let booked = 0;
  if (remainingSessions[0]) {
    const { count } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("session_id", remainingSessions[0].id)
      .in("status", ["confirmed", "pending", "attended"])
      .is("deleted_at", null);
    booked = count ?? 0;
  }
  const soldOut = booked >= program.default_capacity;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/booking/term/junior" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← All classes</Link>
        <h1 className="font-heading text-4xl mt-4 mb-2">{program.title}</h1>
        <div className="text-gray-400 mb-8">
          {venue ? (venue.address ? `${venue.name}, ${venue.address}` : venue.name) : "Venue TBA"}
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <div>
            <h2 className="font-heading text-xl mb-3">Sessions you'll attend ({remainingSessions.length})</h2>
            {remainingSessions.length === 0 ? (
              <div className="border border-white/10 rounded-lg p-6 text-gray-400 text-sm">
                No upcoming sessions in this term. The term may have ended.
              </div>
            ) : (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                {remainingSessions.map((s) => (
                  <div key={s.id} className="px-4 py-3 border-b border-white/5 last:border-b-0 flex items-center justify-between text-sm">
                    <span>
                      {new Date(s.starts_at).toLocaleDateString("en-AU", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        timeZone: "Australia/Sydney",
                      })}
                    </span>
                    <span className="text-gray-400">
                      {new Date(s.starts_at).toLocaleTimeString("en-AU", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Australia/Sydney",
                      })}
                      {" – "}
                      {new Date(s.ends_at).toLocaleTimeString("en-AU", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Australia/Sydney",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:sticky md:top-24 self-start">
            {soldOut ? (
              <div className="border border-white/10 rounded-lg p-6 text-center">
                <div className="font-heading text-lg mb-2">Sold out</div>
                <div className="text-sm text-gray-400">
                  Email <a href="mailto:obsidianvolleyball@gmail.com" className="text-[#9B4FDE]">obsidianvolleyball@gmail.com</a> to be put on a waiting list.
                </div>
              </div>
            ) : (
              <TermEnrolForm
                programId={program.id}
                programTitle={program.title}
                perWeekCents={perWeekCents}
                weeksRemaining={remainingSessions.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
