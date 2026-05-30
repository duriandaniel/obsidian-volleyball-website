"use client";

import { useState } from "react";
import { formatCents, TRIAL_PRICE_CENTS } from "@/lib/booking/pricing";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";

type ParentForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: "" | "google" | "instagram" | "facebook" | "word_of_mouth";
};

type KidForm = {
  first_name: string;
  last_name: string;
  year_at_school: string;
  volleyball_level: "" | "beginner" | "intermediate" | "advanced";
  school_name: string;
  medical_notes: string;
  photo_consent: boolean;
};

const SOURCE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "word_of_mouth", label: "Word of mouth" },
];

const YEAR_OPTIONS = [
  { value: "", label: "Select…" },
  ...Array.from({ length: 11 }, (_, i) => {
    const n = i + 2;
    return { value: `Year ${n}`, label: `Year ${n}` };
  }),
];

export function TermEnrolForm({
  programId,
  programTitle,
  perWeekCents,
  weeksRemaining,
  defaultPlan = "term",
}: {
  programId: string;
  programTitle: string;
  perWeekCents: number;
  weeksRemaining: number;
  defaultPlan?: "term" | "trial";
}) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<"term" | "trial">(defaultPlan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [parent, setParent] = useState<ParentForm>({ first_name: "", last_name: "", email: "", phone: "", source: "" });
  const [kid, setKid] = useState<KidForm>({
    first_name: "",
    last_name: "",
    year_at_school: "",
    volleyball_level: "",
    school_name: "",
    medical_notes: "",
    photo_consent: false,
  });

  const total = perWeekCents * weeksRemaining;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const bypass = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("x-vercel-protection-bypass") : null;
      const endpoint = plan === "trial" ? "/api/booking/trial/checkout" : "/api/booking/term/checkout";
      const apiUrl = `${endpoint}${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_id: programId,
          parent,
          kid: {
            ...kid,
            volleyball_level: kid.volleyball_level || null,
            year_at_school: kid.year_at_school || null,
            school_name: kid.school_name || null,
            medical_notes: kid.medical_notes || null,
          },
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

  return (
    <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02] space-y-4">
      {!clientSecret && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPlan("term")}
            className={`rounded px-3 py-2 text-xs font-heading tracking-[0.15em] border transition-colors ${
              plan === "term" ? "border-[#7E57C2] bg-[#7E57C2]/10 text-white" : "border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            FULL TERM
          </button>
          <button
            type="button"
            onClick={() => setPlan("trial")}
            className={`rounded px-3 py-2 text-xs font-heading tracking-[0.15em] border transition-colors ${
              plan === "trial" ? "border-[#7E57C2] bg-[#7E57C2]/10 text-white" : "border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            TRIAL CLASS
          </button>
        </div>
      )}

      <div>
        {plan === "term" ? (
          <>
            <div className="text-xs text-gray-500 mb-1">Pro-rata for {weeksRemaining} week{weeksRemaining === 1 ? "" : "s"}</div>
            <div className="font-heading text-3xl text-[#7E57C2]">{formatCents(total)}</div>
            <div className="text-xs text-gray-500">{formatCents(perWeekCents)}/week. Whole-term commitment.</div>
          </>
        ) : (
          <>
            <div className="text-xs text-gray-500 mb-1">Trial class</div>
            <div className="font-heading text-3xl text-[#7E57C2]">{formatCents(TRIAL_PRICE_CENTS)}</div>
            <div className="text-xs text-gray-500">Try a single junior class. Limit one trial per player.</div>
          </>
        )}
      </div>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full bg-[#7E57C2] hover:bg-[#4A2780] text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
          disabled={weeksRemaining === 0}
        >
          {weeksRemaining === 0 ? "TERM HAS ENDED" : plan === "trial" ? "BOOK A TRIAL" : "ENROL NOW"}
        </button>
      )}

      {open && clientSecret && (
        <div className="pt-2 border-t border-white/10">
          <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2] mb-3">PAYMENT</div>
          <EmbeddedPayment clientSecret={clientSecret} />
          <button
            type="button"
            onClick={() => setClientSecret(null)}
            className="text-xs text-gray-500 hover:text-white mt-3"
          >
            ← Back to details
          </button>
        </div>
      )}

      {open && !clientSecret && (
        <form onSubmit={submit} className="space-y-4 pt-2 border-t border-white/5">
          <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">YOUR DETAILS</div>

          <Fieldset legend="Parent / guardian">
            <Row>
              <Field label="First name" value={parent.first_name} onChange={(v) => setParent({ ...parent, first_name: v })} required />
              <Field label="Last name" value={parent.last_name} onChange={(v) => setParent({ ...parent, last_name: v })} required />
            </Row>
            <Field label="Email" type="email" value={parent.email} onChange={(v) => setParent({ ...parent, email: v })} required />
            <Field label="Mobile" type="tel" value={parent.phone} onChange={(v) => setParent({ ...parent, phone: v })} required />
            <Select label="How did you hear about us?" value={parent.source} onChange={(v) => setParent({ ...parent, source: v as ParentForm["source"] })} options={SOURCE_OPTIONS} />
          </Fieldset>

          <Fieldset legend="Child attending">
            <Row>
              <Field label="First name" value={kid.first_name} onChange={(v) => setKid({ ...kid, first_name: v })} required />
              <Field label="Last name" value={kid.last_name} onChange={(v) => setKid({ ...kid, last_name: v })} required />
            </Row>
            <Row>
              <Select label="Year at school" value={kid.year_at_school} onChange={(v) => setKid({ ...kid, year_at_school: v })} options={YEAR_OPTIONS} />
              <Select label="Volleyball level" value={kid.volleyball_level} onChange={(v) => setKid({ ...kid, volleyball_level: v as KidForm["volleyball_level"] })} options={[
                { value: "", label: "Select…" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]} />
            </Row>
            <Field label="School name" value={kid.school_name} onChange={(v) => setKid({ ...kid, school_name: v })} />
            <TextArea label="Medical notes / allergies" value={kid.medical_notes} onChange={(v) => setKid({ ...kid, medical_notes: v })} placeholder="Optional. Anything coaches should know." />
            <Checkbox checked={kid.photo_consent} onChange={(v) => setKid({ ...kid, photo_consent: v })} label="I consent to photos/videos of my child being used on Obsidian Volleyball Academy social media and website." />
          </Fieldset>

          {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} disabled={submitting} className="px-3 py-3 bg-white/5 hover:bg-white/10 text-white font-heading text-xs tracking-[0.2em] rounded">
              BACK
            </button>
            <button type="submit" disabled={submitting} className="flex-1 bg-[#7E57C2] hover:bg-[#4A2780] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded">
              {submitting ? "PREPARING…" : "CONTINUE TO PAYMENT"}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Payment processed by Stripe on this page. We never see your card details. {programTitle} is non-refundable by default; significant circumstances handled case-by-case via email.
          </div>
        </form>
      )}
    </div>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs text-gray-400 uppercase tracking-wider mb-1">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}{required && <span className="text-[#7E57C2]">*</span>}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-[#0A0A0A]">{o.label}</option>)}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]" />
    </label>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#7E57C2]" />
      <span className="text-xs text-gray-400">{label}</span>
    </label>
  );
}
