import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { GoogleTagManagerScript, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { MetaPixelScript, MetaPixelNoScript } from "@/components/MetaPixel";
import CookieConsent from "@/components/CookieConsent";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Obsidian Volleyball Academy | Junior Volleyball Sydney Hills District",
    template: "%s | Obsidian Volleyball Academy",
  },
  description:
    "Premium junior volleyball academy in Baulkham Hills, Sydney Hills District. Holiday camps and term programs for all skill levels.",
  keywords: [
    "volleyball academy Sydney",
    "junior volleyball Sydney",
    "volleyball holiday camp Hills District",
    "volleyball Baulkham Hills",
    "volleyball camp Castle Hill",
    "junior volleyball Hills District",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Obsidian Volleyball Academy",
    title: "Obsidian Volleyball Academy | Junior Volleyball Sydney",
    description:
      "Premium junior volleyball academy in Baulkham Hills. Holiday camps, term programs for all skill levels.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Obsidian Volleyball Academy: Junior Volleyball in the Hills District",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidian Volleyball Academy | Junior Volleyball Sydney",
    description:
      "Premium junior volleyball academy in Baulkham Hills. Holiday camps, term programs for all skill levels.",
    images: ["/images/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://obsidianvolleyball.com"),
  alternates: {
    canonical: "/",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const SITE_URL = "https://obsidianvolleyball.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Obsidian Volleyball Academy",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  email: "obsidianvolleyball@gmail.com",
  sameAs: ["https://instagram.com/obsidianvolleyball"],
  foundingDate: "2025",
  areaServed: { "@type": "AdministrativeArea", name: "Hills District, Sydney" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "SportsActivityLocation"],
  "@id": `${SITE_URL}/#localbusiness`,
  name: "Obsidian Volleyball Academy",
  description:
    "Premium junior volleyball academy in Baulkham Hills, Sydney Hills District. Holiday camps and term programs for ages 8 to 18.",
  url: SITE_URL,
  image: `${SITE_URL}/images/hero.jpg`,
  email: "obsidianvolleyball@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Windsor Road",
    addressLocality: "Baulkham Hills",
    addressRegion: "NSW",
    postalCode: "2153",
    addressCountry: "AU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -33.7627,
    longitude: 150.9927,
  },
  sport: "Volleyball",
  priceRange: "$35-$200",
  sameAs: ["https://instagram.com/obsidianvolleyball"],
  areaServed: [
    "Baulkham Hills",
    "Castle Hill",
    "Kellyville",
    "Cherrybrook",
    "Bella Vista",
    "Winston Hills",
    "Northmead",
    "Carlingford",
    "West Pennant Hills",
    "Dural",
    "Hills District",
    "Sydney",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "13:00",
      validFrom: "2025-01-01",
      description: "School holiday camps run weekdays during NSW school holidays.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <head>
        <GoogleTagManagerScript />
        <MetaPixelScript />
        <script dangerouslySetInnerHTML={{ __html: "window.dataLayer=window.dataLayer||[];" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-obsidian text-white">
        <GoogleTagManagerNoScript />
        <MetaPixelNoScript />
        <PromoBanner />
        <Nav />
        <main className="flex-1 pt-8">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
