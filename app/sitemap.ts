import type { MetadataRoute } from "next";

const suburbs = [
  "castle-hill",
  "kellyville",
  "cherrybrook",
  "bella-vista",
  "winston-hills",
  "northmead",
  "carlingford",
  "west-pennant-hills",
  "dural",
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
      url: `${baseUrl}/holiday-camp`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/term-programs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/coaches`,
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
