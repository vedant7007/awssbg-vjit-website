import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";
import { getViewer } from "@/lib/auth/viewer";
import { safe } from "@/lib/utils/safe";
import { listTasksForAssignee, listTasksForTeam } from "@/lib/firestore/tasks";
import { listMembers } from "@/lib/firestore/members.server";
import { PageShell } from "@/components/layout/PageShell";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import {
  AssignTaskForm,
  type AssignableMember,
} from "@/components/tasks/AssignTaskForm";

export const metadata: Metadata = { title: "Tasks | Console" };
export const dynamic = "force-dynamic";

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

  return (
    <PageShell
      eyebrow="Console"
      title="Tasks"
      description={
        showLead
          ? `Your work, and the ${viewer.team} team board.`
          : "Your work — drag each card across as you go."
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
            <section>
              <h2 className="font-display mb-4 text-xl font-semibold">
                {viewer.team} team board
              </h2>
              <KanbanBoard tasks={teamTasks} canManage />
            </section>
          </>
        ) : null}

        {viewer.isAdmin ? (
          <p className="text-muted-foreground text-sm">
            You&apos;re an admin —{" "}
            <Link href={routes.adminTasks} className="text-orange underline">
              open the full task dashboard
            </Link>
            .
          </p>
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
