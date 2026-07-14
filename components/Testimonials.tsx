import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";

// ⚠️ PLACEHOLDER CONTENT — these are NOT real reviews.
// Replace `REVIEWS` with real Google reviews (reviewer first name + verbatim
// text) and set `IS_SAMPLE = false`. Do NOT ship sample text to production.
const IS_SAMPLE = true;

type Review = { name: string; text: string; stars: number };

const REVIEWS: Review[] = [
  { name: "Sample parent", stars: 5, text: "Real Google review goes here — a parent's own words about their child's experience." },
  { name: "Sample parent", stars: 5, text: "Real Google review goes here — short, specific quotes about a coach or a child's progress work best." },
  { name: "Sample parent", stars: 5, text: "Real Google review goes here — three to five of your strongest reviews is plenty." },
];

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Obsidian+Volleyball+Academy+reviews";

export default function Testimonials() {
  if (!REVIEWS.length) return null;
  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
            <div>
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">FROM OUR FAMILIES</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">REVIEWS</h2>
              {IS_SAMPLE && (
                <p className="mt-3 text-gray-600 text-xs tracking-wide">
                  Sample layout — real Google reviews to be added.
                </p>
              )}
            </div>
            <Link
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 lg:mt-0 text-gray-500 hover:text-[#7E57C2] text-sm flex items-center gap-2 transition-colors"
            >
              Read our reviews on Google
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {REVIEWS.map((r, i) => (
            <SectionReveal key={i} delay={i * 0.1}>
              <figure className="border-l-2 border-[#7E57C2]/40 pl-6">
                <div className="text-[#7E57C2] text-sm tracking-[0.3em] mb-4" aria-label={`${r.stars} out of 5`}>
                  {"★".repeat(r.stars)}
                </div>
                <blockquote className="text-gray-400 leading-relaxed">{r.text}</blockquote>
                <figcaption className="mt-5 text-white font-heading tracking-wide text-sm">
                  {r.name}
                </figcaption>
              </figure>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
