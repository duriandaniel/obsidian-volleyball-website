"use client";

import { formatCents, CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";

export type JerseyChoice = { add: boolean };
export const EMPTY_JERSEY: JerseyChoice = { add: false };

// Jersey add-on used at every checkout (camp / term / adult). Renders as an
// "add an item" button (like adding another day), not a small checkbox. Camps
// pre-add it (opt-out); term and adult start with it off (opt-in). Size is NOT
// chosen here — players try it on and pick their size when they collect it.
export default function JerseyAddOn({
  value,
  onChange,
}: {
  value: JerseyChoice;
  onChange: (v: JerseyChoice) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange({ add: !value.add })}
      aria-pressed={value.add}
      className={`w-full text-left rounded-lg border p-4 flex items-center justify-between gap-4 transition-colors ${
        value.add ? "border-[#7E57C2] bg-[#7E57C2]/10" : "border-white/15 hover:border-white/30"
      }`}
    >
      <div>
        <div className="font-heading text-base tracking-wide text-white">
          {value.add ? "Obsidian jersey" : "Add Obsidian jersey"}
        </div>
        <div className="text-xs text-gray-400 mt-1 leading-relaxed">
          {value.add
            ? "Choose your size when you collect it. Already have one? Tap to remove."
            : "Not needed if you already have one. Choose your size when you collect it."}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="font-heading text-lg text-white">+{formatCents(CAMP_JERSEY_CENTS)}</span>
        <span
          className={`text-[11px] font-heading tracking-[0.15em] ${value.add ? "text-[#7E57C2]" : "text-gray-500"}`}
        >
          {value.add ? "ADDED ✓ · REMOVE" : "ADD"}
        </span>
      </div>
    </button>
  );
}
