"use client";

import { useState } from "react";

// Compact inline "join the waitlist" form shown where a sold-out session's
// book/add button would be. Collapsed to a single button until tapped.
//
// kidField: junior surfaces collect the kid's name; adult scrims don't.
// align: "right" keeps the collapsed button flush with the booking buttons it
// replaces (table cells / card rows).
export default function WaitlistForm({
  sessionId,
  kidField = true,
  align = "left",
  showSoldOutLabel = true, // pass false where the surface already says "Sold out"
}: {
  sessionId: string;
  kidField?: boolean;
  align?: "left" | "right";
  showSoldOutLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ customer_name: "", kid_name: "", email: "", phone: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          customer_name: form.customer_name,
          kid_name: kidField ? form.kid_name || null : null,
          email: form.email,
          phone: form.phone,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-left text-xs text-[#7E57C2] bg-[#7E57C2]/10 border border-[#7E57C2]/30 rounded p-3 leading-relaxed max-w-xs">
        <span className="font-semibold">You&apos;re on the list!</span> If a spot opens we&apos;ll email the
        waitlist — spots are first-come, first-served, so book quickly.
      </div>
    );
  }

  if (!open) {
    return (
      <div className={align === "right" ? "text-right" : ""}>
        {showSoldOutLabel && <div className="text-xs text-gray-500 mb-1.5">Sold out</div>}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded font-heading text-xs tracking-[0.2em] border border-[#7E57C2]/50 text-[#7E57C2] hover:bg-[#7E57C2] hover:text-white transition-colors whitespace-nowrap"
        >
          JOIN WAITLIST
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="text-left space-y-2 max-w-xs" onClick={(e) => e.stopPropagation()}>
      <div className="text-xs text-gray-400">
        Sold out — join the waitlist and we&apos;ll email you if a spot opens.
      </div>
      <input
        type="text"
        required
        placeholder="Parent name"
        value={form.customer_name}
        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7E57C2] transition-colors"
      />
      {kidField && (
        <input
          type="text"
          required
          placeholder="Kid's name"
          value={form.kid_name}
          onChange={(e) => setForm({ ...form, kid_name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7E57C2] transition-colors"
        />
      )}
      <input
        type="email"
        required
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7E57C2] transition-colors"
      />
      <input
        type="tel"
        required
        minLength={5}
        placeholder="Mobile"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7E57C2] transition-colors"
      />
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#7E57C2] hover:bg-[#4A2780] disabled:opacity-50 text-white font-heading text-xs tracking-[0.2em] py-2 rounded transition-colors"
        >
          {submitting ? "JOINING…" : "JOIN WAITLIST"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-heading text-xs tracking-[0.2em] rounded transition-colors"
        >
          ✕
        </button>
      </div>
    </form>
  );
}
