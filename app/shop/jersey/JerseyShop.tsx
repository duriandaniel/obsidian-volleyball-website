"use client";

import { useState } from "react";
import { formatCents, CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";

export default function JerseyShop() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const total = CAMP_JERSEY_CENTS * qty;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bypass = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("x-vercel-protection-bypass") : null;
      const apiUrl = `/api/shop/jersey/checkout${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty, buyer: { name, email, phone: phone || null } }),
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
      <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02]">
        <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2] mb-3">PAYMENT</div>
        <EmbeddedPayment clientSecret={clientSecret} />
        <button type="button" onClick={() => setClientSecret(null)} className="text-xs text-gray-500 hover:text-white mt-3">
          ← Back to details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-white/10 rounded-lg p-6 bg-white/[0.02] space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">YOUR JERSEY</div>
        <div className="font-heading text-2xl text-white">{formatCents(total)}</div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-400 leading-relaxed">
        No need to pick a size now — try it on and choose your size when you collect it at a session.
      </div>

      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Quantity</span>
        <select
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10))}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n} className="bg-[#0A0A0A]">{n}</option>
          ))}
        </select>
      </label>

      <Input label="Name" value={name} onChange={setName} required />
      <Input label="Email" type="email" value={email} onChange={setEmail} required />
      <Input label="Mobile (optional)" type="tel" value={phone} onChange={setPhone} />

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#7E57C2] hover:bg-[#4A2780] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
      >
        {submitting ? "PREPARING…" : "CONTINUE TO PAYMENT"}
      </button>
      <div className="text-xs text-gray-500">Payment processed by Stripe on this page. We never see your card details.</div>
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
        {required && <span className="text-[#7E57C2]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]"
      />
    </label>
  );
}
