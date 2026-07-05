"use client";

import { useState } from "react";
import { formatCents, CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";

// Deliberately minimal: parents at camp are pointed here to pay on the spot.
// One jersey, $36, child name + email — the email keys the customer record,
// so use the same one as the camp booking to keep the family linked.
export default function JerseyShop() {
  const [childName, setChildName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

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
        body: JSON.stringify({ email, child_name: childName }),
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
          ← Back
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-white/10 rounded-lg p-6 bg-white/[0.02] space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">OBSIDIAN JERSEY</div>
        <div className="font-heading text-2xl text-white">{formatCents(CAMP_JERSEY_CENTS)}</div>
      </div>

      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">
          Child Full Name<span className="text-[#7E57C2]">*</span>
        </span>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
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

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#7E57C2] hover:bg-[#4A2780] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
      >
        {submitting ? "PREPARING…" : `PAY ${formatCents(CAMP_JERSEY_CENTS)}`}
      </button>
      <div className="text-xs text-gray-500">Secure card payment by Stripe.</div>
    </form>
  );
}
