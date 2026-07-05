"use client";

import { useMemo, useState } from "react";
import { priceCampCart, formatCents, formatSpotsLeft, CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";
import JerseyAddOn, { type JerseyChoice } from "@/components/JerseyAddOn";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";
import type { CampSessionView } from "./page";

type Session = CampSessionView;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Sydney",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
  });
}

type Mode = "browsing" | "details" | "paying";
type Selected = Map<string, { is_half_day: boolean }>;

type ParentForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: "" | "google" | "instagram" | "facebook" | "word_of_mouth" | "flyer" | "newsletter";
};

const SOURCE_OPTIONS: { value: ParentForm["source"]; label: string }[] = [
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

export function CampCart({ sessions }: { sessions: Session[] }) {
  const [selected, setSelected] = useState<Selected>(new Map());
  const [mode, setMode] = useState<Mode>("browsing");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [parent, setParent] = useState<ParentForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    source: "",
  });
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
  // Jersey add-on. Opt-OUT for camps: pre-added, tap to remove if they already
  // have one. Size is chosen on collection.
  const [jersey, setJersey] = useState<JerseyChoice>({ add: true });

  const pricing = useMemo(() => {
    return priceCampCart(
      Array.from(selected.entries()).map(([session_id, { is_half_day }]) => ({
        session_id,
        is_half_day,
      }))
    );
  }, [selected]);

  const jerseyCents = jersey.add ? CAMP_JERSEY_CENTS : 0;
  const grandTotal = pricing.total_cents + jerseyCents;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, { is_half_day: false });
      return next;
    });
  };

  const setHalfDay = (id: string, isHalf: boolean) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.set(id, { is_half_day: isHalf });
      return next;
    });
  };

  const continueToDetails = () => {
    if (selected.size === 0) return;
    setError(null);
    setMode("details");
    // Scroll into view on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setTimeout(() => {
        const el = document.getElementById("details-form");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
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

    // Preserve the Vercel auth-bypass token if present in URL (so webhook URLs stay reachable)
    const bypass = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("x-vercel-protection-bypass") : null;
    const apiUrl = `/api/booking/camp/checkout${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: Array.from(selected.entries()).map(([session_id, { is_half_day }]) => ({
            session_id,
            is_half_day,
          })),
          jersey: { add: jersey.add },
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
      setMode("paying");
      setSubmitting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_360px]">
      {/* LEFT: session list */}
      <div className="space-y-3">
        {sessions.map((s) => {
          const sel = selected.get(s.id);
          const isSelected = !!sel;
          const capacity = s.capacity_override ?? s.programs.default_capacity;
          const remaining = capacity - s.booked;
          const soldOut = remaining <= 0;
          const disabled = mode === "details" || mode === "paying";

          return (
            <div
              key={s.id}
              className={`border rounded-lg p-4 transition-colors ${
                isSelected
                  ? "border-[#7E57C2] bg-[#7E57C2]/5"
                  : soldOut
                  ? "border-white/5 opacity-50"
                  : "border-white/10 hover:border-white/30"
              } ${disabled ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">{s.programs.season ?? s.programs.title}</div>
                  <div className="font-heading text-lg">{formatDate(s.starts_at)}</div>
                  <div className="text-sm text-gray-400">
                    {formatTime(s.starts_at)} – {formatTime(s.ends_at)} · {s.programs.venues.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatSpotsLeft(remaining)}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={soldOut || disabled}
                  onClick={() => toggle(s.id)}
                  className={`px-4 py-2 rounded font-heading text-xs tracking-[0.2em] transition-colors ${
                    isSelected
                      ? "bg-[#7E57C2] text-white"
                      : "bg-white/5 hover:bg-white/10 text-white"
                  } ${soldOut || disabled ? "cursor-not-allowed" : ""}`}
                >
                  {isSelected ? "REMOVE" : "ADD"}
                </button>
              </div>
              {isSelected && !disabled && (
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setHalfDay(s.id, false)}
                    className={`px-3 py-1.5 rounded ${
                      !sel?.is_half_day ? "bg-[#7E57C2] text-white" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    Full day · 9am–1pm
                  </button>
                  <button
                    type="button"
                    onClick={() => setHalfDay(s.id, true)}
                    className={`px-3 py-1.5 rounded ${
                      sel?.is_half_day ? "bg-[#7E57C2] text-white" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    Half day · 9–11am · $45
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT: cart summary + (when in details mode) form */}
      <div id="details-form" className="space-y-4 md:sticky md:top-24 self-start border border-white/10 rounded-lg p-6 bg-white/[0.02]">
        <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">CART</div>
        {selected.size === 0 ? (
          <div className="text-sm text-gray-500">No days selected yet.</div>
        ) : (
          <>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Full days</span>
                <span>{pricing.full_days}</span>
              </div>
              {pricing.half_days > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Half days</span>
                  <span>{pricing.half_days}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>{formatCents(pricing.subtotal_cents)}</span>
              </div>
              {pricing.discount_cents > 0 && (
                <div className="flex justify-between text-[#7E57C2]">
                  <span>Bundle saving</span>
                  <span>−{formatCents(pricing.discount_cents)}</span>
                </div>
              )}
              {jersey.add && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Jersey</span>
                  <span>{formatCents(CAMP_JERSEY_CENTS)}</span>
                </div>
              )}
              <div className="flex justify-between font-heading text-lg pt-2 border-t border-white/10 mt-2">
                <span>Total</span>
                <span>{formatCents(grandTotal)}</span>
              </div>
            </div>

            {pricing.show_five_day_nudge && (
              <div className="text-xs text-[#7E57C2] bg-[#7E57C2]/10 border border-[#7E57C2]/30 rounded p-2.5 leading-relaxed">
                Add a 5th day and pay $30 less — the full 5-day pass is $250.
              </div>
            )}

            {mode !== "paying" && (
              <div className="pt-3 border-t border-white/10">
                <JerseyAddOn value={jersey} onChange={setJersey} />
              </div>
            )}

            {mode === "browsing" && (
              <>
                {error && <div className="text-sm text-red-400">{error}</div>}
                <button
                  type="button"
                  onClick={continueToDetails}
                  className="w-full bg-[#7E57C2] hover:bg-[#4A2780] text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
                >
                  CONTINUE
                </button>
                <div className="text-xs text-gray-500">
                  Next: enter parent + child details. Payment after that.
                </div>
              </>
            )}

            {mode === "details" && (
              <form onSubmit={submit} className="space-y-4 pt-2 border-t border-white/10 mt-4">
                <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">YOUR DETAILS</div>

                <Fieldset legend="Parent / guardian">
                  <Row>
                    <Field label="First name" value={parent.first_name} onChange={(v) => setParent({ ...parent, first_name: v })} required />
                    <Field label="Last name" value={parent.last_name} onChange={(v) => setParent({ ...parent, last_name: v })} required />
                  </Row>
                  <Field label="Email" type="email" value={parent.email} onChange={(v) => setParent({ ...parent, email: v })} required />
                  <Field label="Mobile" type="tel" value={parent.phone} onChange={(v) => setParent({ ...parent, phone: v })} required />
                  <Select
                    label="How did you hear about us?"
                    value={parent.source}
                    onChange={(v) => setParent({ ...parent, source: v as ParentForm["source"] })}
                    options={SOURCE_OPTIONS}
                  />
                </Fieldset>

                <Fieldset legend="Child attending">
                  <Row>
                    <Field label="First name" value={kid.first_name} onChange={(v) => setKid({ ...kid, first_name: v })} required />
                    <Field label="Last name" value={kid.last_name} onChange={(v) => setKid({ ...kid, last_name: v })} required />
                  </Row>
                  <Row>
                    <Select
                      label="Year at school"
                      value={kid.year_at_school}
                      onChange={(v) => setKid({ ...kid, year_at_school: v })}
                      options={YEAR_OPTIONS}
                    />
                    <Select
                      label="Volleyball level"
                      value={kid.volleyball_level}
                      onChange={(v) => setKid({ ...kid, volleyball_level: v as KidForm["volleyball_level"] })}
                      options={[
                        { value: "", label: "Select…" },
                        { value: "beginner", label: "Beginner" },
                        { value: "intermediate", label: "Intermediate" },
                        { value: "advanced", label: "Advanced" },
                      ]}
                    />
                  </Row>
                  <Field label="School name" value={kid.school_name} onChange={(v) => setKid({ ...kid, school_name: v })} required />
                  <TextArea
                    label="Medical notes / allergies"
                    value={kid.medical_notes}
                    onChange={(v) => setKid({ ...kid, medical_notes: v })}
                    placeholder="Optional. Anything coaches should know."
                  />
                  <Checkbox
                    checked={kid.photo_consent}
                    onChange={(v) => setKid({ ...kid, photo_consent: v })}
                    label="I consent to photos/videos of my child being used on Obsidian Volleyball Academy social media and website."
                  />
                  <Checkbox
                    checked={kid.injury_ack}
                    onChange={(v) => setKid({ ...kid, injury_ack: v })}
                    label="I understand volleyball involves physical activity and a risk of injury, and I accept responsibility for my child's participation. Any relevant medical conditions are noted above."
                  />
                </Fieldset>

                {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("browsing")}
                    disabled={submitting}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-heading text-xs tracking-[0.2em] rounded transition-colors"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#7E57C2] hover:bg-[#4A2780] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
                  >
                    {submitting ? "PREPARING…" : "CONTINUE TO PAYMENT"}
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Payment processed by Stripe on this page. We never see your card details.
                </div>
              </form>
            )}

            {mode === "paying" && clientSecret && (
              <div className="pt-2 border-t border-white/10 mt-4">
                <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2] mb-3">PAYMENT</div>
                <EmbeddedPayment clientSecret={clientSecret} />
                <button
                  type="button"
                  onClick={() => { setMode("details"); setClientSecret(null); }}
                  className="text-xs text-gray-500 hover:text-white mt-3"
                >
                  ← Back to details
                </button>
              </div>
            )}
          </>
        )}
      </div>
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2] transition-colors"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0A0A0A]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2] transition-colors"
      />
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#7E57C2]"
      />
      <span className="text-xs text-gray-400">{label}</span>
    </label>
  );
}
