import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants/site";
import { TEAMS } from "@/lib/constants/team";
import { PAST_EVENTS, UPCOMING_EVENTS } from "@/lib/constants/events";

/** Generated sitemap of the public marketing routes. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/about",
    "/events",
    "/team",
    "/team/all",
    "/playground",
    "/tools",
    "/roadmap",
    "/join",
    "/code-of-conduct",
    "/privacy",
  ];

  const teamPaths = TEAMS.map((t) => `/team/${t.key}`);
  const eventPaths = [...UPCOMING_EVENTS, ...PAST_EVENTS].map(
    (e) => `/events/${e.slug}`,
  );

  const all = [...staticPaths, ...teamPaths, ...eventPaths];

  return all.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
