"use client";

import { useState } from "react";
import Link from "next/link";

interface ProgramInfo {
  id: string;
  title: string;
  dayLabel: string;
  timeLabel: string;
  venueName: string;
}

const SOURCES = [
  { v: "", label: "How did you hear about us?" },
  { v: "google", label: "Google" },
  { v: "instagram", label: "Instagram" },
  { v: "facebook", label: "Facebook" },
  { v: "word_of_mouth", label: "Word of mouth" },
  { v: "flyer", label: "Flyer" },
  { v: "newsletter", label: "Newsletter" },
];

const YEARS = ["", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];
const LEVELS = ["", "beginner", "intermediate", "advanced"];

const inputClass =
  "w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-[#7E57C2] focus:outline-none transition-colors";

export function TermSignupForm({ program }: { program: ProgramInfo }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const payload = {
      program_id: program.id,
      parent: {
        first_name: String(f.get("parent_first") || "").trim(),
        last_name: String(f.get("parent_last") || "").trim(),
        email: String(f.get("parent_email") || "").trim(),
        phone: String(f.get("parent_phone") || "").trim(),
        source: String(f.get("source") || ""),
      },
      kid: {
        first_name: String(f.get("kid_first") || "").trim(),
        last_name: String(f.get("kid_last") || "").trim(),
        year_at_school: String(f.get("year") || "") || null,
        volleyball_level: (String(f.get("level") || "") || null) as
          | "beginner"
          | "intermediate"
          | "advanced"
          | null,
        school_name: String(f.get("school") || "").trim() || null,
        medical_notes: String(f.get("medical") || "").trim() || null,
        photo_consent: f.get("photo_consent") === "on",
        injury_ack: f.get("injury_ack") === "on",
      },
    };

    try {
      const res = await fetch("/api/booking/term/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-[#7E57C2]/30 bg-[#7E57C2]/[0.06] rounded-xl p-8 text-center">
        <h2 className="font-heading text-2xl text-white tracking-wide mb-3">You&apos;re enrolled</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-2">
          Your spot is reserved with nothing to pay now. Come along for your first two weeks. We&apos;ve
          emailed you a confirmation and we&apos;ll be in touch with the details.
        </p>
        <p className="text-gray-500 text-sm mb-6">See you on court!</p>
        <Link href="/term-programs" className="text-[#7E57C2] hover:text-white text-sm transition-colors">
          ← Back to weekly training
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Parent */}
      <fieldset className="space-y-4">
        <legend className="font-heading text-lg text-white tracking-wide mb-2">Parent / guardian</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="parent_first" required placeholder="First name" className={inputClass} autoComplete="given-name" />
          <input name="parent_last" required placeholder="Last name" className={inputClass} autoComplete="family-name" />
          <input name="parent_email" required type="email" placeholder="Email" className={inputClass} autoComplete="email" />
          <input name="parent_phone" required placeholder="Phone" className={inputClass} autoComplete="tel" />
        </div>
        <select name="source" defaultValue="" className={inputClass}>
          {SOURCES.map((s) => (
            <option key={s.v} value={s.v} className="bg-[#111]">{s.label}</option>
          ))}
        </select>
      </fieldset>

      {/* Child */}
      <fieldset className="space-y-4">
        <legend className="font-heading text-lg text-white tracking-wide mb-2">Player attending</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="kid_first" required placeholder="Child's first name" className={inputClass} />
          <input name="kid_last" required placeholder="Child's last name" className={inputClass} />
          <select name="year" defaultValue="" className={inputClass}>
            {YEARS.map((y) => (
              <option key={y} value={y} className="bg-[#111]">{y || "Year at school"}</option>
            ))}
          </select>
          <select name="level" defaultValue="" className={inputClass}>
            {LEVELS.map((l) => (
              <option key={l} value={l} className="bg-[#111]">{l ? l[0].toUpperCase() + l.slice(1) : "Level (optional)"}</option>
            ))}
          </select>
          <input name="school" placeholder="School (optional)" className={`${inputClass} sm:col-span-2`} />
        </div>
        <textarea name="medical" rows={2} placeholder="Medical notes or anything we should know (optional)" className={inputClass} />
        <label className="flex items-start gap-3 text-sm text-gray-400">
          <input type="checkbox" name="photo_consent" className="mt-1 accent-[#7E57C2]" />
          <span>I consent to occasional photos/video of training being used to promote the academy.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-gray-400">
          <input type="checkbox" name="injury_ack" required className="mt-1 accent-[#7E57C2]" />
          <span>I understand volleyball carries a risk of injury and my child is fit to participate.</span>
        </label>
      </fieldset>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#5E35A8] text-white font-heading text-xl px-8 py-4 hover:bg-[#7E57C2] transition-colors duration-300 tracking-wide disabled:opacity-60"
      >
        {submitting ? "ENROLLING…" : "ENROL — NOTHING TO PAY NOW"}
      </button>
      <p className="text-gray-600 text-xs text-center">No card required. You only pay if you continue after the two free weeks.</p>
    </form>
  );
}
