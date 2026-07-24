/** Centralized route strings. Import from here instead of hardcoding paths. */
export const routes = {
  home: "/",
  about: "/about",
  services: "/services",
  events: "/events",
  event: (slug: string) => `/events/${slug}`,
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  team: "/team",
  teamAll: "/team/all",
  teamPage: (key: string) => `/team/${key}`,
  members: "/members",
  member: (username: string) => `/m/${username.toLowerCase()}`,
  roadmap: "/roadmap",
  playground: "/playground",
  tools: "/tools",
  join: "/join",

  signin: "/signin",
  signinNext: (next: string) => `/signin?next=${encodeURIComponent(next)}`,

  console: "/console",
  consoleProfile: "/console/profile",
  consoleMyEvents: "/console/my-events",
  consoleSettings: "/console/settings",

  admin: "/admin",
  adminMembers: "/admin/members",
  adminMemberNew: "/admin/members/new",
  adminMemberEdit: (id: string) => `/admin/members/${id}/edit`,
  adminEvents: "/admin/events",
  adminEventNew: "/admin/events/new",
  adminEventEdit: (id: string) => `/admin/events/${id}/edit`,
  adminProjects: "/admin/projects",
  adminProjectNew: "/admin/projects/new",
  adminProjectEdit: (id: string) => `/admin/projects/${id}/edit`,
  adminRoadmap: "/admin/roadmap",
  adminRoadmapNew: "/admin/roadmap/new",
  adminRoadmapEdit: (id: string) => `/admin/roadmap/${id}/edit`,
  adminCheckin: "/admin/checkin",
} as const;

export const PROTECTED_PREFIXES = ["/console", "/admin"] as const;
export const ADMIN_PREFIX = "/admin";
