import type { Metadata } from "next";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";

export const metadata: Metadata = {
  title: "Volleyball Camps Baulkham Hills",
  description:
    "Junior volleyball holiday camps in Baulkham Hills, Sydney. School-holiday programs at Baulkham Hills High School for ages 8 to 18, all skill levels. Book now.",
  keywords: [
    "volleyball Baulkham Hills",
    "volleyball coaching Baulkham Hills",
    "junior volleyball Baulkham Hills",
    "volleyball camp Baulkham Hills",
    "holiday volleyball Hills District",
    "volleyball Baulkham Hills High School",
    "kids volleyball Hills District",
    "volleyball near me Castle Hill",
  ],
  alternates: { canonical: "/baulkham-hills" },
  openGraph: {
    title: "Volleyball Coaching Baulkham Hills | Holiday Camps",
    description:
      "Junior volleyball holiday camps at Baulkham Hills High School. Ages 8 to 18, all skill levels.",
    images: ["/images/gallery-spike.jpg"],
    url: "/baulkham-hills",
  },
};

const venueSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Obsidian Volleyball Academy — Baulkham Hills",
  description:
    "Junior volleyball holiday camps at Baulkham Hills High School. School-holiday programs for ages 8 to 18.",
  url: "https://obsidianvolleyball.com/baulkham-hills",
  image: "https://obsidianvolleyball.com/images/gallery-spike.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Windsor Road",
    addressLocality: "Baulkham Hills",
    addressRegion: "NSW",
    postalCode: "2153",
    addressCountry: "AU",
  },
  areaServed: [
    "Baulkham Hills",
    "Castle Hill",
    "Bella Vista",
    "Kellyville",
    "North Rocks",
    "Winston Hills",
    "Northmead",
  ],
  sport: "Volleyball",
  audience: {
    "@type": "PeopleAudience",
    suggestedMinAge: 8,
    suggestedMaxAge: 18,
  },
  parentOrganization: {
    "@type": "SportsOrganization",
    name: "Obsidian Volleyball Academy",
    url: "https://obsidianvolleyball.com",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://obsidianvolleyball.com" },
    { "@type": "ListItem", position: 2, name: "Baulkham Hills", item: "https://obsidianvolleyball.com/baulkham-hills" },
  ],
};

export default function BaulkhamHillsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Hero
        eyebrow="BAULKHAM HILLS HIGH SCHOOL · SYDNEY"
        titleLine1="Baulkham"
        titleLine2="Hills"
        body="School-holiday volleyball camps at Baulkham Hills High School. Three indoor courts, ages 8 to 18, all skill levels. Weekly term programs also running in West Ryde."
        primaryLabel="BOOK A CAMP"
        primaryHref="/booking/camps"
        primaryLocation="baulkham_hills_hero"
        primaryTier="5_day_pack"
        secondaryHref="/holiday-camp"
        secondaryLabel="CAMP DETAILS"
      />
      <HomeSections />
    </>
  );
}
