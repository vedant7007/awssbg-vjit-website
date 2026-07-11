import { NextResponse } from "next/server";

import { listMembers } from "@/lib/firestore/members.server";
import { listEvents } from "@/lib/firestore/events";
import { listProjects } from "@/lib/firestore/projects";
import {
  type SearchMember,
  type SearchEvent,
  type SearchProject,
} from "@/lib/search";

const FALLBACK_MEMBERS = [
  {
    type: "member" as const,
    id: "lead-1",
    title: "Alex Carter",
    subtitle: "@alexcarter",
    url: "/m/alexcarter",
    meta: "President",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80",
    team: "Core",
  },
  {
    type: "member" as const,
    id: "lead-2",
    title: "Jordan Smith",
    subtitle: "@jordansmith",
    url: "/m/jordansmith",
    meta: "Vice President",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80",
    team: "Core",
  },
  {
    type: "member" as const,
    id: "lead-3",
    title: "Taylor Reed",
    subtitle: "@taylorreed",
    url: "/m/taylorreed",
    meta: "Tech Lead",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80",
    team: "Technical",
  },
  {
    type: "member" as const,
    id: "lead-4",
    title: "Morgan Hayes",
    subtitle: "@morganhayes",
    url: "/m/morganhayes",
    meta: "Design Lead",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80",
    team: "Design",
  },
  {
    type: "member" as const,
    id: "lead-5",
    title: "Casey Brooks",
    subtitle: "@caseybrooks",
    url: "/m/caseybrooks",
    meta: "Events Lead",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&q=80",
    team: "Events",
  },
  {
    type: "member" as const,
    id: "lead-6",
    title: "Riley Green",
    subtitle: "@rileygreen",
    url: "/m/rileygreen",
    meta: "Marketing Lead",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80",
    team: "Marketing",
  },
];

const FALLBACK_EVENTS = [
  {
    type: "event" as const,
    id: "event-1",
    title: "Cloud Jumpstart Hackathon",
    subtitle: "Overnight cloud sprint to build and deploy serverless apps.",
    url: "/events/cloud-jumpstart-2026",
    meta: "upcoming",
    category: "hackathon",
    startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    type: "event" as const,
    id: "event-2",
    title: "AWS Cloud Practitioner Camp",
    subtitle: "Get certified in 4 weeks. Guided curriculum and peer study.",
    url: "/events/practitioner-camp-2026",
    meta: "live",
    category: "workshop",
    startAt: new Date().toISOString(),
  },
  {
    type: "event" as const,
    id: "event-3",
    title: "Serverless Workshop",
    subtitle: "Learn Lambda, API Gateway, and DynamoDB by doing.",
    url: "/events/serverless-workshop-2025",
    meta: "past",
    category: "workshop",
    startAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const FALLBACK_PROJECTS = [
  {
    type: "project" as const,
    id: "project-1",
    title: "VJIT Cloud Portal",
    subtitle:
      "Centralized serverless student hub built using Next.js, API Gateway, and Lambda.",
    url: "/projects/vjit-cloud-portal",
    meta: null,
    stack: ["Next.js", "Lambda", "DynamoDB"],
    featured: true,
  },
  {
    type: "project" as const,
    id: "project-2",
    title: "AWS Cost Optimizer",
    subtitle:
      "Automated tool that scans and stops idle EC2 and RDS instances on VJIT sandbox.",
    url: "/projects/aws-cost-optimizer",
    meta: null,
    stack: ["Python", "AWS Lambda", "CloudWatch"],
    featured: true,
  },
  {
    type: "project" as const,
    id: "project-3",
    title: "Serverless Shortener",
    subtitle:
      "A sub-millisecond URL shortener powered by AWS CloudFront and DynamoDB Global Tables.",
    url: "/projects/serverless-shortener",
    meta: null,
    stack: ["CloudFront", "DynamoDB", "S3"],
    featured: false,
  },
];

/**
 * GET /api/search
 *
 * Returns lightweight projections of Members, Events, and Projects for the
 * client-side Command Palette. Only public data is exposed. Called lazily
 * once on the first palette open; the client caches the response in memory.
 */
export async function GET() {
  let members: SearchMember[] = [];
  try {
    const rawMembers = await listMembers();
    members = rawMembers
      .filter((m) => m.isPublic)
      .map((m) => ({
        type: "member" as const,
        id: m.id,
        title: m.displayName,
        subtitle: `@${m.username}`,
        url: `/m/${m.username}`,
        meta: m.role,
        avatarUrl: m.photoURL,
        team: m.team,
      }));
    if (members.length === 0) {
      members = FALLBACK_MEMBERS;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      "[/api/search] Firestore members read failed, using fallback:",
      err,
    );
    members = FALLBACK_MEMBERS;
  }

  let events: SearchEvent[] = [];
  try {
    const rawEvents = await listEvents();
    events = rawEvents.map((e) => ({
      type: "event" as const,
      id: e.id,
      title: e.title,
      subtitle: e.tagline,
      url: `/events/${e.slug}`,
      meta: e.status,
      category: e.category,
      startAt: e.startAt
        ? typeof e.startAt.toDate === "function"
          ? e.startAt.toDate().toISOString()
          : new Date(e.startAt as unknown as string).toISOString()
        : null,
    }));
    if (events.length === 0) {
      events = FALLBACK_EVENTS;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      "[/api/search] Firestore events read failed, using fallback:",
      err,
    );
    events = FALLBACK_EVENTS;
  }

  let projects: SearchProject[] = [];
  try {
    const rawProjects = await listProjects();
    projects = rawProjects.map((p) => ({
      type: "project" as const,
      id: p.id,
      title: p.title,
      subtitle: p.tagline,
      url: `/projects/${p.slug}`,
      meta: null,
      stack: p.stack || [],
      featured: p.featured || false,
    }));
    if (projects.length === 0) {
      projects = FALLBACK_PROJECTS;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      "[/api/search] Firestore projects read failed, using fallback:",
      err,
    );
    projects = FALLBACK_PROJECTS;
  }

  return NextResponse.json(
    { members, events, projects },
    {
      headers: {
        // Cache for 60 s at the CDN edge; stale-while-revalidate for 10 min.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}
