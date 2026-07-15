"use client";

// The interactive half of the enrol page. Split out from the (now ISR-cached,
// prefetchable) server page so the plan-specific view can read `?plan=` on the
// client via useSearchParams — the server page reads no search params, which is
// what lets it stay static and be prefetched from the class list.
import { useSearchParams } from "next/navigation";
import WaitlistForm from "@/components/WaitlistForm";
import { TermEnrolForm } from "./TermEnrolForm";

const TZ = "Australia/Sydney";
type SessionLite = { id: string; starts_at: string; ends_at: string };
type DisplaySession = SessionLite & { cancelled: boolean; note: string | null };

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: TZ });

export function EnrolPanels({
  programId,
  programTitle,
  perWeekCents,
  billableWeeks,
  casualPriceCents,
  trialPriceCents,
  sessions,
  displaySessions,
  soldOut,
}: {
  programId: string;
  programTitle: string;
  perWeekCents: number;
  billableWeeks: number;
  casualPriceCents: number;
  trialPriceCents: number;
  sessions: SessionLite[];
  displaySessions: DisplaySession[];
  soldOut: boolean;
}) {
  // Trial deep-links (/booking/term/<slug>?plan=trial) book the next upcoming
  // session only, so show just that one; the full-term flow shows every class.
  const defaultPlan: "term" | "trial" = useSearchParams().get("plan") === "trial" ? "trial" : "term";
  // Trial view shows only the next bookable (scheduled) class; the term view
  // lists every date, with cancelled ones struck-through so families see why a
  // week is missing. Count in the heading = actual classes running (scheduled).
  const rows = defaultPlan === "trial" ? displaySessions.filter((s) => !s.cancelled).slice(0, 1) : displaySessions;
  const runningCount = sessions.length;

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div>
        <h2 className="font-heading text-xl mb-3">
          {defaultPlan === "trial" ? "Your trial class" : `Classes this term (${runningCount})`}
        </h2>
        {displaySessions.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-6 text-gray-400 text-sm">
            No upcoming classes this term. The term may have ended.
          </div>
        ) : (
          <div className="border border-white/10 rounded-lg overflow-hidden">
            {rows.map((s) =>
              s.cancelled ? (
                <div
                  key={s.id}
                  className="px-4 py-3 border-b border-white/5 last:border-b-0 flex items-center justify-between text-sm bg-white/[0.015]"
                >
                  <span className="line-through text-gray-600">{fmtDay(s.starts_at)}</span>
                  <span className="text-amber-500/80 text-xs font-heading tracking-wide uppercase text-right">
                    No class{s.note ? ` · ${s.note}` : ""}
                  </span>
                </div>
              ) : (
                <div key={s.id} className="px-4 py-3 border-b border-white/5 last:border-b-0 flex items-center justify-between text-sm">
                  <span>{fmtDay(s.starts_at)}</span>
                  <span className="text-gray-400">
                    {fmtTime(s.starts_at)}
                    {" – "}
                    {fmtTime(s.ends_at)}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="md:sticky md:top-24 self-start">
        {soldOut ? (
          <div className="border border-white/10 rounded-lg p-6">
            <div className="font-heading text-lg mb-1">Sold out</div>
            <div className="text-sm text-gray-400 mb-4">
              Join the waitlist and we&apos;ll email you the moment a spot opens.
            </div>
            {sessions[0] && <WaitlistForm sessionId={sessions[0].id} showSoldOutLabel={false} />}
          </div>
        ) : (
          <TermEnrolForm
            programId={programId}
            programTitle={programTitle}
            perWeekCents={perWeekCents}
            weeksRemaining={billableWeeks}
            defaultPlan={defaultPlan}
            sessions={sessions}
            casualPriceCents={casualPriceCents}
            trialPriceCents={trialPriceCents}
          />
        )}
      </div>
    </div>
  );
}
