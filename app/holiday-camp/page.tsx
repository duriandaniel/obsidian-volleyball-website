import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Volleyball Holiday Camps | Baulkham Hills, Sydney Hills District",
  description:
    "Volleyball holiday camps in Baulkham Hills for juniors aged 8–18. School holiday programs in the Hills District, Sydney. Book now.",
  keywords: [
    "volleyball holiday camp Baulkham Hills",
    "school holiday volleyball Sydney",
    "volleyball camp Castle Hill",
    "junior volleyball holiday program Hills District",
  ],
};

const campSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Volleyball Holiday Camp | Obsidian Volleyball Academy",
  description:
    "Intensive junior volleyball camps during school holidays in Baulkham Hills, Sydney Hills District. Beginner to advanced skill levels, ages 8–18.",
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
    description: "5-day camp package includes a free Obsidian training jersey.",
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
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">SCHOOL HOLIDAY PROGRAMS</p>
                <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
                  HOLIDAY
                  <br />
                  <span className="text-[#9B4FDE]">CAMPS</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
                  Intensive skill-building volleyball camps during school holidays in Baulkham Hills.
                  Beginner to advanced. We have the right program for your child.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <TrackedBookingLink
                    location="camp_hero"
                    className="bg-[#7B2FBE] text-white font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
                  >
                    BOOK A CAMP
                  </TrackedBookingLink>
                  <Link
                    href="/contact"
                    className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
                  >
                    ASK A QUESTION
                  </Link>
                </div>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="aspect-[4/5] relative hidden lg:block overflow-hidden">
                <Image
                  src="/images/gallery-spike.jpg"
                  alt="Volleyball camp action at Obsidian Volleyball Academy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  quality={85}
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Programs / Classes */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">CHOOSE YOUR LEVEL</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">PROGRAMS</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.04]">
            <SectionReveal>
              <div className="bg-[#111] p-8 lg:p-10 group hover:bg-[#161616] transition-colors duration-500">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em]">BEGINNER / INTERMEDIATE</p>
                  <span className="text-gray-600 font-heading text-xs tracking-wider">AGES 8–16</span>
                </div>
                <h3 className="font-heading text-3xl text-white tracking-wide mb-4 group-hover:text-[#9B4FDE] transition-colors duration-300">
                  SKILL DEVELOPMENT
                </h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Serving, passing, setting fundamentals</li>
                  <li>Court awareness and positioning</li>
                  <li>Small group coaching ratio</li>
                  <li>Fun, supportive environment</li>
                  <li>No experience required</li>
                </ul>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <div className="bg-[#111] p-8 lg:p-10 group hover:bg-[#161616] transition-colors duration-500">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em]">ADVANCED</p>
                  <span className="text-gray-600 font-heading text-xs tracking-wider">AGES 13–18</span>
                </div>
                <h3 className="font-heading text-3xl text-white tracking-wide mb-4 group-hover:text-[#9B4FDE] transition-colors duration-300">
                  TRAINING & SCRIMMAGE
                </h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>Advanced technique and tactics</li>
                  <li>Game-play scrimmages</li>
                  <li>Competition preparation</li>
                  <li>Physical conditioning</li>
                  <li>Prior experience required</li>
                </ul>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">INVESTMENT</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">PRICING</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Single Day */}
            <SectionReveal>
              <div className="border border-white/[0.06] p-8 lg:p-10 hover:border-[#9B4FDE]/20 transition-all duration-500">
                <p className="text-gray-600 font-heading text-xs tracking-[0.3em] mb-6">FLEXIBLE</p>
                <p className="font-heading text-5xl text-white mb-2">$50</p>
                <p className="text-gray-600 text-sm mb-6">Per day</p>
                <ul className="space-y-3 text-gray-400 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> Single day attendance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> 9AM – 1PM
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> No commitment required
                  </li>
                </ul>
                <TrackedBookingLink
                  tier="single_day"
                  location="pricing_single"
                  className="block border border-white/20 text-white font-heading text-lg px-6 py-3 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
                >
                  BOOK A DAY
                </TrackedBookingLink>
              </div>
            </SectionReveal>

            {/* 5-Day Package - Featured */}
            <SectionReveal delay={0.1}>
              <div className="border-2 border-[#9B4FDE]/40 p-8 lg:p-12 hover:border-[#9B4FDE] transition-all duration-500 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-[#7B2FBE] text-white font-heading text-xs tracking-[0.2em] px-4 py-1.5">BEST VALUE</span>
                </div>
                <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-6 mt-2">5-DAY PACKAGE</p>
                <p className="font-heading text-7xl text-white mb-2">$200</p>
                <p className="text-gray-600 text-sm mb-6">All 5 days + free shirt</p>
                <ul className="space-y-3 text-gray-400 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> All 5 days of camp
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> Free Obsidian training jersey included
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> 9AM – 1PM daily
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> Save $50 vs single days
                  </li>
                </ul>
                <TrackedBookingLink
                  tier="5_day_pack"
                  location="pricing_package"
                  className="block bg-[#7B2FBE] text-white font-heading text-lg px-6 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
                >
                  BOOK 5-DAY PACK
                </TrackedBookingLink>
              </div>
            </SectionReveal>

            {/* Half Day */}
            <SectionReveal delay={0.2}>
              <div className="border border-white/[0.06] p-8 lg:p-10 hover:border-[#9B4FDE]/20 transition-all duration-500">
                <p className="text-gray-600 font-heading text-xs tracking-[0.3em] mb-6">HALF DAY</p>
                <p className="font-heading text-5xl text-white mb-2">$35</p>
                <p className="text-gray-600 text-sm mb-6">Half-day session</p>
                <ul className="space-y-3 text-gray-400 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> Morning or afternoon
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> 2 hours of coaching
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#9B4FDE]">+</span> Great for younger players
                  </li>
                </ul>
                <TrackedBookingLink
                  tier="half_day"
                  location="pricing_half"
                  className="block border border-white/20 text-white font-heading text-lg px-6 py-3 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
                >
                  BOOK HALF DAY
                </TrackedBookingLink>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Camp Details */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">CAMP INFO</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">WHAT TO EXPECT</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {[
              { label: "WHEN", value: "School holiday periods: April, July, October, January" },
              { label: "WHERE", value: "Baulkham Hills High School, Hills District" },
              { label: "WHO", value: "Juniors aged 8–18, all skill levels" },
              { label: "TIME", value: "Full-day: 9AM–1PM. Half-day sessions also available" },
              { label: "GROUPS", value: "Small groups with high coach-to-player ratio" },
              { label: "INCLUDED", value: "Free Obsidian training jersey with 5-day package booking" },
            ].map((detail, i) => (
              <SectionReveal key={detail.label} delay={i * 0.05}>
                <div className="bg-[#111] p-8 group hover:bg-[#161616] transition-colors duration-500">
                  <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">{detail.label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{detail.value}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* What to Bring + Venue */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">PREPARE</p>
                <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-10">WHAT TO BRING</h2>
                <ul className="space-y-4">
                  {[
                    "Sports shoes (clean, non-marking soles)",
                    "Water bottle (large, sessions are active)",
                    "Lunch and snacks for full-day camps",
                    "Hat and sunscreen for any outdoor warm-up",
                    "A positive attitude and readiness to work hard",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-gray-400">
                      <span className="text-[#9B4FDE] font-heading text-lg flex-shrink-0 w-6">{i + 1}</span>
                      <span className="text-sm leading-relaxed pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">LOCATION</p>
                <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-8">VENUE</h2>
                <div className="mb-6">
                  <address className="not-italic space-y-2">
                    <p className="text-white text-lg">Baulkham Hills High School</p>
                    <p className="text-gray-500 text-sm">Windsor Road, Baulkham Hills</p>
                    <p className="text-gray-500 text-sm">NSW 2153, Hills District</p>
                  </address>
                  <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                    Free parking on-site. Indoor courts, so weather is never a problem.
                    Central to Castle Hill, Kellyville, Cherrybrook, and Bella Vista.
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/place/Obsidian+Volleyball+Academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#9B4FDE] text-sm font-medium hover:text-white transition-colors"
                >
                  Get directions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#111] text-center relative overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh]"
          style={{ background: "radial-gradient(ellipse at center, rgba(123,47,190,0.03) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">SPOTS ARE LIMITED</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK YOUR
              <br />
              <span className="text-[#9B4FDE]">PLACE</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Holiday camps fill fast. Book early to guarantee a spot.
            </p>
            <TrackedBookingLink
              location="camp_cta"
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK NOW
            </TrackedBookingLink>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              BAULKHAM HILLS &middot; ALL SKILL LEVELS &middot; AGES 8–18
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
