"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash. Calling getSession() on
    // load lets the client exchange it for a session.
    const supa = supabaseBrowser();
    supa.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setError("Your recovery link expired or was already used. Request a new one from the sign-in page.");
      }
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supa = supabaseBrowser();
      const { error: e1 } = await supa.auth.updateUser({ password });
      if (e1) throw new Error(e1.message);
      window.location.href = "/booking/portal";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setSubmitting(false);
    }
  };

  if (!ready && !error) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-6 text-center text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 bg-white/[0.02] border border-white/10 rounded-lg p-6">
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">New password</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!ready}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
          autoFocus
        />
      </label>
      <label className="block">
        <span className="block text-xs text-gray-500 mb-1">Confirm password</span>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={!ready}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]"
        />
      </label>
      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}
      <button
        type="submit"
        disabled={submitting || !ready}
        className="w-full bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
      >
        {submitting ? "SETTING…" : "SET PASSWORD"}
      </button>
    </form>
  );
}
