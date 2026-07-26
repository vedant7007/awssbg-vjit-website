import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants/site";

/** Crawler policy. Public pages are open; app/private areas are disallowed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/console", "/signin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
