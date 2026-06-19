"use client";

import { useState } from "react";
import { formatCents, TRIAL_PRICE_CENTS } from "@/lib/booking/pricing";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";
import JerseyAddOn, { EMPTY_JERSEY, type JerseyChoice } from "@/components/JerseyAddOn";

type ParentForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: "" | "google" | "instagram" | "facebook" | "word_of_mouth" | "flyer" | "newsletter";
};

type KidForm = {
  first_name: string;
  last_name: string;
  year_at_school: string;
  volleyball_level: "" | "beginner" | "intermediate" | "advanced";
  school_name: string;
  medical_notes: string;
  photo_consent: boolean;
  injury_ack: boolean;
};

const SOURCE_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "word_of_mouth", label: "Word of mouth" },
  { value: "flyer", label: "Flyer" },
  { value: "newsletter", label: "Newsletter" },
];

const YEAR_OPTIONS = [
  { value: "", label: "Select…" },
  ...Array.from({ length: 11 }, (_, i) => {
    const n = i + 2;
    return { value: `Year ${n}`, label: `Year ${n}` };
  }),
];

const TZ = "Australia/Sydney";
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });

type SessionLite = { id: string; starts_at: string; ends_at: string };

export function TermEnrolForm({
  programId,
  programTitle,
  perWeekCents,
  weeksRemaining,
  defaultPlan = "term",
  sessions = [],
  casualPriceCents,
  trialPriceCents = TRIAL_PRICE_CENTS,
}: {
  programId: string;
  programTitle: string;
  perWeekCents: number;
  weeksRemaining: number;
  defaultPlan?: "term" | "trial" | "casual";
  sessions?: SessionLite[];
  casualPriceCents: number;
  trialPriceCents?: number;
}) {
  const trialLocked = defaultPlan === "trial";
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<"term" | "trial" | "casual">(defaultPlan);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [jersey, setJersey] = useState<JerseyChoice>(EMPTY_JERSEY);
  const [parent, setParent] = useState<ParentForm>({ first_name: "", last_name: "", email: "", phone: "", source: "" });
  const [kid, setKid] = useState<KidForm>({
    first_name: "",
    last_name: "",
    year_at_school: "",
    volleyball_level: "",
    school_name: "",
    medical_notes: "",
    photo_consent: false,
    injury_ack: false,
  });

  const total = perWeekCents * weeksRemaining;
  const casualTotal = casualPriceCents * selected.size;
  const toggle = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const proceed = () => {
    setError(null);
    if (plan === "casual" && selected.size === 0) { setError("Pick at least one class."); return; }
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kid.school_name.trim()) {
      setError("Please enter your child's school name.");
      return;
    }
    if (!kid.photo_consent) {
      setError("Please tick the photo and marketing consent box.");
      return;
    }
    if (!kid.injury_ack) {
      setError("Please tick the injury disclaimer to continue.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const bypass = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("x-vercel-protection-bypass") : null;
      const endpoint = plan === "trial" ? "/api/booking/trial/checkout" : plan === "casual" ? "/api/booking/casual/checkout" : "/api/booking/term/checkout";
      const apiUrl = `${endpoint}${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_id: programId,
          ...(plan === "casual" ? { session_ids: Array.from(selected) } : {}),
          ...(plan === "term" ? { jersey: { add: jersey.add } } : {}),
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
      if (!res.ok) throw new Error(json.error ?? "Checkout failed");
      // Free trial: no payment — server confirmed it and sent us straight to success.
      if (json.free && json.redirect_url) {
        window.location.href = json.redirect_url;
        return;
      }
      if (!json.client_secret) throw new Error(json.error ?? "Checkout failed");
      setClientSecret(json.client_secret);
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02] space-y-4">
      {!trialLocked && !open && !clientSecret && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPlan("term")} className={`rounded px-3 py-2 text-xs font-heading tracking-[0.12em] border transition-colors ${plan === "term" ? "border-[#7E57C2] bg-[#7E57C2]/10 text-white" : "border-white/10 text-gray-400 hover:border-white/30"}`}>FULL TERM</button>
          <button type="button" onClick={() => setPlan("casual")} className={`rounded px-3 py-2 text-xs font-heading tracking-[0.12em] border transition-colors ${plan === "casual" ? "border-[#7E57C2] bg-[#7E57C2]/10 text-white" : "border-white/10 text-gray-400 hover:border-white/30"}`}>SINGLE CLASS</button>
        </div>
      )}

      <div>
        {plan === "term" && (
          <>
            <div className="text-xs text-gray-500 mb-1">Full term · {weeksRemaining} week{weeksRemaining === 1 ? "" : "s"}</div>
            <div className="font-heading text-3xl text-[#7E57C2]">{formatCents(total)}</div>
            <div className="text-xs text-gray-500">{formatCents(perWeekCents)}/week — save {formatCents(casualPriceCents - perWeekCents)}/class vs casual.</div>
          </>
        )}
        {plan === "trial" && (
          <>
            <div className="text-xs text-gray-500 mb-1">Trial class</div>
            <div className="font-heading text-3xl text-[#7E57C2]">{trialPriceCents === 0 ? "Free" : formatCents(trialPriceCents)}</div>
            <div className="text-xs text-gray-500">Try a single junior class. Limit one trial per player.</div>
          </>
        )}
        {plan === "casual" && (
          <>
            <div className="text-xs text-gray-500 mb-1">Casual · {formatCents(casualPriceCents)}/class</div>
            <div className="font-heading text-3xl text-[#7E57C2]">{formatCents(casualTotal)}</div>
            <div className="text-xs text-gray-500 mb-3">Pick the classes to drop into. Coming weekly? The term works out cheaper.</div>
            {!open && !clientSecret && (
              <div className="space-y-1.5 max-h-52 overflow-auto">
                {sessions.length === 0 && <div className="text-xs text-gray-500">No upcoming classes.</div>}
                {sessions.map((s) => {
                  const on = selected.has(s.id);
                  return (
                    <button type="button" key={s.id} onClick={() => toggle(s.id)} className={`w-full flex items-center justify-between gap-2 rounded border px-3 py-2 text-left text-sm transition-colors ${on ? "border-[#7E57C2] bg-[#7E57C2]/10" : "border-white/10 hover:border-white/30"}`}>
                      <span className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${on ? "bg-[#7E57C2] border-[#7E57C2] text-white" : "border-white/30"}`}>{on ? "✓" : ""}</span>
                        {fmtDate(s.starts_at)}
                      </span>
                      <span className="text-gray-400">{formatCents(casualPriceCents)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {!open && (
        <button
          type="button"
          onClick={proceed}
          className="w-full bg-[#7E57C2] hover:bg-[#4A2780] text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors disabled:opacity-40"
          disabled={weeksRemaining === 0}
        >
          {weeksRemaining === 0 ? "TERM HAS ENDED" : plan === "trial" ? "BOOK A TRIAL" : plan === "casual" ? "CONTINUE" : "ENROL NOW"}
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
              <Select label="Year at school" value={kid.year_at_school} onChange={(v) => setKid({ ...kid, year_at_school: v })} options={YEAR_OPTIONS} required />
              <Select label="Volleyball level" value={kid.volleyball_level} onChange={(v) => setKid({ ...kid, volleyball_level: v as KidForm["volleyball_level"] })} required options={[
                { value: "", label: "Select…" },
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]} />
            </Row>
            <Field label="School name" value={kid.school_name} onChange={(v) => setKid({ ...kid, school_name: v })} required />
            <TextArea label="Medical notes / allergies" value={kid.medical_notes} onChange={(v) => setKid({ ...kid, medical_notes: v })} placeholder="Optional. Anything coaches should know." />
            <Checkbox checked={kid.photo_consent} onChange={(v) => setKid({ ...kid, photo_consent: v })} label="I consent to photos/videos of my child being used on Obsidian Volleyball Academy social media and website." />
            <Checkbox checked={kid.injury_ack} onChange={(v) => setKid({ ...kid, injury_ack: v })} label="I understand volleyball involves physical activity and a risk of injury, and I accept responsibility for my child's participation. Any relevant medical conditions are noted above." />
          </Fieldset>

          {plan === "term" && <JerseyAddOn value={jersey} onChange={setJersey} />}

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

function Select({ label, value, onChange, options, required }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}{required && <span className="text-[#7E57C2]">*</span>}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]">
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
