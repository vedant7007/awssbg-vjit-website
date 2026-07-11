import type { MetadataRoute } from "next";

import { listMembers } from "@/lib/firestore/members.server";
import { listEvents } from "@/lib/firestore/events";
import { listProjects } from "@/lib/firestore/projects";
import { safe } from "@/lib/utils/safe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // 1. Static pages configuration
  const staticPages = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/team", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/members", changeFrequency: "daily" as const, priority: 0.7 },
    { path: "/events", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/projects", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/services", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/join", changeFrequency: "monthly" as const, priority: 0.7 },
  ].map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  // 2. Dynamic members profile pages
  let memberPages: MetadataRoute.Sitemap = [];
  try {
    const rawMembers = await safe(listMembers(), [], "sitemap:members");
    memberPages = rawMembers
      .filter((m) => m.isPublic)
      .map((m) => ({
        url: `${baseUrl}/m/${m.username}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[Sitemap] Failed to load members for sitemap:", err);
  }

  // 3. Dynamic events pages
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const rawEvents = await safe(listEvents(), [], "sitemap:events");
    eventPages = rawEvents.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[Sitemap] Failed to load events for sitemap:", err);
  }

  // 4. Dynamic projects pages
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const rawProjects = await safe(listProjects(), [], "sitemap:projects");
    projectPages = rawProjects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[Sitemap] Failed to load projects for sitemap:", err);
  }

  return [...staticPages, ...memberPages, ...eventPages, ...projectPages];
}
