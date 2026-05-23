"use client";

import { useState } from "react";

type Session = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  capacity_override: number | null;
  booked: number;
};

export function SessionList({ sessions, defaultCapacity }: { sessions: Session[]; defaultCapacity: number }) {
  const [busy, setBusy] = useState<string | null>(null);

  if (sessions.length === 0) {
    return <div className="text-sm text-gray-500 border border-white/10 rounded p-4">No sessions yet. Use the generator above.</div>;
  }

  const cancel = async (id: string) => {
    if (!confirm("Cancel this session? Any current bookings will need to be refunded separately.")) return;
    setBusy(id);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const url = `/api/admin/sessions/${id}/cancel${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error ?? "Failed to cancel");
        return;
      }
      window.location.reload();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
          <tr className="border-b border-white/10">
            <th className="text-left px-4 py-2 font-normal">Date</th>
            <th className="text-left px-4 py-2 font-normal">Time</th>
            <th className="text-right px-4 py-2 font-normal">Capacity</th>
            <th className="text-left px-4 py-2 font-normal">Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const cap = s.capacity_override ?? defaultCapacity;
            const date = new Date(s.starts_at).toLocaleDateString("en-AU", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Australia/Sydney",
            });
            const start = new Date(s.starts_at).toLocaleTimeString("en-AU", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Australia/Sydney",
            });
            const end = new Date(s.ends_at).toLocaleTimeString("en-AU", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Australia/Sydney",
            });
            return (
              <tr key={s.id} className="border-b border-white/5">
                <td className="px-4 py-2">{date}</td>
                <td className="px-4 py-2 text-gray-400">{start}–{end}</td>
                <td className="px-4 py-2 text-right text-xs text-gray-400">{s.booked}/{cap}</td>
                <td className="px-4 py-2">
                  {s.status === "cancelled" ? (
                    <span className="text-xs text-red-400">cancelled</span>
                  ) : (
                    <span className="text-xs text-gray-400">scheduled</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {s.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => cancel(s.id)}
                      disabled={busy === s.id}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                    >
                      {busy === s.id ? "..." : "cancel"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
