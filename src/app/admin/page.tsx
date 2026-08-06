import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  FolderGit2,
  Map,
  ScanLine,
  Inbox,
  ListChecks,
  Camera,
  ArrowUpRight,
} from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Admin" };

const TILES = [
  {
    href: routes.adminTasks,
    title: "Tasks",
    description: "Assign across teams and track status + overdue.",
    icon: ListChecks,
    color: "#FF9900",
  },
  {
    href: routes.adminMembers,
    title: "Members",
    description: "Add, edit, and manage member profiles.",
    icon: Users,
    color: "#43B4FF",
  },
  {
    href: routes.adminEvents,
    title: "Events",
    description: "Create and manage events and registrations.",
    icon: CalendarDays,
    color: "#AD5CFF",
  },
  {
    href: routes.adminProjects,
    title: "Projects",
    description: "Manage the project entries shown on profiles.",
    icon: FolderGit2,
    color: "#2EE6A0",
  },
  {
    href: routes.adminRoadmap,
    title: "Roadmap",
    description: "Manage roadmap items and their status.",
    icon: Map,
    color: "#FF57EA",
  },
  {
    href: routes.adminApplications,
    title: "Applications",
    description: "View community join-form submissions.",
    icon: Inbox,
    color: "#43B4FF",
  },
  {
    href: routes.adminBooth,
    title: "Photo booth",
    description: "Moderate the live orientation-day photo globe.",
    icon: Camera,
    color: "#FF9900",
  },
  {
    href: routes.adminCheckin,
    title: "Check-in",
    description: "Scan tickets to mark attendance at events.",
    icon: ScanLine,
    color: "#AD5CFF",
  },
];

export default function AdminHomePage() {
  return (
    <PageShell
      eyebrow="Control room"
      title="Admin"
      description="Manage the people, events, and projects behind AWS SBG VJIT."
    >
      <Container className="!px-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group bg-card relative overflow-hidden rounded-xl border p-6 transition-all hover:-translate-y-0.5"
              style={{
                borderColor: `color-mix(in oklab, ${tile.color} 22%, var(--border))`,
              }}
            >
              <div
                aria-hidden
                className="absolute -top-8 -right-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
                style={{ background: tile.color }}
              />
              <div className="flex items-center justify-between">
                <span
                  className="grid size-10 place-items-center rounded-lg"
                  style={{
                    background: `color-mix(in oklab, ${tile.color} 15%, transparent)`,
                    color: tile.color,
                  }}
                >
                  <tile.icon className="size-5" />
                </span>
                <ArrowUpRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <h2 className="font-display mt-4 text-lg font-semibold">
                {tile.title}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {tile.description}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
