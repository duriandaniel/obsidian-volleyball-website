"use client";

import { useState } from "react";

export function AttendanceToggle({
  bookingId,
  status: initialStatus,
}: {
  bookingId: string;
  status: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);

  const update = async (newStatus: "confirmed" | "attended" | "no_show") => {
    setBusy(true);
    const before = status;
    setStatus(newStatus);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const url = `/api/admin/bookings/${bookingId}/attendance${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setStatus(before);
        const json = await res.json().catch(() => ({}));
        alert(json.error ?? "Failed to update");
      }
    } catch {
      setStatus(before);
      alert("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex border border-white/10 rounded overflow-hidden text-xs">
      <button
        type="button"
        disabled={busy}
        onClick={() => update("attended")}
        className={`px-2 py-1 ${status === "attended" ? "bg-green-500/30 text-green-300" : "hover:bg-white/5 text-gray-400"}`}
      >
        ✓
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => update("confirmed")}
        className={`px-2 py-1 border-l border-white/10 ${status === "confirmed" ? "bg-white/15 text-white" : "hover:bg-white/5 text-gray-500"}`}
      >
        —
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => update("no_show")}
        className={`px-2 py-1 border-l border-white/10 ${status === "no_show" ? "bg-red-500/30 text-red-300" : "hover:bg-white/5 text-gray-400"}`}
      >
        ✗
      </button>
    </div>
  );
}
