import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://shoppilot.help";
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/storyboard`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/inspiration`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/knowledge`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
