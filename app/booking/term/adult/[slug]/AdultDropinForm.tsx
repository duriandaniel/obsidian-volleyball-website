"use client";

import { useState } from "react";
import { formatCents } from "@/lib/booking/pricing";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";

type Night = { id: string; starts_at: string; ends_at: string; spots_left: number };

const TZ = "Australia/Sydney";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: TZ });

export function AdultDropinForm({
  programId,
  perSessionCents,
  nights,
}: {
  programId: string;
  perSessionCents: number;
  nights: Night[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = selected.size;
  const total = perSessionCents * count;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0) {
      setError("Pick at least one night.");
      return;
    }
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
          program_id: programId,
          session_ids: Array.from(selected),
          player: details,
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
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        {nights.map((n) => {
          const sold = n.spots_left <= 0;
          const on = selected.has(n.id);
          return (
            <button
              type="button"
              key={n.id}
              onClick={() => !sold && toggle(n.id)}
              disabled={sold}
              className={`w-full flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                sold
                  ? "border-white/5 opacity-50 cursor-not-allowed"
                  : on
                  ? "border-[#9B4FDE] bg-[#9B4FDE]/10"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                    on ? "bg-[#9B4FDE] border-[#9B4FDE] text-white" : "border-white/30"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
                <span>
                  <span className="block text-sm">{fmtDate(n.starts_at)}</span>
                  <span className="block text-xs text-gray-500">
                    {fmtTime(n.starts_at)} – {fmtTime(n.ends_at)}
                  </span>
                </span>
              </span>
              <span className="text-sm text-gray-400">
                {sold ? "Sold out" : formatCents(perSessionCents)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" value={details.first_name} onChange={(v) => setDetails({ ...details, first_name: v })} required />
        <Input label="Last name" value={details.last_name} onChange={(v) => setDetails({ ...details, last_name: v })} required />
      </div>
      <Input label="Email" type="email" value={details.email} onChange={(v) => setDetails({ ...details, email: v })} required />
      <Input label="Mobile" type="tel" value={details.phone} onChange={(v) => setDetails({ ...details, phone: v })} required />

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <div className="text-xs text-gray-500">{count} night{count === 1 ? "" : "s"}</div>
          <div className="font-heading text-2xl text-[#9B4FDE]">{formatCents(total)}</div>
        </div>
        <button
          type="submit"
          disabled={submitting || count === 0}
          className="bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-40 text-white font-heading text-sm tracking-[0.2em] px-6 py-3 rounded"
        >
          {submitting ? "PREPARING…" : "PAY"}
        </button>
      </div>
      <div className="text-xs text-gray-500">Payment by Stripe on this page. Drop-in nights are non-refundable.</div>
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
