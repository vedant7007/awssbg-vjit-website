import { Users } from "lucide-react";

import { type Task } from "@/lib/types/task";
import { cn } from "@/lib/utils/cn";

type Agg = {
  uid: string;
  name: string;
  team: string | null;
  total: number;
  done: number;
  active: number;
  overdue: number;
  progress: number;
  lastAt: string | null;
};

const isOverdue = (t: Task) =>
  t.status !== "done" &&
  t.dueDate !== null &&
  new Date(t.dueDate).getTime() < Date.now();

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || "?";
}

function lastActive(iso: string | null): string {
  if (!iso) return "";
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (Number.isNaN(d)) return "";
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function aggregate(tasks: Task[]): Agg[] {
  const map = new Map<string, Agg>();
  for (const t of tasks) {
    const cur = map.get(t.assigneeUid) ?? {
      uid: t.assigneeUid,
      name: t.assigneeName || "Unknown",
      team: t.team,
      total: 0,
      done: 0,
      active: 0,
      overdue: 0,
      progress: 0,
      lastAt: null,
    };
    cur.total += 1;
    if (t.status === "done") cur.done += 1;
    else cur.active += 1;
    if (isOverdue(t)) cur.overdue += 1;
    cur.progress += t.progress;
    if ((t.updatedAt ?? "") > (cur.lastAt ?? "")) cur.lastAt = t.updatedAt;
    map.set(t.assigneeUid, cur);
  }
  return [...map.values()]
    .map((a) => ({ ...a, progress: Math.round(a.progress / a.total) }))
    .sort(
      (a, b) =>
        b.overdue - a.overdue || a.progress - b.progress || b.total - a.total,
    );
}

/** A per-member tracking board: how far along everyone is, what's overdue, and
 * when they last moved something. Feed it already-scoped tasks (a team's, or
 * all of them). Read-only — the source of truth for "keep track of the team". */
export function TeamProgress({
  tasks,
  title = "Team progress",
}: {
  tasks: Task[];
  title?: string;
}) {
  const rows = aggregate(tasks);
  if (rows.length === 0) return null;

  return (
    <div>
      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-semibold">
        <Users className="size-4" />
        {title}
        <span className="font-mono text-xs">({rows.length})</span>
      </div>
      <div className="glass-panel divide-border/60 divide-y overflow-hidden rounded-2xl">
        {rows.map((r) => (
          <div
            key={r.uid}
            className="flex items-center gap-3 px-4 py-3 sm:gap-4"
          >
            <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold">
              {initials(r.name)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{r.name}</span>
                {r.overdue > 0 ? (
                  <span className="text-destructive bg-destructive/10 rounded-full px-1.5 py-0.5 text-[0.62rem] font-semibold">
                    {r.overdue} overdue
                  </span>
                ) : null}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      r.progress >= 100 ? "bg-success" : "bg-orange",
                    )}
                    style={{ width: `${Math.max(r.progress, 3)}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-9 text-right font-mono text-[0.7rem] tabular-nums">
                  {r.progress}%
                </span>
              </div>
            </div>

            <div className="text-muted-foreground hidden shrink-0 text-right font-mono text-[0.7rem] sm:block">
              <div className="tabular-nums">
                {r.done}/{r.total} done
              </div>
              {r.lastAt ? (
                <div className="text-muted-foreground/70">
                  {lastActive(r.lastAt)}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
