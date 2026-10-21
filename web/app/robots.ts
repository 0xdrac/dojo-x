import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://dojo-x.vercel.app";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/coach-app", "/member-portal", "/checkout", "/invoice", "/api/"] }, sitemap: `${SITE}/sitemap.xml` };
}
