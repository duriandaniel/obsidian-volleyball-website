"use client";

import { useState } from "react";

const YEAR_OPTIONS = [
  { value: "", label: "—" },
  ...Array.from({ length: 11 }, (_, i) => ({ value: `Year ${i + 2}`, label: `Year ${i + 2}` })),
];

type Form = {
  parent_email: string;
  parent_first_name: string;
  parent_last_name: string;
  parent_phone: string;
  kid_first_name: string;
  kid_last_name: string;
  kid_year_at_school: string;
  kid_volleyball_level: "" | "beginner" | "intermediate" | "advanced";
  kid_school_name: string;
  kid_medical_notes: string;
  payment_mode: "paid_offline" | "comp" | "owed";
  amount_cents: string;
  notes: string;
};

const empty: Form = {
  parent_email: "",
  parent_first_name: "",
  parent_last_name: "",
  parent_phone: "",
  kid_first_name: "",
  kid_last_name: "",
  kid_year_at_school: "",
  kid_volleyball_level: "",
  kid_school_name: "",
  kid_medical_notes: "",
  payment_mode: "paid_offline",
  amount_cents: "",
  notes: "",
};

export function AddBookingButton({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const qs = bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : "";
      const res = await fetch(`/api/admin/sessions/${sessionId}/manual-booking${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_email: v.parent_email,
          parent_first_name: v.parent_first_name,
          parent_last_name: v.parent_last_name,
          parent_phone: v.parent_phone || null,
          kid_first_name: v.kid_first_name,
          kid_last_name: v.kid_last_name,
          kid_year_at_school: v.kid_year_at_school || null,
          kid_volleyball_level: v.kid_volleyball_level || null,
          kid_school_name: v.kid_school_name || null,
          kid_medical_notes: v.kid_medical_notes || null,
          payment_mode: v.payment_mode,
          amount_cents: v.amount_cents ? Math.round(parseFloat(v.amount_cents) * 100) : null,
          notes: v.notes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setSuccess(true);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-[#9B4FDE]/20 text-gray-300 hover:text-[#9B4FDE] rounded transition-colors"
      >
        + Add booking
      </button>
    );
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#9B4FDE]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => !busy && setOpen(false)}>
      <div className="bg-[#0A0A0A] border border-white/20 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <div className="font-heading text-sm tracking-[0.2em] text-[#9B4FDE]">ADD WALK-IN / MANUAL BOOKING</div>
          <button type="button" onClick={() => !busy && setOpen(false)} className="text-gray-400 hover:text-white text-sm">close</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {success ? (
            <div className="text-green-400 bg-green-500/10 border border-green-500/30 rounded p-3 text-sm">Booking created. Reloading…</div>
          ) : (
            <>
              <Section title="Parent">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="First name" value={v.parent_first_name} onChange={(x) => setV({ ...v, parent_first_name: x })} required cls={inputCls} />
                  <Field label="Last name" value={v.parent_last_name} onChange={(x) => setV({ ...v, parent_last_name: x })} required cls={inputCls} />
                </div>
                <Field label="Email" type="email" value={v.parent_email} onChange={(x) => setV({ ...v, parent_email: x })} required cls={inputCls} />
                <Field label="Phone" type="tel" value={v.parent_phone} onChange={(x) => setV({ ...v, parent_phone: x })} cls={inputCls} />
              </Section>

              <Section title="Child">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="First name" value={v.kid_first_name} onChange={(x) => setV({ ...v, kid_first_name: x })} required cls={inputCls} />
                  <Field label="Last name" value={v.kid_last_name} onChange={(x) => setV({ ...v, kid_last_name: x })} required cls={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-xs text-gray-500 mb-0.5">Year</span>
                    <select value={v.kid_year_at_school} onChange={(e) => setV({ ...v, kid_year_at_school: e.target.value })} className={inputCls}>
                      {YEAR_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-[#0A0A0A]">{o.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-gray-500 mb-0.5">Level</span>
                    <select value={v.kid_volleyball_level} onChange={(e) => setV({ ...v, kid_volleyball_level: e.target.value as Form["kid_volleyball_level"] })} className={inputCls}>
                      <option value="" className="bg-[#0A0A0A]">—</option>
                      <option value="beginner" className="bg-[#0A0A0A]">Beginner</option>
                      <option value="intermediate" className="bg-[#0A0A0A]">Intermediate</option>
                      <option value="advanced" className="bg-[#0A0A0A]">Advanced</option>
                    </select>
                  </label>
                </div>
                <Field label="School" value={v.kid_school_name} onChange={(x) => setV({ ...v, kid_school_name: x })} cls={inputCls} />
                <label className="block">
                  <span className="block text-xs text-gray-500 mb-0.5">Medical notes</span>
                  <textarea value={v.kid_medical_notes} onChange={(e) => setV({ ...v, kid_medical_notes: e.target.value })} rows={2} className={inputCls} />
                </label>
              </Section>

              <Section title="Payment">
                <label className="block">
                  <span className="block text-xs text-gray-500 mb-0.5">Mode</span>
                  <select value={v.payment_mode} onChange={(e) => setV({ ...v, payment_mode: e.target.value as Form["payment_mode"] })} className={inputCls}>
                    <option value="paid_offline" className="bg-[#0A0A0A]">Paid offline (cash / bank transfer)</option>
                    <option value="comp" className="bg-[#0A0A0A]">Comp (free)</option>
                    <option value="owed" className="bg-[#0A0A0A]">Owed (will collect later)</option>
                  </select>
                </label>
                {v.payment_mode !== "comp" && (
                  <Field label="Amount (AUD)" type="number" value={v.amount_cents} onChange={(x) => setV({ ...v, amount_cents: x })} placeholder="50.00" cls={inputCls} />
                )}
                <label className="block">
                  <span className="block text-xs text-gray-500 mb-0.5">Notes (optional)</span>
                  <input type="text" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder="e.g. paid cash on the day, family friend, etc." className={inputCls} />
                </label>
              </Section>

              {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded"
              >
                {busy ? "ADDING…" : "ADD BOOKING"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs text-[#9B4FDE] uppercase tracking-wider mb-1">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  cls,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  cls: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-0.5">{label}{required && <span className="text-[#9B4FDE]">*</span>}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className={cls} />
    </label>
  );
}
