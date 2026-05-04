import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import Image from "next/image";
import Link from "next/link";
import CampLocationPicker from "./CampLocationPicker";
import TrackPixelView from "@/components/TrackPixelView";

export const metadata: Metadata = {
  title: "Volleyball Holiday Camps | Sydney Junior Volleyball | Obsidian",
  description:
    "Junior volleyball holiday camps in Sydney for ages 8–18. Currently running at Baulkham Hills with new venues coming soon. Book now.",
  keywords: [
    "volleyball holiday camp Sydney",
    "school holiday volleyball Sydney",
    "junior volleyball holiday program Sydney",
    "volleyball camp Baulkham Hills",
  ],
  alternates: { canonical: "/holiday-camp" },
  openGraph: {
    title: "Volleyball Holiday Camps | Sydney Junior Volleyball | Obsidian",
    description:
      "Junior volleyball holiday camps in Sydney for ages 8 to 18.",
    images: ["/images/gallery-spike.jpg"],
    url: "/holiday-camp",
  },
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
      <TrackPixelView contentName="holiday_camp" contentCategory="camp" />
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
                  Three courts, three levels, weekdays during school holidays at Baulkham Hills High School. Camps run 9 AM to 1 PM.
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

      <CampLocationPicker />
    </div>
  );
}
