import TrackedBookingLink from "@/components/TrackedBookingLink";
import SectionReveal from "@/components/SectionReveal";
import type { BookingLocation, BookingTier } from "@/lib/tracking";

// Factual trust badges only — no invented stats or testimonials.
const TRUST = [
  "Ages 8 to 18",
  "Beginner to advanced",
  "2 Sydney venues",
  "Coached by premier-league players",
];

interface ProgramCard {
  eyebrow: string;
  title: string;
  blurb: string;
  price: string;
  priceNote: string;
  href: string;
  cta: string;
  location: BookingLocation;
  tier: BookingTier;
}

const PROGRAMS: ProgramCard[] = [
  {
    eyebrow: "SCHOOL HOLIDAYS",
    title: "Holiday Camps",
    blurb: "Intensive multi-day camps at Baulkham Hills. Single days, half days, or the full week.",
    price: "$250",
    priceNote: "5-day week",
    href: "/holiday-camp",
    cta: "VIEW CAMPS",
    location: "home_programs_camp",
    tier: "5_day_pack",
  },
  {
    eyebrow: "EVERY FRIDAY",
    title: "Term Programs",
    blurb: "Weekly coaching at West Ryde, grouped by skill not age. Beginner, intermediate, advanced.",
    price: "$36",
    priceNote: "per week",
    href: "/term-programs",
    cta: "VIEW TERMS",
    location: "home_programs_term",
    tier: "term_program",
  },
  {
    eyebrow: "NOT SURE YET?",
    title: "Try a Class",
    blurb: "Book a one-off trial and let your child try a junior class before committing to a term.",
    price: "$25",
    priceNote: "one trial",
    href: "/booking/trial",
    cta: "BOOK A TRIAL",
    location: "home_programs_trial",
    tier: "general",
  },
];

export default function ProgramsStrip() {
  return (
    <section className="py-20 lg:py-28 bg-[#0A0A0A] border-t border-white/[0.06] relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(94,53,168,0.10) 0%, transparent 60%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">
              CHOOSE YOUR PROGRAM
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
              GET <span className="text-[#7E57C2]">STARTED</span>
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-gray-500 text-xs sm:text-sm">
              {TRUST.map((item, i) => (
                <span key={item} className="flex items-center gap-4">
                  {i > 0 && <span className="text-[#7E57C2]/40">&middot;</span>}
                  {item}
                </span>
              ))}
            </div>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PROGRAMS.map((p, i) => (
            <SectionReveal key={p.title} delay={i * 0.1}>
              <div className="group h-full flex flex-col bg-[#111] border border-white/[0.06] rounded-lg p-8 transition-colors duration-300 hover:border-[#7E57C2]/40">
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-3">
                  {p.eyebrow}
                </p>
                <h3 className="font-heading text-3xl text-white tracking-wide mb-4">
                  {p.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                  {p.blurb}
                </p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-heading text-4xl text-[#7E57C2]">{p.price}</span>
                  <span className="text-gray-600 text-sm">{p.priceNote}</span>
                </div>
                <TrackedBookingLink
                  href={p.href}
                  location={p.location}
                  tier={p.tier}
                  className="block w-full text-center bg-[#5E35A8] text-white font-heading text-lg px-6 py-3 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide"
                >
                  {p.cta}
                </TrackedBookingLink>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
