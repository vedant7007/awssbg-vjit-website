import type { Metadata } from "next";
import { Plus } from "lucide-react";

import { safe } from "@/lib/utils/safe";
import { listAllTasks } from "@/lib/firestore/tasks";
import { listMembers } from "@/lib/firestore/members.server";
import type { Task } from "@/lib/types/task";
import { PageShell } from "@/components/layout/PageShell";
import { TaskStats, type StatDef } from "@/components/tasks/TaskStats";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import {
  AssignTaskForm,
  type AssignableMember,
} from "@/components/tasks/AssignTaskForm";

export const metadata: Metadata = { title: "Tasks | Admin" };
export const dynamic = "force-dynamic";

const isOverdue = (t: Task) =>
  t.status !== "done" &&
  t.dueDate !== null &&
  new Date(t.dueDate).getTime() < Date.now();

export default async function AdminTasksPage() {
  const tasks = await safe(listAllTasks(), [], "admin:tasks");
  const members = await safe(listMembers(), [], "admin:task-members");

  const assignable: AssignableMember[] = members.map((m) => ({
    uid: m.id,
    name: m.displayName,
    team: m.team,
  }));

  const stats: StatDef[] = [
    { label: "Total", value: tasks.length, color: "#43B4FF" },
    {
      label: "To do",
      value: tasks.filter((t) => t.status === "todo").length,
      color: "#8b93a1",
    },
    {
      label: "In progress",
      value: tasks.filter((t) => t.status === "in_progress").length,
      color: "#FF9900",
    },
    {
      label: "Done",
      value: tasks.filter((t) => t.status === "done").length,
      color: "#2EE6A0",
    },
    {
      label: "Overdue",
      value: tasks.filter(isOverdue).length,
      color: "#ef4444",
      danger: true,
    },
  ];

  return (
    <PageShell
      eyebrow="Control room"
      title="Tasks"
      description="Assign across teams, track progress, and keep an eye on what's overdue."
    >
      <div className="space-y-8">
        <TaskStats stats={stats} />

        <details className="group border-orange/30 bg-orange/[0.04] rounded-xl border">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium">
            <span className="bg-orange/15 text-orange grid size-7 place-items-center rounded-full transition-transform group-open:rotate-45">
              <Plus className="size-4" />
            </span>
            Assign a new task
          </summary>
          <div className="border-t p-5">
            <AssignTaskForm members={assignable} />
          </div>
        </details>

        <KanbanBoard tasks={tasks} canManage showTeamFilter />
      </div>
    </PageShell>
  );
}
