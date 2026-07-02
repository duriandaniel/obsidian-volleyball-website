import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    // Thin suburb pages were removed; consolidate them into their venue hub.
    const toWestRyde = [
      "ryde",
      "eastwood",
      "meadowbank",
      "denistone",
      "top-ryde",
      "putney",
      "north-ryde",
      "marsfield",
      "macquarie-park",
    ];
    const toKellyville = [
      "north-kellyville",
      "beaumont-hills",
      "rouse-hill",
      "glenwood",
      "stanhope-gardens",
      "kellyville-ridge",
    ];
    return [
      // Force the apex (non-www) host as canonical.
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: "www.obsidianvolleyball.com" }],
        destination: "https://obsidianvolleyball.com/:path*",
        permanent: true,
      },
      ...toWestRyde.map((s) => ({ source: `/areas/${s}`, destination: "/west-ryde", permanent: true })),
      ...toKellyville.map((s) => ({ source: `/areas/${s}`, destination: "/kellyville", permanent: true })),
    ];
  },
};

export default nextConfig;
