"use client";

import { useState } from "react";

type Mode = "signin" | "reset" | "reset-sent";

export function PortalLoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const qs = bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : "";

      if (mode === "signin") {
        const res = await fetch(`/api/booking/portal/login${qs}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Sign-in failed");
        window.location.href = "/booking/portal";
      } else if (mode === "reset") {
        const res = await fetch(`/api/booking/portal/reset${qs}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error ?? "Could not send reset email");
        }
        setMode("reset-sent");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "reset-sent") {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">📧</div>
        <h2 className="font-heading text-xl mb-2">Check your email</h2>
        <p className="text-sm text-gray-400">
          If an account exists for <span className="text-white">{email}</span>, we&apos;ve sent a link to set or reset your password.
        </p>
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
          className="text-xs text-[#9B4FDE] hover:text-white mt-4"
        >
          ← Back to sign in
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
        />
      </label>
      {mode === "signin" && (
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
          />
        </label>
      )}
      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
      >
        {submitting ? (mode === "signin" ? "SIGNING IN…" : "SENDING…") : mode === "signin" ? "SIGN IN" : "SEND RESET LINK"}
      </button>
      <div className="text-xs text-center text-gray-500">
        {mode === "signin" ? (
          <button type="button" onClick={() => { setMode("reset"); setError(null); }} className="text-[#9B4FDE] hover:text-white">
            Forgot or need to set a password?
          </button>
        ) : (
          <button type="button" onClick={() => { setMode("signin"); setError(null); }} className="text-[#9B4FDE] hover:text-white">
            Back to sign in
          </button>
        )}
      </div>
    </form>
  );
}
