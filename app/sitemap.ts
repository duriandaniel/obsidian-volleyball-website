import type { MetadataRoute } from "next";

const suburbs = [
  // Ryde cluster — term programs
  "ryde",
  "eastwood",
  "meadowbank",
  "denistone",
  "top-ryde",
  "putney",
  "north-ryde",
  "marsfield",
  "macquarie-park",
  // Hills cluster — holiday camps
  "baulkham-hills",
  "castle-hill",
  "bella-vista",
  "kellyville",
  "north-rocks",
  "winston-hills",
  "northmead",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://obsidianvolleyball.com";
  const now = new Date();

  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/term-programs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/west-ryde`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/baulkham-hills`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/adult-sessions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/holiday-camp`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/coaches`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/areas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const suburbPages: MetadataRoute.Sitemap = suburbs.map((suburb) => ({
    url: `${baseUrl}/areas/${suburb}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...mainPages, ...suburbPages];
}
