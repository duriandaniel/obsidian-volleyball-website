"use client";

import { useState } from "react";

export function PortalLoginForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const qs = bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : "";
      const res = await fetch(`/api/booking/portal/request${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Could not send link");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send link");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">📧</div>
        <h2 className="font-heading text-xl mb-2">Check your inbox</h2>
        <p className="text-sm text-gray-400">
          If we have a booking under <span className="text-white">{email}</span>, a sign-in link is on its way.
        </p>
        <p className="text-xs text-gray-500 mt-4">
          The link works for 30 days, so you can come back to that email any time.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setEmail("");
            setError(null);
          }}
          className="text-xs text-[#9B4FDE] hover:text-white mt-6"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 bg-white/[0.02] border border-white/10 rounded-lg p-6">
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
          autoFocus
          placeholder="The email you used when booking"
        />
      </label>
      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
      >
        {submitting ? "SENDING…" : "EMAIL ME A LINK"}
      </button>
      <div className="text-xs text-gray-500 text-center">
        We&apos;ll send a one-tap sign-in link. No password to remember.
      </div>
    </form>
  );
}
