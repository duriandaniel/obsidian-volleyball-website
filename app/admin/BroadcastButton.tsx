"use client";

import { useState } from "react";

export function BroadcastButton({ sessionId, rosterCount }: { sessionId: string; rosterCount: number }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const qs = bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : "";
      const res = await fetch(`/api/admin/sessions/${sessionId}/broadcast${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setResult(json);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={rosterCount === 0}
        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-[#9B4FDE]/20 text-gray-300 hover:text-[#9B4FDE] rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title={rosterCount === 0 ? "No parents to email yet" : `Email ${rosterCount} parent${rosterCount === 1 ? "" : "s"}`}
      >
        📧 Email roster
      </button>
    );
  }

  return (
    <div className="border border-white/20 rounded-lg p-4 bg-black/60 min-w-[320px] max-w-md">
      <div className="flex items-center justify-between mb-3">
        <span className="font-heading text-xs tracking-[0.2em] text-[#9B4FDE]">
          EMAIL {rosterCount} PARENT{rosterCount === 1 ? "" : "S"}
        </span>
        <button type="button" onClick={() => { setOpen(false); setResult(null); setError(null); }} className="text-xs text-gray-400 hover:text-white">close</button>
      </div>

      {result ? (
        <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded p-3 mb-2">
          Sent to {result.sent} parent{result.sent === 1 ? "" : "s"}.
          {result.failed > 0 && <span className="text-yellow-400"> {result.failed} failed.</span>}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            required
            maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message to the parents…"
            required
            rows={5}
            maxLength={10000}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
          <div className="text-xs text-gray-500">
            Sent from obsidianvolleyball@gmail.com to each parent individually. They&apos;ll see only their own name.
          </div>
          <button
            type="submit"
            disabled={busy || !subject || !message}
            className="w-full bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-xs tracking-[0.2em] py-2.5 rounded"
          >
            {busy ? "SENDING…" : "SEND TO ROSTER"}
          </button>
        </form>
      )}
    </div>
  );
}
