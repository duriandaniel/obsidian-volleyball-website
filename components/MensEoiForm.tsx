"use client";

import { useState } from "react";

// Men's Development Squad expression of interest form. No payment, no booking.
// Posts to /api/mens-squad/eoi; one active row per email.

const POSITIONS: { value: string; label: string }[] = [
  { value: "", label: "Select (optional)" },
  { value: "setter", label: "Setter" },
  { value: "outside", label: "Outside Hitter" },
  { value: "middle", label: "Middle Blocker" },
  { value: "opposite", label: "Opposite" },
  { value: "libero", label: "Libero" },
  { value: "flex", label: "Flexible / Any" },
];

export default function MensEoiForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/mens-squad/eoi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          preferred_position: position || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="border border-[#7E57C2]/40 bg-[#7E57C2]/[0.06] rounded-lg p-6">
        <div className="font-heading text-lg text-white mb-2">You&apos;re on the list.</div>
        <p className="text-sm text-gray-300">
          Thanks for registering your interest. We&apos;ll email you when trials open. In the meantime, Friday scrims
          run every week:{" "}
          <a href="/booking/adult/scrim" className="text-[#7E57C2] underline hover:text-white">
            book a scrim
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-white/10 rounded-lg p-6 bg-white/[0.02] space-y-4">
      <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">REGISTER YOUR INTEREST</div>
      <p className="text-sm text-gray-400">
        No payment and no commitment. We&apos;ll email you when the next batch opens.
      </p>
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">
          Name<span className="text-[#7E57C2]">*</span>
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]"
        />
      </label>
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">
          Email<span className="text-[#7E57C2]">*</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]"
        />
      </label>
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Mobile</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]"
        />
      </label>
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Position you play</span>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]"
        >
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value} className="bg-[#0A0A0A]">
              {p.label}
            </option>
          ))}
        </select>
      </label>
      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#5E35A8] hover:bg-[#7E57C2] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
      >
        {submitting ? "SAVING…" : "REGISTER INTEREST"}
      </button>
    </form>
  );
}
