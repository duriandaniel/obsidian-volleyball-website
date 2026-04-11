import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ProgramCard from "@/components/ProgramCard";
import CoachCard from "@/components/CoachCard";
import Gallery from "@/components/Gallery";
import SectionReveal from "@/components/SectionReveal";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Obsidian Volleyball Academy | Junior Volleyball Sydney Hills District",
  description:
    "Premium junior volleyball academy in Baulkham Hills, Sydney Hills District. Holiday camps and term programs. Volleyball NSW affiliated. Active Kids Voucher accepted.",
  keywords: [
    "volleyball academy Sydney",
    "junior volleyball Sydney",
    "volleyball holiday camp Hills District",
    "volleyball Baulkham Hills",
    "junior volleyball Hills District",
  ],
};

const programs = [
  {
    title: "BEGINNER BLAST",
    level: "BEGINNER",
    ageRange: "8–12",
    description:
      "Never played before? Perfect. We build foundational skills in a supportive, fun environment — serving, passing, and court awareness from day one.",
    features: [
      "Learn the rules and court positions",
      "Master the basics: serve, pass, set",
      "Small group coaching ratio",
      "Build confidence through structured play",
    ],
  },
  {
    title: "SKILL BUILDER",
    level: "INTERMEDIATE",
    ageRange: "10–16",
    description:
      "Already playing? Time to level up. Technique refinement, game reading, and team coordination for juniors ready to compete.",
    features: [
      "Advanced serving and attacking",
      "Defence and blocking fundamentals",
      "Tactical game play and positioning",
      "Prep for club and school competition",
    ],
  },
  {
    title: "ELITE PROGRAM",
    level: "ADVANCED",
    ageRange: "13–18",
    description:
      "For serious juniors with competition goals. High-intensity sessions focused on performance volleyball — state-level training principles.",
    features: [
      "Aligned with Volleyball NSW pathways",
      "Video analysis and tactical debriefs",
      "Physical conditioning components",
      "Pathway to representative volleyball",
    ],
  },
];

const faqs = [
  {
    q: "Do you accept Active Kids Vouchers?",
    a: "Yes! We accept NSW Government Active Kids Vouchers (up to $100 per child per year). Bring your voucher when booking or enter the code at checkout.",
  },
  {
    q: "Where are the camps held?",
    a: "All sessions are at Baulkham Hills High School — indoor courts with excellent facilities, right in the Hills District.",
  },
  {
    q: "What age groups do you cater for?",
    a: "Programs for juniors aged 8 to 18. Players are grouped by skill level, not just age, so everyone trains at the right intensity.",
  },
  {
    q: "My child has never played — is that OK?",
    a: "Absolutely. Our beginner programs are designed for zero experience. Coaches make it fun and non-intimidating from session one.",
  },
];

const whyOVA = [
  {
    title: "QUALIFIED COACHES",
    desc: "All coaches hold Volleyball NSW accreditation with competitive playing experience and a passion for junior development.",
    stat: "VNSW",
    statLabel: "Accredited",
  },
  {
    title: "SKILL-BASED GROUPING",
    desc: "Players grouped by ability, not age. Beginners aren't held back. Advanced players aren't bored. Everyone trains at the right level.",
    stat: "3",
    statLabel: "Skill Levels",
  },
  {
    title: "HILLS DISTRICT",
    desc: "Central to Castle Hill, Kellyville, Cherrybrook, Bella Vista. No more travelling across Sydney for quality coaching.",
    stat: "BHills",
    statLabel: "Location",
  },
  {
    title: "CLEAR PATHWAYS",
    desc: "Aligned with Volleyball NSW so advanced players can transition to club and representative volleyball with confidence.",
    stat: "NSW",
    statLabel: "Pathways",
  },
];

// Structured data for FAQ and Events
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Mid-Year Volleyball Camp — Obsidian Volleyball Academy",
  description:
    "Intensive junior volleyball camp for all skill levels (beginner to advanced) during July school holidays in Baulkham Hills, Sydney.",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Baulkham Hills High School",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Windsor Road",
      addressLocality: "Baulkham Hills",
      addressRegion: "NSW",
      postalCode: "2153",
      addressCountry: "AU",
    },
  },
  organizer: {
    "@type": "SportsOrganization",
    name: "Obsidian Volleyball Academy",
    url: "https://obsidianvolleyball.com",
  },
  offers: {
    "@type": "Offer",
    price: "200",
    priceCurrency: "AUD",
    availability: "https://schema.org/InStock",
    url: "https://obsidianvolleyball.as.me",
    description: "5-day camp package includes free OVA shirt",
  },
  audience: {
    "@type": "PeopleAudience",
    suggestedMinAge: 8,
    suggestedMaxAge: 18,
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <Hero />

      {/* Programs */}
      <section id="programs" className="py-24 lg:py-32 bg-[#0A0A0A] relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">TRAIN WITH PURPOSE</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">PROGRAMS</h2>
              </div>
              <Link
                href="/holiday-camp"
                className="mt-4 lg:mt-0 text-gray-500 hover:text-[#9B4FDE] text-sm flex items-center gap-2 transition-colors duration-300"
              >
                See holiday camp dates
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((p) => (
              <ProgramCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* About — Asymmetric layout */}
      <section id="about" className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 lg:gap-24 items-center">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">OUR STORY</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
                  ABOUT
                  <br />
                  <span className="text-[#9B4FDE]">OVA</span>
                </h2>
                <div className="space-y-5 text-gray-400 leading-relaxed">
                  <p>
                    Obsidian Volleyball Academy was founded in 2025 with a single mission: bring
                    elite-standard volleyball coaching to junior players in the Hills District.
                  </p>
                  <p>
                    Too many talented young players had to travel far for quality coaching.
                    OVA changed that — high-performance training right here at Baulkham Hills
                    High School.
                  </p>
                </div>
                <div className="flex gap-10 mt-10">
                  <div>
                    <p className="font-heading text-5xl text-[#9B4FDE]">2025</p>
                    <p className="text-gray-600 text-xs mt-1 tracking-wider">EST.</p>
                  </div>
                  <div>
                    <p className="font-heading text-5xl text-[#9B4FDE]">NSW</p>
                    <p className="text-gray-600 text-xs mt-1 tracking-wider">AFFILIATED</p>
                  </div>
                  <div>
                    <p className="font-heading text-5xl text-[#9B4FDE]">3</p>
                    <p className="text-gray-600 text-xs mt-1 tracking-wider">LEVELS</p>
                  </div>
                </div>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src="/images/about.jpg"
                  alt="Obsidian Volleyball Academy players at Baulkham Hills High School"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  quality={85}
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Why OVA */}
      <section id="why-ova" className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="section-divider absolute left-0 right-0" style={{ marginTop: '-96px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">THE DIFFERENCE</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">WHY OVA</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.04]">
            {whyOVA.map((item) => (
              <SectionReveal key={item.title}>
                <div className="bg-[#0A0A0A] p-8 lg:p-10 group hover:bg-[#111] transition-colors duration-500">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="font-heading text-2xl text-white tracking-wide group-hover:text-[#9B4FDE] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-heading text-3xl text-[#9B4FDE]">{item.stat}</p>
                      <p className="text-gray-700 text-[10px] tracking-wider">{item.statLabel}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Dates - Editorial style */}
      <section id="dates" className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">DON&apos;T MISS OUT</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">UPCOMING</h2>
              </div>
              <Link
                href="/holiday-camp"
                className="mt-4 lg:mt-0 text-gray-500 hover:text-[#9B4FDE] text-sm flex items-center gap-2 transition-colors"
              >
                All camp info
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </SectionReveal>

          <div className="space-y-2">
            {[
              { period: "JULY HOLIDAYS", name: "Mid-Year Volleyball Camp", status: "BOOKING NOW", active: true },
              { period: "TERM 3", name: "Term Program — All Levels", status: "ENQUIRE", active: true },
              { period: "OCTOBER HOLIDAYS", name: "Spring Volleyball Camp", status: "COMING SOON", active: false },
            ].map((event, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-white/[0.06] hover:border-[#9B4FDE]/20 transition-all duration-500">
                  <div className="flex items-baseline gap-4 sm:gap-8">
                    <span className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] w-32 flex-shrink-0">
                      {event.period}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl text-white group-hover:text-[#9B4FDE] transition-colors duration-300">
                      {event.name}
                    </h3>
                  </div>
                  <div className="mt-3 sm:mt-0 ml-32 sm:ml-0">
                    {event.active ? (
                      <a
                        href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9B4FDE] font-heading text-sm tracking-[0.2em] hover:text-white transition-colors"
                      >
                        {event.status}
                      </a>
                    ) : (
                      <span className="text-gray-600 font-heading text-sm tracking-[0.2em]">
                        {event.status}
                      </span>
                    )}
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery />

      {/* Coaches */}
      <section id="coaches" className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">YOUR TEAM</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">COACHES</h2>
              </div>
              <Link
                href="/coaches"
                className="mt-4 lg:mt-0 text-gray-500 hover:text-[#9B4FDE] text-sm flex items-center gap-2 transition-colors"
              >
                Meet the full team
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 max-w-3xl">
            <CoachCard
              name="Melinda"
              role="Head Coach & Co-Founder"
              bio="Years of competitive volleyball experience and a deep commitment to junior development. Building player confidence alongside technical skill."
              qualifications={[
                "Volleyball NSW Accredited",
                "First Aid Certified",
                "WWCC Verified",
              ]}
              index={0}
            />
            <CoachCard
              name="Jessica"
              role="Lead Coach"
              bio="Energetic style and technical expertise. Specialises in skill development for intermediate and advanced juniors pushing toward competition."
              qualifications={[
                "Volleyball NSW Accredited",
                "First Aid Certified",
                "WWCC Verified",
              ]}
              index={1}
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="section-divider absolute left-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">FIND US</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">LOCATION</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
            <SectionReveal>
              <div>
                <div className="mb-8">
                  <h3 className="font-heading text-2xl text-[#9B4FDE] mb-4 tracking-wide">VENUE</h3>
                  <address className="not-italic space-y-2 text-gray-300 text-sm">
                    <p className="text-white text-lg">Baulkham Hills High School</p>
                    <p>Windsor Road, Baulkham Hills</p>
                    <p>NSW 2153</p>
                  </address>
                </div>
                <div className="border-t border-white/[0.06] pt-6 mb-8">
                  <h4 className="font-heading text-lg text-white mb-3 tracking-wide">GETTING HERE</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Free parking on-site. Indoor courts — weather never a problem.
                    Convenient to Castle Hill, Kellyville, Cherrybrook, Bella Vista, Winston Hills,
                    Northmead and surrounding suburbs.
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=Baulkham+Hills+High+School"
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
            {/* Google Maps */}
            <SectionReveal delay={0.15}>
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] overflow-hidden bg-[#111]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3315.3!2d150.9927!3d-33.7627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sBaulkham%20Hills%20High%20School!5e0!3m2!1sen!2sau!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Baulkham Hills High School location"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">COMMON QUESTIONS</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">FAQ</h2>
            </div>
          </SectionReveal>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <details className="group border-b border-white/[0.06]">
                  <summary className="flex justify-between items-center py-6 cursor-pointer list-none select-none">
                    <span className="font-heading text-xl text-white tracking-wide pr-4 group-hover:text-[#9B4FDE] transition-colors">
                      {faq.q}
                    </span>
                    <span className="text-gray-600 flex-shrink-0 text-sm font-heading tracking-widest group-open:text-[#9B4FDE] transition-colors">
                      +
                    </span>
                  </summary>
                  <div className="pb-6 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
                </details>
              </SectionReveal>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/faq" className="text-gray-600 hover:text-[#9B4FDE] text-sm transition-colors">
              See all questions &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 lg:py-40 bg-[#0A0A0A] relative overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        {/* Background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(123,47,190,0.04) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">READY TO START?</p>
            <h2 className="font-heading text-6xl sm:text-7xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              JOIN OVA
              <br />
              <span className="text-[#9B4FDE]">TODAY</span>
            </h2>
            <p className="text-gray-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Holiday camps and term programs available. Active Kids Vouchers welcome.
              Limited spots — book early.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
              >
                BOOK NOW
              </a>
              <Link
                href="/contact"
                className="border border-white/20 text-white font-heading text-3xl px-14 py-5 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide"
              >
                CONTACT
              </Link>
            </div>
            <p className="text-gray-700 text-xs mt-8 tracking-wider">
              ACTIVE KIDS VOUCHERS ACCEPTED &middot; VOLLEYBALL NSW AFFILIATED &middot; BAULKHAM HILLS
            </p>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
