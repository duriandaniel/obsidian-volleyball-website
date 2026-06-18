import type { Metadata } from "next";
import Hero from "@/components/Hero";
import ProgramsStrip from "@/components/ProgramsStrip";
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
      <ProgramsStrip />
      <HomeSections />
    </>
  );
}
