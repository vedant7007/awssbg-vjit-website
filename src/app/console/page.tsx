import type { Metadata } from "next";
import Link from "next/link";
import {
  UserRoundPen,
  Settings,
  ListChecks,
  ShieldCheck,
  ArrowUpRight,
  CircleAlert,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/server";
import { getMemberById } from "@/lib/firestore/members.server";
import { listTasksForAssignee } from "@/lib/firestore/tasks";
import { routes } from "@/lib/constants/routes";
import { firstName } from "@/lib/utils/format";
import { safe } from "@/lib/utils/safe";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const user = await getCurrentUser();
  const name = user?.name ? firstName(user.name) : "there";
  const uid = user?.uid;

  const member = uid
    ? await safe(getMemberById(uid), null, "console:member")
    : null;
  const tasks = uid
    ? await safe(listTasksForAssignee(uid), [], "console:tasks")
    : [];

  const open = tasks.filter((t) => t.status !== "done").length;
  const done = tasks.filter((t) => t.status === "done").length;

  const tiles = [
    {
      href: routes.consoleTasks,
      title: "Tasks",
      description: "Your assigned work and team board.",
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
    ...(user?.admin
      ? [
          {
            href: routes.admin,
            title: "Admin",
            description: "Members, events, tasks, and applications.",
            icon: ShieldCheck,
            color: "#2EE6A0",
          },
        ]
      : []),
  ];

  return (
    <PageShell
      eyebrow="Your space"
      title={`Welcome, ${name}`}
      description="Your tasks and profile, all in one place."
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
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
