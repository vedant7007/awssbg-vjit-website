import { routes } from "./routes";

export type NavLink = { label: string; href: string };

/** Primary navigation, in the order the site is meant to be read. */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: routes.home },
  { label: "Events", href: routes.events },
  { label: "Team", href: routes.team },
  { label: "Playground", href: routes.playground },
  { label: "Toolkit", href: routes.tools },
  { label: "Roadmaps", href: routes.roadmap },
];

/** Grouped links for the footer. */
export const FOOTER_EXPLORE: NavLink[] = [
  { label: "Events", href: routes.events },
  { label: "Team", href: routes.team },
  { label: "Playground", href: routes.playground },
  { label: "Toolkit", href: routes.tools },
  { label: "Roadmaps", href: routes.roadmap },
  { label: "About", href: routes.about },
];

/*
 * Real club channels go here once confirmed. Left as null so nothing renders a
 * dead link. TODO(Vedant): fill in the official AWS SBG VJIT handles.
 */
export const SOCIAL_LINKS: { label: string; href: string | null }[] = [
  { label: "LinkedIn", href: null },
  { label: "Instagram", href: null },
  { label: "GitHub", href: null },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Code of Conduct", href: "/code-of-conduct" },
];
