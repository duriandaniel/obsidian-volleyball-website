"use client";

import { useState } from "react";

// Big term buttons the visitor presses first; then we reveal only that term's
// table. Each section is a server-rendered table for one term, passed in.
export default function TermTabs({ terms, sections }: { terms: string[]; sections: React.ReactNode[] }) {
  const [sel, setSel] = useState<number | null>(terms.length === 1 ? 0 : null);
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {terms.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setSel(i)}
            className={`font-heading text-2xl sm:text-3xl tracking-wide px-8 py-7 border transition-all duration-300 ${
              sel === i
                ? "bg-[#5E35A8] border-[#5E35A8] text-white glow-purple"
                : "border-white/15 text-white hover:border-[#7E57C2] hover:text-[#7E57C2]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {sel === null ? (
        <p className="text-gray-500 text-sm border border-white/[0.08] p-6 text-center">
          Pick a term above to see the classes.
        </p>
      ) : (
        sections[sel]
      )}
    </div>
  );
}
