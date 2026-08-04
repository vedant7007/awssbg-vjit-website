"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, CalendarClock } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  type Task,
  type TaskStatus,
} from "@/lib/types/task";
import {
  setTaskStatusAction,
  deleteTaskAction,
} from "@/app/console/tasks/actions";
import { Button } from "@/components/ui/button";

function isOverdue(task: Task): boolean {
  return (
    task.status !== "done" &&
    task.dueDate !== null &&
    new Date(task.dueDate).getTime() < Date.now()
  );
}

function fmtDue(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

/**
 * A list of task cards. Everyone can move a task through its statuses (the
 * server re-checks who's allowed); `canManage` additionally shows delete.
 * `showAssignee` is off on the personal "My tasks" list.
 */
export function TaskBoard({
  tasks,
  canManage = false,
  showAssignee = true,
  emptyLabel = "No tasks yet.",
}: {
  tasks: Task[];
  canManage?: boolean;
  showAssignee?: boolean;
  emptyLabel?: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else router.refresh();
    });

  if (tasks.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {tasks.map((task) => {
        const overdue = isOverdue(task);
        return (
          <article
            key={task.id}
            className={cn(
              "bg-card rounded-sm border p-4",
              task.status === "done" && "opacity-70",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-medium",
                    task.status === "done" && "line-through",
                  )}
                >
                  {task.title}
                </h3>
                {task.description ? (
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {task.description}
                  </p>
                ) : null}
                <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
                  {showAssignee ? <span>→ {task.assigneeName}</span> : null}
                  {task.team ? <span>· {task.team}</span> : null}
                  {task.dueDate ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        overdue && "text-destructive font-semibold",
                      )}
                    >
                      <CalendarClock className="size-3" aria-hidden />
                      {overdue ? "Overdue " : "Due "}
                      {fmtDue(task.dueDate)}
                    </span>
                  ) : null}
                  <span>by {task.assignedByName}</span>
                </div>
              </div>
              {canManage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete task"
                  disabled={pending}
                  onClick={() => run(() => deleteTaskAction(task.id))}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>

            <div
              className="mt-3 flex flex-wrap gap-1.5"
              role="group"
              aria-label="Status"
            >
              {TASK_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending || s === task.status}
                  onClick={() => run(() => setTaskStatusAction(task.id, s))}
                  aria-pressed={s === task.status}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-default",
                    s === task.status
                      ? statusClasses(s)
                      : "border-border/70 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {TASK_STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function statusClasses(status: TaskStatus): string {
  if (status === "done")
    return "border-success/40 bg-success/15 text-success font-medium";
  if (status === "in_progress")
    return "border-orange/40 bg-orange/15 text-orange font-medium";
  return "border-foreground/30 bg-foreground/10 text-foreground font-medium";
}
