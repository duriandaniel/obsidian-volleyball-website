"use client";

import { useState } from "react";

type Venue = { id: string; name: string };
type PricingRule = { id: string; name: string; scope: string };

export type ProgramFormInitial = {
  id?: string;
  type: "term" | "camp";
  title: string;
  slug?: string;
  season: string;
  description: string;
  venue_id: string;
  default_capacity: number;
  skill_level: "beginner" | "intermediate" | "advanced" | "mixed" | "";
  age_min: number | null;
  age_max: number | null;
  status: "draft" | "published" | "archived";
  pricing_rule_id: string;
  trial_eligible: boolean;
  refund_policy: "forfeit" | "credit" | "cash";
  cancel_window_hours: number;
};

const empty: ProgramFormInitial = {
  type: "camp",
  title: "",
  season: "",
  description: "",
  venue_id: "",
  default_capacity: 24,
  skill_level: "mixed",
  age_min: 8,
  age_max: 18,
  status: "draft",
  pricing_rule_id: "",
  trial_eligible: true,
  refund_policy: "credit",
  cancel_window_hours: 24,
};

export function ProgramForm({
  venues,
  pricingRules,
  initial,
}: {
  venues: Venue[];
  pricingRules: PricingRule[];
  initial?: ProgramFormInitial;
}) {
  const [v, setV] = useState<ProgramFormInitial>(initial ?? { ...empty, venue_id: venues[0]?.id ?? "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const u = <K extends keyof ProgramFormInitial>(key: K, val: ProgramFormInitial[K]) => setV({ ...v, [key]: val });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const url = v.id
        ? `/api/admin/programs/${v.id}${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`
        : `/api/admin/programs${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(url, {
        method: v.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      window.location.href = `/admin/programs/${json.id ?? v.id}${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSubmitting(false);
    }
  };

  const Field = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">
        {label}{required && <span className="text-[#9B4FDE]">*</span>}
      </span>
      {children}
    </label>
  );

  const inputCls = "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]";

  return (
    <form onSubmit={submit} className="space-y-6 bg-white/[0.02] border border-white/10 rounded-lg p-6">
      <Fieldset legend="Basics">
        <Row>
          <Field label="Type" required>
            <select value={v.type} onChange={(e) => u("type", e.target.value as ProgramFormInitial["type"])} className={inputCls}>
              <option value="camp">Holiday camp</option>
              <option value="term">Term program</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={v.status} onChange={(e) => u("status", e.target.value as ProgramFormInitial["status"])} className={inputCls}>
              <option value="draft">Draft (not visible)</option>
              <option value="published">Published (live to parents)</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </Row>

        <Field label="Title" required>
          <input value={v.title} onChange={(e) => u("title", e.target.value)} required className={inputCls} placeholder="April 2026 Holiday Camp" />
        </Field>

        <Field label="Season">
          <input value={v.season} onChange={(e) => u("season", e.target.value)} className={inputCls} placeholder="Optional. e.g. 'Term 3 2026' or 'April Holidays'" />
        </Field>

        <Field label="Description">
          <textarea value={v.description} onChange={(e) => u("description", e.target.value)} rows={3} className={inputCls} placeholder="Optional. Shown on the booking page." />
        </Field>
      </Fieldset>

      <Fieldset legend="Venue + audience">
        <Row>
          <Field label="Venue" required>
            <select value={v.venue_id} onChange={(e) => u("venue_id", e.target.value)} required className={inputCls}>
              <option value="">Select…</option>
              {venues.map((vn) => <option key={vn.id} value={vn.id}>{vn.name}</option>)}
            </select>
          </Field>
          <Field label="Default capacity" required>
            <input type="number" min="1" value={v.default_capacity} onChange={(e) => u("default_capacity", Number(e.target.value))} required className={inputCls} />
          </Field>
        </Row>
        <Row>
          <Field label="Skill level">
            <select value={v.skill_level} onChange={(e) => u("skill_level", e.target.value as ProgramFormInitial["skill_level"])} className={inputCls}>
              <option value="mixed">Mixed</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min age">
              <input type="number" min="3" max="100" value={v.age_min ?? ""} onChange={(e) => u("age_min", e.target.value ? Number(e.target.value) : null)} className={inputCls} />
            </Field>
            <Field label="Max age">
              <input type="number" min="3" max="100" value={v.age_max ?? ""} onChange={(e) => u("age_max", e.target.value ? Number(e.target.value) : null)} className={inputCls} />
            </Field>
          </div>
        </Row>
      </Fieldset>

      <Fieldset legend="Pricing + policies">
        <Field label="Pricing rule">
          <select value={v.pricing_rule_id} onChange={(e) => u("pricing_rule_id", e.target.value)} className={inputCls}>
            <option value="">No rule (free / manual)</option>
            {pricingRules.filter((r) => r.scope === v.type).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <Row>
          <Field label="Refund policy">
            <select value={v.refund_policy} onChange={(e) => u("refund_policy", e.target.value as ProgramFormInitial["refund_policy"])} className={inputCls}>
              <option value="forfeit">Forfeit (no refund / credit on cancel)</option>
              <option value="credit">Credit (account credit for future session)</option>
              <option value="cash">Cash (full refund within window)</option>
            </select>
          </Field>
          <Field label="Cancel window (hours before)">
            <input type="number" min="0" value={v.cancel_window_hours} onChange={(e) => u("cancel_window_hours", Number(e.target.value))} className={inputCls} />
          </Field>
        </Row>
        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input type="checkbox" checked={v.trial_eligible} onChange={(e) => u("trial_eligible", e.target.checked)} className="w-4 h-4 accent-[#9B4FDE]" />
          <span className="text-sm text-gray-300">Allow free trial sign-ups for this program</span>
        </label>
      </Fieldset>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] px-6 py-3 rounded"
        >
          {submitting ? "SAVING…" : v.id ? "SAVE CHANGES" : "CREATE PROGRAM"}
        </button>
      </div>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 pb-4 border-b border-white/5 last:border-0">
      <legend className="text-xs text-[#9B4FDE] uppercase tracking-wider mb-2">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}
