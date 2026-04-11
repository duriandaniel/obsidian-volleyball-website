import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Volleyball Holiday Camps | Baulkham Hills, Sydney Hills District",
  description:
    "Volleyball holiday camps in Baulkham Hills for juniors aged 8–18. School holiday programs in the Hills District, Sydney. Active Kids Voucher accepted. Book now.",
  keywords: [
    "volleyball holiday camp Baulkham Hills",
    "school holiday volleyball Sydney",
    "volleyball camp Castle Hill",
    "junior volleyball holiday program Hills District",
    "Active Kids Voucher volleyball",
  ],
};

const campDetails = [
  { label: "WHEN", value: "School holiday periods — July, October, January, April" },
  { label: "WHERE", value: "Baulkham Hills High School, Hills District" },
  { label: "WHO", value: "Juniors aged 8–18, all skill levels" },
  { label: "DURATION", value: "Full-day (9AM–1PM) and half-day sessions" },
  { label: "VOUCHERS", value: "NSW Active Kids Vouchers accepted (up to $100)" },
  { label: "GROUPS", value: "Small groups — maximum coach-to-player ratio" },
];

const whatToBring = [
  "Sports shoes (clean, non-marking soles)",
  "Water bottle (large — sessions are active)",
  "Lunch and snacks for full-day camps",
  "Hat and sunscreen for any outdoor warm-up",
  "Active Kids Voucher code if using one",
  "A positive attitude and readiness to work hard",
];

const upcomingCamps = [
  {
    term: "JULY HOLIDAYS",
    name: "Mid-Year Volleyball Camp",
    dates: "Check booking page for dates",
    levels: "All levels",
    active: true,
  },
  {
    term: "OCTOBER HOLIDAYS",
    name: "Spring Volleyball Camp",
    dates: "Check booking page for dates",
    levels: "All levels",
    active: false,
  },
  {
    term: "JANUARY HOLIDAYS",
    name: "Summer Intensive Camp",
    dates: "Check booking page for dates",
    levels: "All levels",
    active: false,
  },
];

const campSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Volleyball Holiday Camp — Obsidian Volleyball Academy",
  description:
    "Intensive junior volleyball camps during school holidays in Baulkham Hills, Sydney Hills District. Beginner to advanced skill levels, ages 8–18. Active Kids Voucher accepted.",
  provider: {
    "@type": "SportsOrganization",
    name: "Obsidian Volleyball Academy",
    url: "https://obsidianvolleyball.com",
  },
  coursePrerequisites: "No experience required for beginner level",
  educationalLevel: "Beginner, Intermediate, Advanced",
  audience: {
    "@type": "PeopleAudience",
    suggestedMinAge: 8,
    suggestedMaxAge: 18,
  },
  locationCreated: {
    "@type": "Place",
    name: "Baulkham Hills High School",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Baulkham Hills",
      addressRegion: "NSW",
      postalCode: "2153",
      addressCountry: "AU",
    },
  },
  offers: {
    "@type": "Offer",
    price: "200",
    priceCurrency: "AUD",
    availability: "https://schema.org/InStock",
    url: "https://obsidianvolleyball.as.me",
    description: "5-day camp package includes free OVA shirt. Active Kids Voucher accepted.",
  },
};

export default function HolidayCampPage() {
  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(campSchema) }} />
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-16 items-end">
            <SectionReveal>
              <div>
                <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-6">SCHOOL HOLIDAY PROGRAMS</p>
                <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
                  HOLIDAY
                  <br />
                  <span className="text-[#00FF88]">CAMPS</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
                  Intensive skill-building volleyball camps during school holidays in Baulkham Hills.
                  Beginner to advanced — we have the right program.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#00FF88] text-black font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-green"
                  >
                    BOOK A CAMP
                  </a>
                  <Link
                    href="/contact"
                    className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#00FF88] hover:text-[#00FF88] transition-all duration-300 tracking-wide text-center"
                  >
                    ASK A QUESTION
                  </Link>
                </div>
              </div>
            </SectionReveal>
            {/* Photo placeholder */}
            <SectionReveal delay={0.2}>
              <div className="photo-placeholder aspect-[4/5] relative hidden lg:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-700 text-xs tracking-wider">CAMP ACTION PHOTO</span>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Active Kids Banner */}
      <section className="bg-[#00FF88] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <p className="text-black font-heading text-lg sm:text-xl tracking-wide text-center">
            NSW ACTIVE KIDS VOUCHERS ACCEPTED — UP TO $100 OFF PER CHILD
          </p>
        </div>
      </section>

      {/* Camp Details */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-3">CAMP INFO</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">WHAT TO EXPECT</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {campDetails.map((detail, i) => (
              <SectionReveal key={detail.label} delay={i * 0.05}>
                <div className="bg-[#111] p-8 group hover:bg-[#161616] transition-colors duration-500">
                  <p className="text-[#00FF88] font-heading text-xs tracking-[0.3em] mb-3">{detail.label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{detail.value}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Camps */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-3">UPCOMING</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">CAMP DATES</h2>
            </div>
          </SectionReveal>
          <div className="space-y-2">
            {upcomingCamps.map((camp, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-white/[0.06] hover:border-[#00FF88]/20 transition-all duration-500">
                  <div className="flex-1">
                    <p className="text-[#00FF88] font-heading text-xs tracking-[0.3em] mb-2">{camp.term}</p>
                    <h3 className="font-heading text-3xl text-white group-hover:text-[#00FF88] transition-colors duration-300 mb-1">
                      {camp.name}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                      <span>{camp.dates}</span>
                      <span>&middot;</span>
                      <span>{camp.levels}</span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex-shrink-0">
                    {camp.active ? (
                      <a
                        href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#00FF88] text-black font-heading text-base px-6 py-2.5 hover:bg-white transition-all duration-300 tracking-wide inline-block"
                      >
                        BOOK NOW
                      </a>
                    ) : (
                      <span className="text-gray-600 font-heading text-sm tracking-[0.2em]">COMING SOON</span>
                    )}
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* What to Bring + Venue */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <SectionReveal>
              <div>
                <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-3">PREPARE</p>
                <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-10">WHAT TO BRING</h2>
                <ul className="space-y-4">
                  {whatToBring.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-gray-400">
                      <span className="text-[#00FF88] font-heading text-lg flex-shrink-0 w-6">{i + 1}</span>
                      <span className="text-sm leading-relaxed pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div>
                <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-3">LOCATION</p>
                <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-8">VENUE</h2>
                <div className="mb-6">
                  <address className="not-italic space-y-2">
                    <p className="text-white text-lg">Baulkham Hills High School</p>
                    <p className="text-gray-500 text-sm">Baulkham Hills, NSW 2153</p>
                    <p className="text-gray-500 text-sm">Hills District, Sydney</p>
                  </address>
                  <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                    Free parking on-site. Indoor courts — weather never a problem.
                  </p>
                </div>
                <div className="photo-placeholder aspect-[16/9]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-700 text-xs tracking-wider">VENUE PHOTO</span>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] text-center relative overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh]"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,255,136,0.03) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-4">SPOTS ARE LIMITED</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK YOUR
              <br />
              <span className="text-[#00FF88]">PLACE</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Holiday camps fill fast. Book early to guarantee a spot. Active Kids Vouchers accepted.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#00FF88] text-black font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-green"
            >
              BOOK NOW
            </a>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              BAULKHAM HILLS &middot; ACTIVE KIDS ACCEPTED &middot; ALL SKILL LEVELS
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
