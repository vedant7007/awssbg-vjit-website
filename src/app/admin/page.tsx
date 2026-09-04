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
import { safe } from "@/lib/utils/safe";
import { listAllTasks } from "@/lib/firestore/tasks";
import { listMembers } from "@/lib/firestore/members.server";
import { listApplications } from "@/lib/firestore/applications";
import { listBoothPhotos } from "@/lib/firestore/booth";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [tasks, members, apps, photos] = await Promise.all([
    safe(listAllTasks(), [], "admin:home-tasks"),
    safe(listMembers(), [], "admin:home-members"),
    safe(listApplications(), [], "admin:home-apps"),
    safe(listBoothPhotos(), [], "admin:home-photos"),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const overdue = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.dueDate !== null &&
      new Date(t.dueDate).getTime() < Date.now(),
  ).length;

  const tiles = [
    {
      href: routes.adminTasks,
      title: "Tasks",
      description: "Assign across teams and track progress.",
      icon: ListChecks,
      color: "#FF9900",
      stat: `${openTasks} open`,
      alert: overdue > 0 ? `${overdue} overdue` : null,
    },
    {
      href: routes.adminMembers,
      title: "Members",
      description: "Add, edit, and manage member profiles.",
      icon: Users,
      color: "#43B4FF",
      stat: `${members.length} on the team`,
      alert: null,
    },
    {
      href: routes.adminApplications,
      title: "Applications",
      description: "Community join-form submissions.",
      icon: Inbox,
      color: "#43B4FF",
      stat: `${apps.length} received`,
      alert: null,
    },
    {
      href: routes.adminBooth,
      title: "Photo booth",
      description: "Moderate the live photo globe.",
      icon: Camera,
      color: "#FF9900",
      stat: `${photos.length} photos`,
      alert: null,
    },
    {
      href: routes.adminEvents,
      title: "Events",
      description: "Create and manage events and registrations.",
      icon: CalendarDays,
      color: "#AD5CFF",
      stat: null,
      alert: null,
    },
    {
      href: routes.adminProjects,
      title: "Projects",
      description: "Manage the project entries shown on profiles.",
      icon: FolderGit2,
      color: "#2EE6A0",
      stat: null,
      alert: null,
    },
    {
      href: routes.adminRoadmap,
      title: "Roadmap",
      description: "Manage roadmap items and their status.",
      icon: Map,
      color: "#FF57EA",
      stat: null,
      alert: null,
    },
    {
      href: routes.adminCheckin,
      title: "Check-in",
      description: "Scan tickets to mark attendance.",
      icon: ScanLine,
      color: "#AD5CFF",
      stat: null,
      alert: null,
    },
  ];

  return (
    <PageShell
      eyebrow="Control room"
      title="Admin"
      description="Manage the people, tasks, and events behind AWS SBG VJIT."
    >
      <Container className="!px-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
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
              {tile.stat || tile.alert ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {tile.stat ? (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        background: `color-mix(in oklab, ${tile.color} 14%, transparent)`,
                        color: tile.color,
                      }}
                    >
                      {tile.stat}
                    </span>
                  ) : null}
                  {tile.alert ? (
                    <span className="text-destructive bg-destructive/10 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      {tile.alert}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </Container>
    </PageShell>
  );
}
