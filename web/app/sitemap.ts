import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://dojo-x.vercel.app";
const PAGES = ["", "/programs", "/schedule", "/pricing", "/coaches", "/about", "/free-trial", "/faqs", "/blog", "/gallery", "/contact"];
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({ url: SITE + p, changeFrequency: p === "/schedule" ? "daily" : "weekly", priority: p === "" ? 1 : p === "/free-trial" ? 0.9 : 0.7 }));
}
