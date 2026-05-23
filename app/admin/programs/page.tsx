import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProgramRow = {
  id: string;
  type: string;
  title: string;
  season: string | null;
  status: string;
  venue_name: string;
  session_count: number;
  upcoming_count: number;
};

async function loadPrograms(): Promise<ProgramRow[]> {
  const sb = supabaseAdmin();
  const { data: programs } = await sb
    .from("programs")
    .select("id, type, title, season, status, venue_id")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (!programs || programs.length === 0) return [];

  const venueIds = Array.from(new Set(programs.map((p) => p.venue_id)));
  const { data: venues } = await sb.from("venues").select("id, name").in("id", venueIds);
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));

  const programIds = programs.map((p) => p.id);
  const now = new Date().toISOString();
  const { data: sessions } = await sb
    .from("sessions")
    .select("program_id, starts_at")
    .in("program_id", programIds)
    .is("deleted_at", null);
  const totalByProgram = new Map<string, number>();
  const upcomingByProgram = new Map<string, number>();
  for (const s of sessions ?? []) {
    totalByProgram.set(s.program_id, (totalByProgram.get(s.program_id) ?? 0) + 1);
    if (s.starts_at >= now) {
      upcomingByProgram.set(s.program_id, (upcomingByProgram.get(s.program_id) ?? 0) + 1);
    }
  }

  return programs.map((p) => ({
    id: p.id,
    type: p.type,
    title: p.title,
    season: p.season,
    status: p.status,
    venue_name: venueById.get(p.venue_id) ?? "",
    session_count: totalByProgram.get(p.id) ?? 0,
    upcoming_count: upcomingByProgram.get(p.id) ?? 0,
  }));
}

export default async function ProgramsPage() {
  const admin = await currentAdmin();
  if (!admin || admin.role !== "owner") redirect("/admin");

  const programs = await loadPrograms();
  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Programs</div>
          <h1 className="font-heading text-3xl">{programs.length} programs</h1>
        </div>
        <Link
          href="/admin/programs/new"
          className="bg-[#9B4FDE] hover:bg-[#7d3fb8] text-white font-heading text-xs tracking-[0.2em] px-4 py-2 rounded"
        >
          + NEW PROGRAM
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
          No programs yet. Click <Link href="/admin/programs/new" className="text-[#9B4FDE]">+ NEW PROGRAM</Link> to create one.
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 font-normal">Title</th>
                <th className="text-left px-5 py-3 font-normal">Type</th>
                <th className="text-left px-5 py-3 font-normal">Season</th>
                <th className="text-left px-5 py-3 font-normal">Venue</th>
                <th className="text-right px-5 py-3 font-normal">Sessions</th>
                <th className="text-left px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/programs/${p.id}`} className="hover:text-[#9B4FDE]">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-xs uppercase text-gray-400">{p.type}</td>
                  <td className="px-5 py-3 text-gray-300">{p.season ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-300">{p.venue_name}</td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400">
                    {p.upcoming_count} upcoming / {p.session_count} total
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-white/10 text-gray-400",
    published: "bg-green-500/15 text-green-400",
    archived: "bg-white/5 text-gray-600",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${styles[status] ?? "bg-white/10"}`}>
      {status}
    </span>
  );
}
