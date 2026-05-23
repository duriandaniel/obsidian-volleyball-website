"use client";

import { useState } from "react";

export function RefundButton({ bookingId, maxCents }: { bookingId: string; maxCents: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((maxCents / 100).toFixed(2));
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"refund" | "decline" | null>(null);

  const submit = async () => {
    setSubmitting(true);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const url = `/api/admin/bookings/${bookingId}/refund${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const cents = Math.round(parseFloat(amount) * 100);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, amount_cents: mode === "refund" ? cents : null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs bg-[#9B4FDE] hover:bg-[#7d3fb8] text-white rounded font-heading tracking-wider"
      >
        DECIDE
      </button>
    );
  }

  return (
    <div className="border border-white/20 rounded p-3 bg-black/50 text-left min-w-[220px]">
      <div className="flex gap-2 mb-2 text-xs">
        <button
          type="button"
          onClick={() => setMode("refund")}
          className={`flex-1 px-2 py-1 rounded ${mode === "refund" ? "bg-[#9B4FDE] text-white" : "bg-white/5 text-gray-300"}`}
        >
          Refund
        </button>
        <button
          type="button"
          onClick={() => setMode("decline")}
          className={`flex-1 px-2 py-1 rounded ${mode === "decline" ? "bg-[#9B4FDE] text-white" : "bg-white/5 text-gray-300"}`}
        >
          No refund
        </button>
      </div>
      {mode === "refund" && (
        <div className="mb-2">
          <label className="text-xs text-gray-500 block mb-1">Amount (AUD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={(maxCents / 100).toFixed(2)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"
          />
          <div className="text-xs text-gray-500 mt-1">Max: ${(maxCents / 100).toFixed(2)}</div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="text-xs text-gray-400 hover:text-white px-2 py-1"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || mode == null}
          onClick={submit}
          className="flex-1 text-xs bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white py-1.5 rounded font-heading tracking-wider"
        >
          {submitting ? "WORKING…" : "CONFIRM"}
        </button>
      </div>
    </div>
  );
}
