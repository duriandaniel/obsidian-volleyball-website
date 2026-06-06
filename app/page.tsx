import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";

export const metadata: Metadata = {
  title: "Junior Volleyball Coaching Sydney | West Ryde & Baulkham Hills | Obsidian Volleyball Academy",
  description:
    "Quality junior volleyball coaching in Sydney. Friday term programs at Obsidian Volleyball Academy West Ryde. School-holiday camps at Baulkham Hills High School. Ages 8 to 18.",
  keywords: [
    "junior volleyball Sydney",
    "volleyball coaching Sydney",
    "volleyball West Ryde",
    "volleyball Baulkham Hills",
    "Obsidian Volleyball Academy West Ryde",
    "volleyball academy Sydney",
    "junior volleyball coaching Sydney",
    "kids volleyball Sydney",
  ],
};

const faqs = [
  {
    q: "Where do you run programs?",
    a: "Term programs at Obsidian Volleyball Academy West Ryde, every Friday. Holiday camps at Baulkham Hills High School.",
  },
  {
    q: "What age groups do you cater for?",
    a: "Juniors aged 8 to 18, grouped by skill level not age.",
  },
  {
    q: "My child has never played. Is that OK?",
    a: "Yes. Our beginner programs are built for zero experience.",
  },
];

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
  name: "Mid-Year Volleyball Camp | Obsidian Volleyball Academy",
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
    price: "250",
    priceCurrency: "AUD",
    availability: "https://schema.org/InStock",
    url: "https://obsidianvolleyball.com/booking",
    description: "5-day camp week pass. Single and half days also available.",
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
      <HomeSections />

      {/* Jersey shop band */}
      <section className="py-20 lg:py-28 bg-[#111] border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-lg bg-[#0A0A0A]">
              <Image
                src="/images/jersey-detail.jpg"
                alt="Obsidian Volleyball training jersey"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">OBSIDIAN GEAR</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-5 leading-[0.95]">
                GET THE JERSEY
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                Our purple squad-colour training jersey, worn by players at every camp and class. $36, sizes XS to XL.
              </p>
              <Link
                href="/shop/jersey"
                className="inline-block bg-[#5E35A8] text-white font-heading text-xl px-10 py-4 hover:bg-white hover:text-[#5E35A8] transition-all duration-300 tracking-wide glow-purple"
              >
                SHOP THE JERSEY
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
