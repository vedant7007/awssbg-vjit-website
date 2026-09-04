import type { Metadata } from "next";
import Link from "next/link";
import {
  UserRoundPen,
  Settings,
  ListChecks,
  ArrowUpRight,
  CircleAlert,
  Users,
  Inbox,
  CalendarDays,
  FolderGit2,
  Map,
  Camera,
  ScanLine,
} from "lucide-react";

import { getViewer } from "@/lib/auth/viewer";
import { getMemberById } from "@/lib/firestore/members.server";
import { listMembers } from "@/lib/firestore/members.server";
import { listTasksForAssignee, listAllTasks } from "@/lib/firestore/tasks";
import { listApplications } from "@/lib/firestore/applications";
import { listBoothPhotos } from "@/lib/firestore/booth";
import { routes } from "@/lib/constants/routes";
import { firstName } from "@/lib/utils/format";
import { safe } from "@/lib/utils/safe";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

type Tile = {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stat?: string | null;
  alert?: string | null;
};

function TileCard({ tile }: { tile: Tile }) {
  return (
    <Link
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
      <h2 className="font-display mt-4 text-lg font-semibold">{tile.title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{tile.description}</p>
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
  );
}

export default async function ConsolePage() {
  const viewer = await getViewer();
  const name = viewer?.name ? firstName(viewer.name) : "there";
  const uid = viewer?.uid;
  const isAdmin = viewer?.isAdmin ?? false;

  const member = uid
    ? await safe(getMemberById(uid), null, "console:member")
    : null;
  const tasks = uid
    ? await safe(listTasksForAssignee(uid), [], "console:tasks")
    : [];

  const open = tasks.filter((t) => t.status !== "done").length;
  const done = tasks.filter((t) => t.status === "done").length;

  // Personal tiles — everyone.
  const personalTiles: Tile[] = [
    {
      href: routes.consoleTasks,
      title: "Tasks",
      description: isAdmin
        ? "Your work, your teams, and every team's board."
        : "Your assigned work and progress.",
      icon: ListChecks,
      color: "#FF9900",
    },
    {
      href: routes.consoleProfile,
      title: "Profile",
      description: "Your public profile, skills, and socials.",
      icon: UserRoundPen,
      color: "#43B4FF",
    },
    {
      href: routes.consoleSettings,
      title: "Settings",
      description: "Password, visibility, and sign out.",
      icon: Settings,
      color: "#AD5CFF",
    },
  ];

  // Management tiles + live counts — admins only, in the same space.
  let manageTiles: Tile[] = [];
  if (isAdmin) {
    const [allTasks, members, apps, photos] = await Promise.all([
      safe(listAllTasks(), [], "console:home-tasks"),
      safe(listMembers(), [], "console:home-members"),
      safe(listApplications(), [], "console:home-apps"),
      safe(listBoothPhotos(), [], "console:home-photos"),
    ]);
    const overdue = allTasks.filter(
      (t) =>
        t.status !== "done" &&
        t.dueDate !== null &&
        new Date(t.dueDate).getTime() < Date.now(),
    ).length;

    manageTiles = [
      {
        href: routes.adminMembers,
        title: "Members",
        description: "Add, edit, and place people on teams.",
        icon: Users,
        color: "#43B4FF",
        stat: `${members.length} on the team`,
      },
      {
        href: routes.adminApplications,
        title: "Applications",
        description: "Community join-form submissions.",
        icon: Inbox,
        color: "#2EE6A0",
        stat: `${apps.length} received`,
      },
      {
        href: routes.adminBooth,
        title: "Photo booth",
        description: "Moderate the live photo globe.",
        icon: Camera,
        color: "#FF9900",
        stat: `${photos.length} photos`,
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
        href: routes.adminCheckin,
        title: "Check-in",
        description: "Scan tickets to mark attendance.",
        icon: ScanLine,
        color: "#43B4FF",
      },
    ];
    // Surface overdue right on the Tasks tile at the top.
    personalTiles[0]!.stat = `${open} open`;
    if (overdue > 0) personalTiles[0]!.alert = `${overdue} overdue team-wide`;
  }

  return (
    <PageShell
      eyebrow={isAdmin ? "Control room" : "Your space"}
      title={`Welcome, ${name}`}
      description={
        isAdmin
          ? "Your work and everything behind AWS SBG VJIT, all in one place."
          : "Your tasks and profile, all in one place."
      }
    >
      <div className="space-y-10">
        {!member ? (
          <div className="border-orange/30 bg-orange/5 flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CircleAlert className="text-orange mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-display font-semibold">
                  Finish setting up your profile
                </p>
                <p className="text-muted-foreground text-sm">
                  Add your details so leads can place you on a team.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 rounded-full">
              <Link href={routes.consoleProfile}>Complete profile</Link>
            </Button>
          </div>
        ) : null}

        {tasks.length > 0 ? (
          <Link
            href={routes.consoleTasks}
            className="group border-orange/25 from-orange/[0.07] block rounded-xl border bg-gradient-to-br to-transparent p-6 transition-colors"
          >
            <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
              Your tasks
            </p>
            <div className="mt-2 flex items-end gap-6">
              <span className="font-display text-orange text-4xl font-bold tabular-nums">
                {open}
                <span className="text-muted-foreground ml-2 text-base font-normal">
                  open
                </span>
              </span>
              <span className="text-muted-foreground font-display text-2xl font-semibold tabular-nums">
                {done}
                <span className="ml-1.5 text-sm font-normal">done</span>
              </span>
              <span className="text-orange ml-auto inline-flex items-center gap-1 text-sm font-medium">
                Open board
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </Link>
        ) : null}

        <section>
          {isAdmin ? (
            <h2 className="text-muted-foreground mb-4 text-sm font-semibold">
              Your space
            </h2>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {personalTiles.map((t) => (
              <TileCard key={t.href} tile={t} />
            ))}
          </div>
        </section>

        {isAdmin ? (
          <section>
            <h2 className="text-muted-foreground mb-4 text-sm font-semibold">
              Manage the club
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {manageTiles.map((t) => (
                <TileCard key={t.href} tile={t} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
