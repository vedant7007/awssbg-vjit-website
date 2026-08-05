"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { toast } from "sonner";
import {
  Trash2,
  CalendarClock,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { type Task, type TaskStatus } from "@/lib/types/task";
import {
  setTaskStatusAction,
  deleteTaskAction,
} from "@/app/console/tasks/actions";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "To do", color: "#8b93a1" },
  { status: "in_progress", label: "In progress", color: "#FF9900" },
  { status: "done", label: "Done", color: "#2EE6A0" },
];

function overdue(t: Task): boolean {
  return (
    t.status !== "done" &&
    t.dueDate !== null &&
    new Date(t.dueDate).getTime() < Date.now()
  );
}
function fmtDue(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

/**
 * A three-column task board. Moves are optimistic — the card jumps columns and
 * framer animates it there instantly, then the server action persists (and
 * reverts on failure). `showTeamFilter` adds chips to scope by team.
 */
export function KanbanBoard({
  tasks,
  canManage = false,
  showAssignee = true,
  showTeamFilter = false,
}: {
  tasks: Task[];
  canManage?: boolean;
  showAssignee?: boolean;
  showTeamFilter?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<Task[]>(tasks);
  const [team, setTeam] = React.useState<string>("all");
  const [, startTransition] = React.useTransition();

  // Re-sync when the server sends fresh data (after a revalidate/refresh).
  React.useEffect(() => setItems(tasks), [tasks]);

  const teams = React.useMemo(
    () =>
      Array.from(new Set(tasks.map((t) => t.team).filter(Boolean))) as string[],
    [tasks],
  );

  const visible = team === "all" ? items : items.filter((t) => t.team === team);

  const move = (task: Task, status: TaskStatus) => {
    const prev = items;
    setItems((cur) =>
      cur.map((t) => (t.id === task.id ? { ...t, status } : t)),
    );
    startTransition(async () => {
      const res = await setTaskStatusAction(task.id, status);
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Couldn't move that task.");
      } else {
        router.refresh();
      }
    });
  };

  const remove = (task: Task) => {
    const prev = items;
    setItems((cur) => cur.filter((t) => t.id !== task.id));
    startTransition(async () => {
      const res = await deleteTaskAction(task.id);
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Couldn't delete that task.");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div>
      {showTeamFilter && teams.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {["all", ...teams].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTeam(t)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                team === t
                  ? "border-orange bg-orange/15 text-orange"
                  : "border-border/70 text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "all" ? "All teams" : t}
            </button>
          ))}
        </div>
      ) : null}

      <LayoutGroup>
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colItems = visible.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-muted/30 rounded-xl border p-3"
              >
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: col.color }}
                    aria-hidden
                  />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-muted-foreground ml-auto font-mono text-xs">
                    {colItems.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <AnimatePresence mode="popLayout">
                    {colItems.map((task) => (
                      <motion.article
                        key={task.id}
                        layout
                        layoutId={task.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 38,
                        }}
                        className="bg-card rounded-lg border p-3.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm leading-snug font-medium",
                              task.status === "done" &&
                                "text-muted-foreground line-through",
                            )}
                          >
                            {task.title}
                          </h4>
                          {canManage ? (
                            <button
                              type="button"
                              aria-label="Delete task"
                              onClick={() => remove(task)}
                              className="text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          ) : null}
                        </div>

                        {task.description ? (
                          <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                            {task.description}
                          </p>
                        ) : null}

                        <div className="text-muted-foreground mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.68rem]">
                          {showAssignee ? (
                            <span>{task.assigneeName}</span>
                          ) : null}
                          {task.dueDate ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1",
                                overdue(task) &&
                                  "text-destructive font-semibold",
                              )}
                            >
                              <CalendarClock className="size-3" aria-hidden />
                              {fmtDue(task.dueDate)}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {moves(task.status).map((m) => (
                            <button
                              key={m.to}
                              type="button"
                              onClick={() => move(task, m.to)}
                              className="border-border/70 hover:border-foreground/40 hover:text-foreground text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors"
                            >
                              {m.icon}
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>

                  {colItems.length === 0 ? (
                    <p className="text-muted-foreground/60 px-1 py-6 text-center text-xs">
                      Nothing here
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

/** Contextual move buttons for a card's current status. */
function moves(
  status: TaskStatus,
): { to: TaskStatus; label: string; icon: React.ReactNode }[] {
  const start = {
    to: "in_progress" as const,
    label: "Start",
    icon: <ArrowRight className="size-3" />,
  };
  const back = {
    to: "todo" as const,
    label: "Back",
    icon: <ArrowLeft className="size-3" />,
  };
  const done = {
    to: "done" as const,
    label: "Done",
    icon: <Check className="size-3" />,
  };
  const reopen = {
    to: "todo" as const,
    label: "Reopen",
    icon: <RotateCcw className="size-3" />,
  };
  if (status === "todo") return [start];
  if (status === "in_progress") return [back, done];
  return [reopen];
}
