import type { Metadata } from "next";
import { Suspense } from "react";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import Image from "next/image";
import Link from "next/link";
import CampDetails from "./CampDetails";
import TrackPixelView from "@/components/TrackPixelView";
import { getNextCampWindow, formatCampWindow } from "@/lib/booking/camps";

// Render at request time so camp dates come from the DB with live (runtime) env.
// (Build-time env lacks the sensitive Supabase URL, which would bake the fallback.)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Volleyball Holiday Camps Sydney",
  description:
    "Junior volleyball holiday camps in Sydney for ages 8 to 18 at Baulkham Hills. Held each NSW school holidays, Monday to Friday, 9 AM to 1 PM. Beginner to advanced.",
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
    price: "250",
    priceCurrency: "AUD",
    availability: "https://schema.org/InStock",
    url: "https://obsidianvolleyball.com/booking/camps",
    description: "5-day pass: any five days across the holiday period. Single and half days also available. Optional Obsidian training jersey add-on.",
  },
};

// The camp date label comes from the DB. Isolated in its own async component
// so the (force-dynamic) Supabase fetch streams in via Suspense and never
// blocks the hero from painting — critical for ad traffic landing here.
async function CampDates() {
  const campWindow = await getNextCampWindow();
  const dateLabel = campWindow ? formatCampWindow(campWindow) : "NSW school holidays";
  return <p className="text-white text-base">{dateLabel}</p>;
}

export default function HolidayCampPage() {
  return (
    <div>
      <TrackPixelView contentName="holiday_camp" contentCategory="camp" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(campSchema) }} />

      {/* Hero — full-bleed priority background so it paints instantly for ad clicks */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0">
          <Image
            src="/images/gallery-spike.jpg"
            alt="Junior volleyball holiday camp at Obsidian Volleyball Academy"
            fill
            priority
            className="object-cover opacity-70 object-[70%_center]"
            sizes="100vw"
            quality={80}
          />
          {/* Left-weighted gradient keeps the copy legible over the photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 via-45% to-transparent to-80%" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
          <div className="max-w-2xl">
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">SCHOOL HOLIDAY PROGRAMS</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              HOLIDAY
              <br />
              <span className="text-[#7E57C2]">CAMPS</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mb-8 leading-relaxed">
              Intensive school-holiday volleyball at Baulkham Hills High School. Three courts,
              three levels, all coached by our team.
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-5 mb-10">
              <div>
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-1.5">DATES</p>
                <Suspense fallback={<p className="text-white text-base">NSW school holidays</p>}>
                  <CampDates />
                </Suspense>
              </div>
              <div>
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-1.5">DAYS</p>
                <p className="text-white text-base">Monday to Friday</p>
              </div>
              <div>
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-1.5">TIME</p>
                <p className="text-white text-base">9 AM &ndash; 1 PM</p>
              </div>
              <div>
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-1.5">AFTERNOON CLASSES</p>
                <p className="text-white text-base">1:30 &ndash; 3:30 PM &middot; second week</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedBookingLink
                tier="general"
                location="camp_hero"
                href="/booking/camps"
                className="bg-[#5E35A8] text-white font-heading text-xl px-8 py-4 hover:bg-white hover:text-[#5E35A8] transition-all duration-300 tracking-wide text-center glow-purple"
              >
                BOOK NOW
              </TrackedBookingLink>
              <Link
                href="/contact"
                className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide text-center"
              >
                ASK A QUESTION
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CampDetails />
    </div>
  );
}
