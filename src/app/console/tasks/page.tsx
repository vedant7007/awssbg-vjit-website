import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";
import { getViewer } from "@/lib/auth/viewer";
import { safe } from "@/lib/utils/safe";
import { listTasksForAssignee, listTasksForTeam } from "@/lib/firestore/tasks";
import { listMembers } from "@/lib/firestore/members.server";
import { PageShell } from "@/components/layout/PageShell";
import { TaskBoard } from "@/components/tasks/TaskBoard";
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
          ? `Your tasks, and everything on the ${viewer.team} team board.`
          : "Tasks assigned to you. Move each one through its stages as you go."
      }
    >
      <div className="space-y-12">
        <section>
          <h2 className="font-display mb-4 text-xl font-semibold">My tasks</h2>
          <TaskBoard
            tasks={myTasks}
            showAssignee={false}
            emptyLabel="Nothing assigned to you right now."
          />
        </section>

        {showLead ? (
          <>
            <section>
              <h2 className="font-display mb-4 text-xl font-semibold">
                Assign a task
              </h2>
              <AssignTaskForm members={teamMembers} />
            </section>
            <section>
              <h2 className="font-display mb-4 text-xl font-semibold">
                {viewer.team} team board
              </h2>
              <TaskBoard
                tasks={teamTasks}
                canManage
                emptyLabel="No tasks on the team board yet."
              />
            </section>
          </>
        ) : null}

        {viewer.isAdmin ? (
          <p className="text-muted-foreground text-sm">
            You&apos;re an admin —{" "}
            <Link href={routes.adminTasks} className="text-orange underline">
              open the full task dashboard
            </Link>{" "}
            to assign across every team and see reports.
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
