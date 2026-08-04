import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { listAllTasks } from "@/lib/firestore/tasks";
import { listMembers } from "@/lib/firestore/members.server";
import type { Task } from "@/lib/types/task";
import { PageShell } from "@/components/layout/PageShell";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import {
  AssignTaskForm,
  type AssignableMember,
} from "@/components/tasks/AssignTaskForm";

export const metadata: Metadata = { title: "Tasks | Admin" };
export const dynamic = "force-dynamic";

function isOverdue(t: Task): boolean {
  return (
    t.status !== "done" &&
    t.dueDate !== null &&
    new Date(t.dueDate).getTime() < Date.now()
  );
}

export default async function AdminTasksPage() {
  const tasks = await safe(listAllTasks(), [], "admin:tasks");
  const members = await safe(listMembers(), [], "admin:task-members");

  const assignable: AssignableMember[] = members.map((m) => ({
    uid: m.id,
    name: m.displayName,
    team: m.team,
  }));

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter(isOverdue).length,
  };

  // Per-team rollup, sorted by open (non-done) count.
  const teams = new Map<string, { total: number; done: number }>();
  for (const t of tasks) {
    const key = t.team ?? "Unassigned";
    const row = teams.get(key) ?? { total: 0, done: 0 };
    row.total += 1;
    if (t.status === "done") row.done += 1;
    teams.set(key, row);
  }
  const teamRows = [...teams.entries()].sort(
    (a, b) => b[1].total - b[1].done - (a[1].total - a[1].done),
  );

  return (
    <PageShell
      eyebrow="Control room"
      title="Tasks"
      description="Every team's tasks, plus assignment and a status rollup."
    >
      <div className="space-y-12">
        <section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Total" value={counts.total} />
            <Stat label="To do" value={counts.todo} />
            <Stat label="In progress" value={counts.in_progress} />
            <Stat label="Done" value={counts.done} />
            <Stat label="Overdue" value={counts.overdue} danger />
          </div>

          {teamRows.length > 0 ? (
            <div className="mt-4 overflow-x-auto rounded-sm border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Team</th>
                    <th className="px-4 py-2 text-right font-medium">Done</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRows.map(([team, row]) => (
                    <tr key={team} className="border-t">
                      <td className="px-4 py-2">{team}</td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {row.done}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section>
          <h2 className="font-display mb-4 text-xl font-semibold">
            Assign a task
          </h2>
          <AssignTaskForm members={assignable} />
        </section>

        <section>
          <h2 className="font-display mb-4 text-xl font-semibold">All tasks</h2>
          <TaskBoard tasks={tasks} canManage emptyLabel="No tasks yet." />
        </section>
      </div>
    </PageShell>
  );
}

function Stat({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="bg-card rounded-sm border p-4">
      <div
        className={`font-display text-3xl font-bold tabular-nums ${
          danger && value > 0 ? "text-destructive" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-muted-foreground mt-1 font-mono text-xs tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
}
