"use client";

import { useState } from "react";
import { formatCents } from "@/lib/booking/pricing";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";

type AdultSession = {
  id: string;
  starts_at: string;
  ends_at: string;
  venue_name: string;
  spots_left: number;
  price_cents: number;
};

type Level = "" | "beginner" | "social_player" | "svl_player";
type Source = "" | "google" | "instagram" | "facebook" | "word_of_mouth";

const TZ = "Australia/Sydney";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: TZ });

const LEVELS: { value: Level; label: string }[] = [
  { value: "", label: "Select…" },
  { value: "beginner", label: "Beginner" },
  { value: "social_player", label: "Social Player" },
  { value: "svl_player", label: "SVL Player" },
];

const SOURCES: { value: Source; label: string }[] = [
  { value: "", label: "Select…" },
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "word_of_mouth", label: "Word of mouth" },
];

export function AdultSessionsForm({ sessions }: { sessions: AdultSession[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<Level>("");
  const [source, setSource] = useState<Source>("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const count = selected.size;
  const total = sessions.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.price_cents, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0) return setError("Pick at least one night.");
    if (!level) return setError("Please select your level.");
    if (!consent) return setError("Please tick the photo/marketing consent box.");
    setSubmitting(true);
    setError(null);
    try {
      const bypass =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("x-vercel-protection-bypass") : null;
      const apiUrl = `/api/booking/dropin/checkout${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_ids: Array.from(selected),
          player: { name, email, phone, level, source, marketing_consent: consent },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.client_secret) throw new Error(json.error ?? "Checkout failed");
      setClientSecret(json.client_secret);
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (clientSecret) {
    return (
      <div className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
        <div className="font-heading text-xs tracking-[0.3em] text-[#9B4FDE] mb-3">PAYMENT</div>
        <EmbeddedPayment clientSecret={clientSecret} />
        <button type="button" onClick={() => setClientSecret(null)} className="text-xs text-gray-500 hover:text-white mt-3">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      {/* Tick-list of nights */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        {sessions.map((s) => {
          const sold = s.spots_left <= 0;
          const on = selected.has(s.id);
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => !sold && toggle(s.id)}
              disabled={sold}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-white/5 last:border-b-0 transition-colors ${
                sold ? "opacity-40 cursor-not-allowed" : on ? "bg-[#9B4FDE]/10" : "hover:bg-white/[0.03]"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                  on ? "bg-[#9B4FDE] border-[#9B4FDE] text-white" : "border-white/30"
                }`}
              >
                {on ? "✓" : ""}
              </span>
              <span className="flex-1 text-sm">
                <span className="text-white">{fmtDate(s.starts_at)}</span>
                <span className="text-gray-400">
                  {" "}· {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)} · {s.venue_name}
                </span>
              </span>
              <span className="text-sm text-gray-400 shrink-0">{sold ? "Sold out" : formatCents(s.price_cents)}</span>
            </button>
          );
        })}
      </div>

      {/* Details */}
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={setName} required />
        <Input label="Email" type="email" value={email} onChange={setEmail} required />
        <Input label="Mobile" type="tel" value={phone} onChange={setPhone} required />
        <Select label="Your level" value={level} onChange={(v) => setLevel(v as Level)} options={LEVELS} required />
        <Select label="How did you hear about us?" value={source} onChange={(v) => setSource(v as Source)} options={SOURCES} />
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#9B4FDE]" required />
          <span className="text-xs text-gray-400">
            I consent to Obsidian Volleyball Academy capturing and using photos and video from sessions for marketing and social media. <span className="text-[#9B4FDE]">*</span>
          </span>
        </label>
      </div>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <div className="text-xs text-gray-500">{count} night{count === 1 ? "" : "s"}</div>
          <div className="font-heading text-2xl text-[#9B4FDE]">{formatCents(total)}</div>
        </div>
        <button
          type="submit"
          disabled={submitting || count === 0}
          className="bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-40 text-white font-heading text-sm tracking-[0.2em] px-7 py-3 rounded"
        >
          {submitting ? "PREPARING…" : "PAY"}
        </button>
      </div>
      <div className="text-xs text-gray-500">Payment by Stripe on this page. Have a coupon? Enter it at the payment step. Drop-in nights are non-refundable.</div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">
        {label}
        {required && <span className="text-[#9B4FDE]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">
        {label}
        {required && <span className="text-[#9B4FDE]">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0A0A0A]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
