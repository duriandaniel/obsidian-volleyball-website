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
    "Junior volleyball holiday camps in Sydney for ages 8 to 18 at Baulkham Hills. July 6 to 17, Monday to Friday, 9 AM to 1 PM. Bookings open soon.",
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
    "Intensive junior volleyball camps during school holidays in Baulkham Hills, Sydney. Beginner to advanced skill levels, ages 8–18.",
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
    url: "https://obsidianvolleyball.com/booking/camps",
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
                <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">SCHOOL HOLIDAY PROGRAMS</p>
                <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
                  HOLIDAY
                  <br />
                  <span className="text-[#7E57C2]">CAMPS</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mb-4 leading-relaxed">
                  Three courts, three levels at Baulkham Hills High School.
                  <br />
                  <span className="text-white">July 6 to 17 &middot; Monday to Friday &middot; 9 AM to 1 PM.</span>
                </p>
                <p className="text-gray-500 text-base max-w-xl mb-10">
                  Bookings open soon — more information coming.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <span className="bg-white/5 border border-white/15 text-gray-300 font-heading text-xl px-8 py-4 tracking-wide text-center">
                    BOOKINGS OPEN SOON
                  </span>
                  <Link
                    href="/contact"
                    className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide text-center"
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
