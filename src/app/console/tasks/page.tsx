import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { getViewer } from "@/lib/auth/viewer";
import { safe } from "@/lib/utils/safe";
import {
  listTasksForAssignee,
  listTasksForTeam,
  listAllTasks,
} from "@/lib/firestore/tasks";
import { listMembers } from "@/lib/firestore/members.server";
import type { Task } from "@/lib/types/task";
import { PageShell } from "@/components/layout/PageShell";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TeamProgress } from "@/components/tasks/TeamProgress";
import { TaskStats, type StatDef } from "@/components/tasks/TaskStats";
import {
  AssignTaskForm,
  type AssignableMember,
} from "@/components/tasks/AssignTaskForm";

export const metadata: Metadata = { title: "Tasks | Console" };
export const dynamic = "force-dynamic";

const isOverdue = (t: Task) =>
  t.status !== "done" &&
  t.dueDate !== null &&
  new Date(t.dueDate).getTime() < Date.now();

export default async function ConsoleTasksPage() {
  const viewer = await getViewer();
  if (!viewer) redirect(routes.signinNext(routes.consoleTasks));

  const myTasks = await safe(
    listTasksForAssignee(viewer.uid),
    [],
    "console:my-tasks",
  );

  const done = myTasks.filter((t) => t.status === "done").length;
  const pct = myTasks.length ? Math.round((done / myTasks.length) * 100) : 0;

  const showLead = viewer.isLead && !!viewer.team;
  const teamTasks = showLead
    ? await safe(listTasksForTeam(viewer.team!), [], "console:team-tasks")
    : [];
  const teamMembers: AssignableMember[] = showLead
    ? (await safe(listMembers(), [], "console:team-members"))
        .filter((m) => m.team === viewer.team)
        .map((m) => ({ uid: m.id, name: m.displayName, team: m.team }))
    : [];

  // Admins see every team's board and can assign to anyone — inline, in the
  // same page, so there is no separate "admin tasks".
  const allTasks = viewer.isAdmin
    ? await safe(listAllTasks(), [], "console:all-tasks")
    : [];
  const allMembers: AssignableMember[] = viewer.isAdmin
    ? (await safe(listMembers(), [], "console:all-members")).map((m) => ({
        uid: m.id,
        name: m.displayName,
        team: m.team,
      }))
    : [];

  const adminStats: StatDef[] = [
    { label: "Total", value: allTasks.length, color: "#43B4FF" },
    {
      label: "To do",
      value: allTasks.filter((t) => t.status === "todo").length,
      color: "#8b93a1",
    },
    {
      label: "In progress",
      value: allTasks.filter((t) => t.status === "in_progress").length,
      color: "#FF9900",
    },
    {
      label: "Done",
      value: allTasks.filter((t) => t.status === "done").length,
      color: "#2EE6A0",
    },
    {
      label: "Overdue",
      value: allTasks.filter(isOverdue).length,
      color: "#ef4444",
      danger: true,
    },
  ];

  return (
    <PageShell
      eyebrow="Console"
      title="Tasks"
      description={
        viewer.isAdmin
          ? "Your work, plus every team's progress in one board."
          : showLead
            ? `Your work, and the ${viewer.team} team board.`
            : "Your assigned work — open a card to post progress as you go."
      }
    >
      <div className="space-y-12">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-display text-xl font-semibold">My tasks</h2>
            <span className="text-muted-foreground font-mono text-xs">
              {done}/{myTasks.length} done
            </span>
          </div>
          {myTasks.length > 0 ? (
            <div className="bg-muted mb-6 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-success h-full rounded-full transition-[width] duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : null}
          <KanbanBoard tasks={myTasks} showAssignee={false} />
        </section>

        {showLead ? (
          <>
            <section>
              <h2 className="font-display mb-4 text-xl font-semibold">
                Assign to {viewer.team}
              </h2>
              <AssignTaskForm members={teamMembers} />
            </section>
            {teamTasks.length > 0 ? (
              <section>
                <h2 className="font-display mb-4 text-xl font-semibold">
                  Team progress
                </h2>
                <TeamProgress tasks={teamTasks} title={`${viewer.team} team`} />
              </section>
            ) : null}
            <section>
              <h2 className="font-display mb-4 text-xl font-semibold">
                {viewer.team} team board
              </h2>
              <KanbanBoard tasks={teamTasks} canManage />
            </section>
          </>
        ) : null}

        {viewer.isAdmin ? (
          <section className="space-y-6">
            <div className="border-t pt-8">
              <h2 className="font-display text-xl font-semibold">All teams</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Every task across the club — assign, track, and keep an eye on
                what&apos;s overdue.
              </p>
            </div>

            <TaskStats stats={adminStats} />

            {allTasks.length > 0 ? (
              <TeamProgress tasks={allTasks} title="Who's on what" />
            ) : null}

            <details className="group border-orange/30 bg-orange/[0.04] rounded-xl border">
              <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium">
                <span className="bg-orange/15 text-orange grid size-7 place-items-center rounded-full transition-transform group-open:rotate-45">
                  <Plus className="size-4" />
                </span>
                Assign a new task
              </summary>
              <div className="border-t p-5">
                <AssignTaskForm members={allMembers} />
              </div>
            </details>

            <KanbanBoard tasks={allTasks} canManage showTeamFilter />
          </section>
        ) : null}

        {!viewer.hasProfile ? (
          <p className="text-muted-foreground text-sm">
            Finish setting up your{" "}
            <Link
              href={routes.consoleProfile}
              className="text-orange underline"
            >
              profile
            </Link>{" "}
            so leads can assign you to a team.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
