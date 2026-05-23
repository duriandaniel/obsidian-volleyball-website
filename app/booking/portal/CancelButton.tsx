"use client";

import { useState } from "react";

export function CancelButton({ bookingId, withinWindow }: { bookingId: string; withinWindow: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const qs = bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : "";
      const res = await fetch(`/api/booking/portal/bookings/${bookingId}/cancel${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Could not cancel");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded transition-colors"
      >
        Cancel booking
      </button>
    );
  }

  return (
    <div className="border border-white/20 rounded p-3 bg-black/50 min-w-[280px]">
      <div className="text-xs text-gray-400 mb-2">
        {withinWindow
          ? "You're within the cancellation window. Refund (if any) will be decided by admin."
          : "Outside the cancellation window. Likely no refund, but you can still cancel the seat."}
      </div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="Reason (optional but helps us)"
        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white mb-2"
      />
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} disabled={busy} className="text-xs text-gray-400 hover:text-white px-2 py-1">
          Keep booking
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="text-xs bg-red-500/80 hover:bg-red-500 disabled:opacity-50 text-white px-3 py-1.5 rounded"
        >
          {busy ? "..." : "Cancel booking"}
        </button>
      </div>
    </div>
  );
}
