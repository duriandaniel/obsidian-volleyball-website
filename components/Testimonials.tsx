import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";

// ⚠️ PLACEHOLDER CONTENT — these are NOT real reviews.
// Replace `REVIEWS` with real Google reviews (reviewer first name + verbatim
// text) and set `IS_SAMPLE = false`. Do NOT ship sample text to production.
const IS_SAMPLE = true;

type Review = { name: string; role: string; stars: number; text: string };

const REVIEWS: Review[] = [
  {
    name: "Sample Parent",
    role: "OVA parent",
    stars: 5,
    text: "Replace me with a real Google review. Paste the parent's own words here so families read genuine feedback about their kids' experience at Obsidian.",
  },
  {
    name: "Sample Parent",
    role: "OVA parent",
    stars: 5,
    text: "Replace me with a real Google review. Short, specific quotes about a coach or a child's improvement convert best.",
  },
  {
    name: "Sample Parent",
    role: "OVA parent",
    stars: 5,
    text: "Replace me with a real Google review. Three to five of your best parent reviews works well here.",
  },
];

// Your public Google reviews link (swap for the exact Google Business "write a
// review" / profile URL when available).
const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Obsidian+Volleyball+Academy+reviews";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1 mb-4" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? "text-[#7E57C2]" : "text-white/15"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  if (!REVIEWS.length) return null;
  return (
    <section className="py-20 lg:py-28 bg-[#0A0A0A] relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom, rgba(94,53,168,0.10) 0%, transparent 60%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">
              WHAT PARENTS SAY
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl text-white tracking-wide">
              Loved by Sydney families
            </h2>
            {IS_SAMPLE && (
              <p className="mt-4 inline-block bg-[#7E57C2]/15 border border-[#7E57C2]/40 text-[#B79BE6] text-xs font-heading tracking-widest px-4 py-2 rounded-full">
                PREVIEW — SAMPLE TEXT, REAL GOOGLE REVIEWS TO BE ADDED
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <figure
                key={i}
                className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-7 flex flex-col"
              >
                {IS_SAMPLE && (
                  <span className="absolute top-4 right-4 text-[10px] font-heading tracking-widest text-[#7E57C2]/70 border border-[#7E57C2]/30 rounded px-2 py-0.5">
                    SAMPLE
                  </span>
                )}
                <Stars n={r.stars} />
                <blockquote className="text-gray-300 text-base leading-relaxed flex-1">
                  “{r.text}”
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-white/10">
                  <span className="text-white font-heading tracking-wide">{r.name}</span>
                  <span className="block text-gray-500 text-sm">{r.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white/20 text-white font-heading text-lg px-8 py-3 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide"
            >
              READ OUR REVIEWS ON GOOGLE
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
