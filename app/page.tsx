import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CoachCard from "@/components/CoachCard";
import Gallery from "@/components/Gallery";
import InstagramFeed from "@/components/InstagramFeed";
import SectionReveal from "@/components/SectionReveal";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Obsidian Volleyball Academy | Junior Volleyball Sydney Hills District",
  description:
    "Premium junior volleyball academy in Baulkham Hills, Sydney Hills District. Holiday camps and term programs for ages 8–18.",
  keywords: [
    "volleyball academy Sydney",
    "junior volleyball Sydney",
    "volleyball holiday camp Hills District",
    "volleyball Baulkham Hills",
    "junior volleyball Hills District",
  ],
};


const faqs = [
  {
    q: "Where are the camps held?",
    a: "Baulkham Hills High School — indoor courts, Hills District.",
  },
  {
    q: "What age groups do you cater for?",
    a: "Juniors aged 8–18, grouped by skill level not age.",
  },
  {
    q: "My child has never played — is that OK?",
    a: "Yes. Our beginner programs are built for zero experience.",
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
                <p className="text-gray-400 leading-relaxed">
                  Founded in 2025 to bring elite volleyball coaching to the Hills District.
                  High-performance training at Baulkham Hills High School — no more travelling across Sydney.
                </p>
                <div className="flex gap-10 mt-10">
                  <div>
                    <p className="font-heading text-5xl text-[#9B4FDE]">2025</p>
                    <p className="text-gray-600 text-xs mt-1 tracking-wider">EST.</p>
                  </div>
                  <div>
                    <p className="font-heading text-5xl text-[#9B4FDE]">3</p>
                    <p className="text-gray-600 text-xs mt-1 tracking-wider">LEVELS</p>
                  </div>
                  <div>
                    <p className="font-heading text-5xl text-[#9B4FDE]">8–18</p>
                    <p className="text-gray-600 text-xs mt-1 tracking-wider">AGES</p>
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


      {/* Gallery */}
      <Gallery />

      {/* Instagram */}
      <InstagramFeed />

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            <CoachCard
              name="Melinda"
              role="Head Coach & Co-Founder"
              bio="Years of competitive volleyball experience and a deep commitment to junior development."
              qualifications={["NSWCHS Opens Champion", "NSW & SW Blues Award", "WWCC Verified"]}
              image="/images/coach-melinda-card.jpg"
              index={0}
            />
            <CoachCard
              name="Jessica"
              role="Lead Coach"
              bio="Energetic style and technical expertise. Specialises in skill development for intermediate and advanced juniors."
              qualifications={["2x Women Div 1 SVL Champion", "2x AYVC Medalist", "WWCC Verified"]}
              image="/images/coach-jessica-card.jpg"
              index={1}
            />
            <CoachCard
              name="Tom"
              role="Coach"
              bio="State-level competitive experience and a deep understanding of the game at every level."
              qualifications={["u23 QLD State Team", "Premier Division PVL", "WWCC Verified"]}
              image="/images/coach-tom-card.jpg"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Jerseys */}
      <section id="jerseys" className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="section-divider absolute left-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">GEAR UP</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
                  OVA
                  <br />
                  <span className="text-[#9B4FDE]">JERSEYS</span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Grab an official OVA training jersey at camp. Try on different sizes on-site and take one home.
                </p>
                <div className="flex items-baseline gap-3 mb-8">
                  <p className="font-heading text-5xl text-[#9B4FDE]">$36</p>
                  <p className="text-gray-600 text-sm">per jersey</p>
                </div>
                <p className="text-gray-600 text-sm">
                  Available for purchase on-site at any holiday camp. Multiple sizes available — try before you buy.
                </p>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src="/images/jersey-detail.jpg"
                  alt="Obsidian Volleyball Academy jersey"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  quality={85}
                />
              </div>
            </SectionReveal>
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
                  <p className="text-gray-500 text-sm">
                    Free parking. Indoor courts. Central to Castle Hill, Kellyville, Cherrybrook, Bella Vista.
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/uZ1dpxWT93XRDwAk6"
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
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3315.3!2d150.9927!3d-33.7627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12983e5a5c7e0d%3A0x2b0e5a29b0c1f1e0!2sObsidian%20Volleyball%20Academy!5e0!3m2!1sen!2sau!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Obsidian Volleyball Academy location"
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

    </>
  );
}
