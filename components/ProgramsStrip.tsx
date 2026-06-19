import Image from "next/image";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import SectionReveal from "@/components/SectionReveal";
import type { BookingLocation, BookingTier } from "@/lib/tracking";

interface ProgramCard {
  eyebrow: string;
  title: string;
  blurb: string;
  image: string;
  href: string;
  location: BookingLocation;
  tier: BookingTier;
}

const PROGRAMS: ProgramCard[] = [
  {
    eyebrow: "SCHOOL HOLIDAYS",
    title: "Holiday Camps",
    blurb: "Intensive multi-day camps at Baulkham Hills. Single days, half days, or any five days across the holidays.",
    image: "/images/gallery-spike.jpg",
    href: "/holiday-camp",
    location: "home_programs_camp",
    tier: "5_day_pack",
  },
  {
    eyebrow: "WEEKLY CLASSES",
    title: "Term Programs",
    blurb: "Weekly coaching at West Ryde and Kellyville, grouped by ability. Beginner, intermediate and advanced.",
    image: "/images/gallery-coaching.jpg",
    href: "/term-programs",
    location: "home_programs_term",
    tier: "term_program",
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
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="text-center mb-12 lg:mb-16">
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">
              CHOOSE YOUR PROGRAM
            </p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
              GET <span className="text-[#7E57C2]">STARTED</span>
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {PROGRAMS.map((p, i) => (
            <SectionReveal key={p.title} delay={i * 0.1}>
              <div className="group h-full flex flex-col border border-white/[0.08] bg-[#111] overflow-hidden transition-colors duration-300 hover:border-[#7E57C2]/40">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image
                    src={p.image}
                    alt={`${p.title} at Obsidian Volleyball Academy`}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={80}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                </div>
                <div className="p-7 lg:p-8 flex flex-col flex-grow">
                  <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-3">
                    {p.eyebrow}
                  </p>
                  <h3 className="font-heading text-3xl text-white tracking-wide mb-4">
                    {p.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-7 flex-grow">
                    {p.blurb}
                  </p>
                  <TrackedBookingLink
                    href={p.href}
                    location={p.location}
                    tier={p.tier}
                    className="self-start inline-block text-center bg-[#5E35A8] text-white font-heading text-lg px-8 py-3 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide"
                  >
                    READ MORE
                  </TrackedBookingLink>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
