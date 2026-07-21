"use client";

import { useState } from "react";
import { formatCents, formatSpotsLeft } from "@/lib/booking/pricing";
import { EmbeddedPayment } from "@/app/booking/EmbeddedPayment";
import JerseyAddOn, { EMPTY_JERSEY, type JerseyChoice } from "@/components/JerseyAddOn";
import WaitlistForm from "@/components/WaitlistForm";

type AdultSession = {
  id: string;
  starts_at: string;
  ends_at: string;
  venue_name: string;
  spots_left: number;
  price_cents: number;
};

type Mode = "browsing" | "details" | "paying";
type Level = "" | "beginner" | "social_player" | "svl_player";
type Source = "" | "google" | "instagram" | "facebook" | "word_of_mouth" | "flyer" | "newsletter";

const TZ = "Australia/Sydney";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: TZ });

const LEVELS: { value: Level; label: string }[] = [
  { value: "", label: "Select…" },
  { value: "beginner", label: "Beginner" },
  { value: "social_player", label: "Social Player" },
  { value: "svl_player", label: "SVL Player" },
];

// Men's Development Squad positional-tryout intake.
const POSITIONS: { value: string; label: string }[] = [
  { value: "setter", label: "Setter" },
  { value: "outside", label: "Outside Hitter" },
  { value: "middle", label: "Middle Blocker" },
  { value: "opposite", label: "Opposite" },
  { value: "libero", label: "Libero" },
  { value: "flex", label: "Flexible / Any" },
];
const HIGHEST_LEVEL: { value: string; label: string }[] = [
  { value: "", label: "Select…" },
  { value: "social", label: "Social comps" },
  { value: "svl_div_3_4", label: "SVL Div 3 or 4" },
  { value: "svl_2_plus", label: "SVL 2 or above" },
];

const SOURCES: { value: Source; label: string }[] = [
  { value: "", label: "Select…" },
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "word_of_mouth", label: "Word of mouth" },
  { value: "flyer", label: "Flyer" },
  { value: "newsletter", label: "Newsletter" },
];

export function AdultSessionsForm({
  sessions,
  showJersey = true,
  squadIntake = false,
}: {
  sessions: AdultSession[];
  showJersey?: boolean;
  squadIntake?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Spots per selected night (group bookings under one name). Missing = 1.
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<Mode>("browsing");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<Level>("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [highest, setHighest] = useState("");
  const [source, setSource] = useState<Source>("");
  const [visionRead, setVisionRead] = useState(false);
  const [eligibility, setEligibility] = useState(false);
  const [consent, setConsent] = useState(false);
  const [jersey, setJersey] = useState<JerseyChoice>(EMPTY_JERSEY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const locked = mode !== "browsing";

  const toggle = (id: string) => {
    if (locked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setQtys((q) => {
          const { [id]: _drop, ...rest } = q;
          return rest;
        });
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const qtyFor = (id: string) => qtys[id] ?? 1;
  const setQty = (id: string, qty: number) => setQtys((q) => ({ ...q, [id]: qty }));

  const count = selected.size;
  const totalSpots = Array.from(selected).reduce((sum, id) => sum + qtyFor(id), 0);
  const total = sessions.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + s.price_cents * qtyFor(s.id), 0);

  const continueToDetails = () => {
    if (count === 0) return;
    setError(null);
    setMode("details");
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setTimeout(() => document.getElementById("adult-summary")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (squadIntake) {
      if (!position) return setError("Select the position you want to trial for.");
      if (!experience.trim()) return setError("Please briefly describe your volleyball experience.");
      if (!highest) return setError("Please select your highest level played.");
      if (!eligibility) return setError("Please confirm you haven't played SVL Reserves or Premier in the last 3 years.");
      if (!visionRead) return setError("Please confirm you've read the squad vision and the commitment.");
    } else if (!level) {
      return setError("Please select your level.");
    }
    if (!consent) return setError("Please tick the photo/marketing consent box.");
    setSubmitting(true);
    setError(null);
    try {
      const bypass =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("x-vercel-protection-bypass") : null;
      const apiUrl = `/api/booking/dropin/checkout${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_ids: Array.from(selected),
          quantities: Object.fromEntries(Array.from(selected).map((id) => [id, qtyFor(id)])),
          jersey: { add: jersey.add },
          player: {
            name,
            email,
            phone,
            source,
            marketing_consent: consent,
            ...(squadIntake
              ? {
                  nominated_positions: [position],
                  volleyball_experience: experience,
                  highest_level: highest,
                }
              : { level }),
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
      {/* LEFT: night list */}
      <div className="space-y-3">
        {sessions.map((s) => {
          const isSelected = selected.has(s.id);
          const soldOut = s.spots_left <= 0;
          return (
            <div
              key={s.id}
              className={`border rounded-lg p-4 transition-colors ${
                isSelected
                  ? "border-[#7E57C2] bg-[#7E57C2]/5"
                  : soldOut
                  ? "border-white/5"
                  : "border-white/10 hover:border-white/30"
              } ${locked ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="font-heading text-lg">{fmtDate(s.starts_at)}</div>
                  <div className="text-sm text-gray-400">
                    {fmtTime(s.starts_at)} – {fmtTime(s.ends_at)} · {s.venue_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatCents(s.price_cents)} · {formatSpotsLeft(s.spots_left)}
                  </div>
                </div>
                {soldOut ? (
                  <WaitlistForm sessionId={s.id} kidField={false} align="right" showSoldOutLabel={false} />
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => toggle(s.id)}
                      className={`px-4 py-2 rounded font-heading text-xs tracking-[0.2em] transition-colors ${
                        isSelected ? "bg-[#7E57C2] text-white" : "bg-white/5 hover:bg-white/10 text-white"
                      } ${locked ? "cursor-not-allowed" : ""}`}
                    >
                      {isSelected ? "REMOVE" : "ADD"}
                    </button>
                    {isSelected && !squadIntake && (
                      <label className="flex items-center gap-2 text-xs text-gray-400">
                        Spots
                        <select
                          value={qtyFor(s.id)}
                          disabled={locked}
                          onChange={(e) => setQty(s.id, parseInt(e.target.value, 10))}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#7E57C2]"
                        >
                          {Array.from({ length: Math.max(1, Math.min(8, s.spots_left)) }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n} className="bg-[#0A0A0A]">
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT: summary -> details -> payment */}
      <div id="adult-summary" className="space-y-4 md:sticky md:top-24 self-start border border-white/10 rounded-lg p-6 bg-white/[0.02]">
        <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">YOUR NIGHTS</div>
        {count === 0 ? (
          <div className="text-sm text-gray-500">No nights selected yet.</div>
        ) : (
          <>
            <div className="space-y-1 text-sm max-h-40 overflow-auto">
              {sessions
                .filter((s) => selected.has(s.id))
                .map((s) => (
                  <div key={s.id} className="flex justify-between gap-2">
                    <span className="text-gray-400">
                      {fmtDate(s.starts_at)}
                      {qtyFor(s.id) > 1 ? ` × ${qtyFor(s.id)}` : ""}
                    </span>
                    <span>{formatCents(s.price_cents * qtyFor(s.id))}</span>
                  </div>
                ))}
            </div>
            <div className="flex justify-between font-heading text-lg pt-2 border-t border-white/10">
              <span>Total</span>
              <span>{formatCents(total)}</span>
            </div>

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
                  {count} night{count === 1 ? "" : "s"} · {totalSpots} spot{totalSpots === 1 ? "" : "s"} ·{" "}
                  {formatCents(totalSpots ? Math.round(total / totalSpots) : 0)} each
                </div>
              </>
            )}

            {mode === "details" && (
              <form onSubmit={submit} className="space-y-4 pt-2 border-t border-white/10">
                <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2]">YOUR DETAILS</div>
                <Input label="Name" value={name} onChange={setName} required />
                <Input label="Email" type="email" value={email} onChange={setEmail} required />
                <Input label="Mobile" type="tel" value={phone} onChange={setPhone} required />
                {squadIntake ? (
                  <>
                    <div>
                      <span className="block text-xs text-gray-500 mb-2">
                        Position you want to trial for<span className="text-[#7E57C2]">*</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {POSITIONS.map((p) => {
                          const on = position === p.value;
                          return (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setPosition(p.value)}
                              className={`px-3 py-2 rounded text-xs text-left transition-colors border ${
                                on
                                  ? "border-[#7E57C2] bg-[#7E57C2]/10 text-white"
                                  : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30"
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="block">
                      <span className="block text-xs text-gray-500 mb-1">
                        Briefly describe your volleyball experience<span className="text-[#7E57C2]">*</span>
                      </span>
                      <textarea
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        required
                        rows={3}
                        maxLength={500}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2] resize-y"
                      />
                    </label>
                    <Select label="Highest level played" value={highest} onChange={setHighest} options={HIGHEST_LEVEL} required />
                  </>
                ) : (
                  <Select label="Your level" value={level} onChange={(v) => setLevel(v as Level)} options={LEVELS} required />
                )}
                <Select label="How did you hear about us?" value={source} onChange={(v) => setSource(v as Source)} options={SOURCES} />
                {squadIntake && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={visionRead} onChange={(e) => setVisionRead(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#7E57C2]" required />
                    <span className="text-xs text-gray-400">
                      I&apos;ve read the{" "}
                      <a href="/mens-squad" target="_blank" rel="noopener noreferrer" className="text-[#7E57C2] underline hover:text-white">
                        squad vision
                      </a>{" "}
                      and understand this is a selection trial. If I&apos;m offered a spot, I&apos;m ready to commit to the 8 week squad ($216, about $27 a week). <span className="text-[#7E57C2]">*</span>
                    </span>
                  </label>
                )}
                {squadIntake && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={eligibility} onChange={(e) => setEligibility(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#7E57C2]" required />
                    <span className="text-xs text-gray-400">
                      I confirm I have not played SVL Reserves or Premier League in the last 3 years. <span className="text-[#7E57C2]">*</span>
                    </span>
                  </label>
                )}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#7E57C2]" required />
                  <span className="text-xs text-gray-400">
                    I consent to Obsidian Volleyball Academy capturing and using photos and video from sessions for marketing and social media. <span className="text-[#7E57C2]">*</span>
                  </span>
                </label>

                {showJersey && <JerseyAddOn value={jersey} onChange={setJersey} />}

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
                    {submitting ? "PREPARING…" : "PAY"}
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Payment by Stripe on this page. Have a coupon? Enter it at the payment step. Drop-in nights are non-refundable.
                </div>
              </form>
            )}

            {mode === "paying" && clientSecret && (
              <div className="pt-2 border-t border-white/10">
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

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">
        {label}
        {required && <span className="text-[#7E57C2]">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2]"
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
