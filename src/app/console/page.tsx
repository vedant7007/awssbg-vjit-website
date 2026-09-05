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
  CalendarClock,
  TriangleAlert,
} from "lucide-react";

import { getViewer } from "@/lib/auth/viewer";
import { getMemberById, listMembers } from "@/lib/firestore/members.server";
import { listTasksForAssignee, listAllTasks } from "@/lib/firestore/tasks";
import { listApplications } from "@/lib/firestore/applications";
import { listBoothPhotos } from "@/lib/firestore/booth";
import { routes } from "@/lib/constants/routes";
import { firstName } from "@/lib/utils/format";
import { safe } from "@/lib/utils/safe";
import type { Task } from "@/lib/types/task";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/tilt-card";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

const isOverdue = (t: Task) =>
  t.status !== "done" &&
  t.dueDate !== null &&
  new Date(t.dueDate).getTime() < Date.now();

/** "in 3 days" / "2 days late" — the thing you actually want to know. */
function dueLabel(iso: string): string {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days < -1) return `${Math.abs(days)} days late`;
  if (days === -1) return "1 day late";
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `in ${days} days`;
}

type Tile = {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stat?: string | null;
};

function TileCard({ tile }: { tile: Tile }) {
  return (
    <TiltCard className="glass-panel group overflow-hidden rounded-2xl" max={6}>
      <Link href={tile.href} className="tilt-layer block p-6">
        <div className="flex items-center justify-between">
          <span
            className="grid size-11 place-items-center rounded-xl"
            style={{
              background: `color-mix(in oklab, ${tile.color} 16%, transparent)`,
              color: tile.color,
              boxShadow: `0 0 0 1px color-mix(in oklab, ${tile.color} 22%, transparent)`,
            }}
          >
            <tile.icon className="size-5" />
          </span>
          <ArrowUpRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <h3 className="font-display mt-4 text-lg font-semibold">
          {tile.title}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          {tile.description}
        </p>
        {tile.stat ? (
          <span
            className="mt-3 inline-block rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold"
            style={{
              background: `color-mix(in oklab, ${tile.color} 14%, transparent)`,
              color: tile.color,
            }}
          >
            {tile.stat}
          </span>
        ) : null}
      </Link>
    </TiltCard>
  );
}

function Stat({
  label,
  value,
  color,
  hint,
}: {
  label: string;
  value: number;
  color: string;
  hint?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
          aria-hidden
        />
        <span className="text-muted-foreground font-mono text-[0.68rem] tracking-[0.12em] uppercase">
          {label}
        </span>
      </div>
      <div
        className="font-display mt-2 text-3xl font-bold tabular-nums sm:text-4xl"
        style={{ color }}
      >
        {value}
      </div>
      {hint ? (
        <p className="text-muted-foreground/80 mt-0.5 text-xs">{hint}</p>
      ) : null}
    </div>
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
  const doing = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const mineOverdue = tasks.filter(isOverdue);

  // The three things due soonest — the actual "what should I do now".
  const upNext = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (a.dueDate === b.dueDate) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 3);

  const personalTiles: Tile[] = [
    {
      href: routes.consoleTasks,
      title: "Tasks",
      description: isAdmin
        ? "Your work, your teams, and every board."
        : "Your assigned work and progress.",
      icon: ListChecks,
      color: "#FF9900",
      stat: open > 0 ? `${open} open` : null,
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

  let manageTiles: Tile[] = [];
  let teamOverdue = 0;
  if (isAdmin) {
    const [allTasks, members, apps, photos] = await Promise.all([
      safe(listAllTasks(), [], "console:home-tasks"),
      safe(listMembers(), [], "console:home-members"),
      safe(listApplications(), [], "console:home-apps"),
      safe(listBoothPhotos(), [], "console:home-photos"),
    ]);
    teamOverdue = allTasks.filter(isOverdue).length;

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
        description: "Manage the projects shown on profiles.",
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
  }

  return (
    <PageShell
      eyebrow={isAdmin ? "Control room" : "Your space"}
      title={`Welcome, ${name}`}
      description={
        isAdmin
          ? "Your work and everything behind AWS SBG VJIT, in one place."
          : "Your tasks, progress, and profile — all in one place."
      }
    >
      <div className="space-y-10">
        {/* Anything late gets said first, plainly. */}
        {mineOverdue.length > 0 ? (
          <Link
            href={routes.consoleTasks}
            className="border-destructive/30 bg-destructive/[0.07] hover:border-destructive/50 flex items-center gap-3 rounded-2xl border p-4 transition-colors"
          >
            <TriangleAlert className="text-destructive size-5 shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">
                {mineOverdue.length} of your tasks{" "}
                {mineOverdue.length === 1 ? "is" : "are"} overdue
              </span>
              <span className="text-muted-foreground">
                {" "}
                — {mineOverdue[0]!.title}
                {mineOverdue.length > 1
                  ? ` +${mineOverdue.length - 1} more`
                  : ""}
              </span>
            </p>
            <ArrowUpRight className="text-muted-foreground ml-auto size-4 shrink-0" />
          </Link>
        ) : null}

        {!member ? (
          <div className="glass-panel flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
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

        {/* At-a-glance numbers. */}
        {tasks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Stat label="Open" value={open} color="#FF9900" />
            <Stat label="In progress" value={doing} color="#43B4FF" />
            <Stat label="Done" value={done} color="#2EE6A0" />
            <Stat
              label="Overdue"
              value={mineOverdue.length}
              color={mineOverdue.length > 0 ? "#ef4444" : "#8b93a1"}
              {...(isAdmin && teamOverdue > 0
                ? { hint: `${teamOverdue} across all teams` }
                : {})}
            />
          </div>
        ) : null}

        {/* Up next — the shortlist, not the whole board. */}
        {upNext.length > 0 ? (
          <section>
            <h2 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4" />
              Up next
            </h2>
            <div className="glass-panel divide-border/60 divide-y overflow-hidden rounded-2xl">
              {upNext.map((t) => (
                <Link
                  key={t.id}
                  href={routes.consoleTasks}
                  className="hover:bg-foreground/[0.03] flex items-center gap-3 px-4 py-3 transition-colors"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      background:
                        t.status === "in_progress" ? "#FF9900" : "#8b93a1",
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {t.title}
                  </span>
                  {t.progress > 0 ? (
                    <span className="text-muted-foreground hidden font-mono text-xs tabular-nums sm:inline">
                      {t.progress}%
                    </span>
                  ) : null}
                  {t.dueDate ? (
                    <span
                      className={
                        isOverdue(t)
                          ? "text-destructive font-mono text-xs font-semibold"
                          : "text-muted-foreground font-mono text-xs"
                      }
                    >
                      {dueLabel(t.dueDate)}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
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
