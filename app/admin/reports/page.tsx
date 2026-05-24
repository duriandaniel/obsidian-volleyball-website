import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function monthRange(monthsAgo: number) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo + 1, 1));
  return { start: start.toISOString(), end: end.toISOString(), label: start.toLocaleDateString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }) };
}

type ProgramStat = {
  id: string;
  title: string;
  type: string;
  total_capacity: number;
  total_booked: number;
  attended: number;
  no_show: number;
};

async function loadReports() {
  const sb = supabaseAdmin();

  const months = [monthRange(0), monthRange(1), monthRange(2)];

  // Revenue per month — sum of paid camp_orders + enrolments
  const revenueByMonth: { label: string; total_cents: number; count: number }[] = [];
  for (const m of months) {
    const [{ data: camps }, { data: enrols }] = await Promise.all([
      sb.from("camp_orders").select("total_cents").eq("status", "paid").gte("paid_at", m.start).lt("paid_at", m.end),
      sb.from("enrolments").select("total_cents").eq("status", "active").gte("paid_at", m.start).lt("paid_at", m.end),
    ]);
    const total = (camps ?? []).reduce((s, r) => s + (r.total_cents ?? 0), 0) + (enrols ?? []).reduce((s, r) => s + (r.total_cents ?? 0), 0);
    const count = (camps?.length ?? 0) + (enrols?.length ?? 0);
    revenueByMonth.push({ label: m.label, total_cents: total, count });
  }

  // Per-program fill rate + attendance (only for programs with at least one session)
  const { data: programs } = await sb
    .from("programs")
    .select("id, title, type, default_capacity, status")
    .is("deleted_at", null)
    .in("status", ["published", "archived"]);

  const programStats: ProgramStat[] = [];
  for (const p of programs ?? []) {
    const { data: sessions } = await sb
      .from("sessions")
      .select("id, capacity_override")
      .eq("program_id", p.id)
      .is("deleted_at", null);
    if (!sessions || sessions.length === 0) continue;
    const totalCapacity = sessions.reduce((s, x) => s + (x.capacity_override ?? p.default_capacity), 0);
    const sessionIds = sessions.map((s) => s.id);
    const { data: bookings } = await sb
      .from("bookings")
      .select("status")
      .in("session_id", sessionIds)
      .is("deleted_at", null);
    const totalBooked = (bookings ?? []).filter((b) => ["confirmed", "attended", "no_show"].includes(b.status)).length;
    const attended = (bookings ?? []).filter((b) => b.status === "attended").length;
    const noShow = (bookings ?? []).filter((b) => b.status === "no_show").length;
    programStats.push({
      id: p.id,
      title: p.title,
      type: p.type,
      total_capacity: totalCapacity,
      total_booked: totalBooked,
      attended,
      no_show: noShow,
    });
  }
  programStats.sort((a, b) => b.total_booked - a.total_booked);

  // Overall counts
  const { count: customerCount } = await sb
    .from("customers")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);
  const { count: participantCount } = await sb
    .from("participants")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);

  return { revenueByMonth, programStats, customerCount: customerCount ?? 0, participantCount: participantCount ?? 0 };
}

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
}

export default async function ReportsPage() {
  const data = await loadReports();

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reports</div>
        <h1 className="font-heading text-3xl">At a glance</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {data.revenueByMonth.map((m, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-5 bg-white/[0.02]">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{m.label}{i === 0 ? " (so far)" : ""}</div>
            <div className="font-heading text-3xl text-[#9B4FDE]">{fmt(m.total_cents)}</div>
            <div className="text-xs text-gray-400 mt-1">{m.count} order{m.count === 1 ? "" : "s"}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-white/10 rounded-lg p-5 bg-white/[0.02]">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total customers</div>
          <div className="font-heading text-3xl">{data.customerCount}</div>
        </div>
        <div className="border border-white/10 rounded-lg p-5 bg-white/[0.02]">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total kids</div>
          <div className="font-heading text-3xl">{data.participantCount}</div>
        </div>
      </div>

      <h2 className="font-heading text-xl mb-3">Per program</h2>
      {data.programStats.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 text-center text-gray-400">No programs with sessions yet.</div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 font-normal">Program</th>
                <th className="text-left px-5 py-3 font-normal">Type</th>
                <th className="text-right px-5 py-3 font-normal">Capacity</th>
                <th className="text-right px-5 py-3 font-normal">Booked</th>
                <th className="text-right px-5 py-3 font-normal">Fill rate</th>
                <th className="text-right px-5 py-3 font-normal">No-show rate</th>
              </tr>
            </thead>
            <tbody>
              {data.programStats.map((p) => {
                const fill = p.total_capacity > 0 ? (p.total_booked / p.total_capacity) * 100 : 0;
                const completed = p.attended + p.no_show;
                const noShowRate = completed > 0 ? (p.no_show / completed) * 100 : null;
                return (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="px-5 py-3">{p.title}</td>
                    <td className="px-5 py-3 text-xs uppercase text-gray-400">{p.type}</td>
                    <td className="px-5 py-3 text-right text-gray-400">{p.total_capacity}</td>
                    <td className="px-5 py-3 text-right">{p.total_booked}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={fill >= 80 ? "text-[#9B4FDE]" : fill >= 50 ? "text-gray-300" : "text-gray-500"}>
                        {fill.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {noShowRate == null ? <span className="text-gray-600">—</span> : (
                        <span className={noShowRate >= 20 ? "text-red-400" : "text-gray-400"}>{noShowRate.toFixed(0)}%</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6">
        Revenue = paid camp orders + active term enrolments. Updated live on each page load.
      </p>
    </div>
  );
}
