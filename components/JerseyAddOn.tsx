"use client";

import { formatCents, CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";

export const JERSEY_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type JerseySize = (typeof JERSEY_SIZES)[number];
export type JerseyChoice = { add: boolean; size: "" | JerseySize };

export const EMPTY_JERSEY: JerseyChoice = { add: false, size: "" };

// Optional jersey add-on used at every checkout (camp / term / adult). Opt-in
// only — never pre-ticked. Size is required once ticked (enforced server-side too).
export default function JerseyAddOn({
  value,
  onChange,
  disabled,
}: {
  value: JerseyChoice;
  onChange: (v: JerseyChoice) => void;
  disabled?: boolean;
}) {
  if (disabled) return null;
  return (
    <div className="pt-3 border-t border-white/10 space-y-2">
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value.add}
          onChange={(e) => onChange({ ...value, add: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-[#7E57C2]"
        />
        <span className="text-xs text-gray-300 leading-relaxed">
          Add an Obsidian jersey (+{formatCents(CAMP_JERSEY_CENTS)}). New players love wearing the squad
          colours from day one.
        </span>
      </label>
      {value.add && (
        <select
          value={value.size}
          onChange={(e) => onChange({ ...value, size: e.target.value as "" | JerseySize })}
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7E57C2] transition-colors"
        >
          <option value="" className="bg-[#0A0A0A]">Select size…</option>
          {JERSEY_SIZES.map((s) => (
            <option key={s} value={s} className="bg-[#0A0A0A]">
              {s}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
