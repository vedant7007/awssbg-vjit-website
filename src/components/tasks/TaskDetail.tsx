"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Loader2, UserRound, History, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { type Task, TASK_STATUS_LABEL } from "@/lib/types/task";
import { addTaskUpdateAction } from "@/app/console/tasks/actions";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.round((Date.now() - then) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

const STATUS_TINT: Record<string, string> = {
  todo: "#8b93a1",
  in_progress: "#FF9900",
  done: "#2EE6A0",
};

/** Detail + progress-update drawer for a single task. Controlled by its parent
 * through `task` (null = closed). Only the assignee or an admin can post
 * progress; everyone with access sees the running log. */
export function TaskDetail({
  task,
  onOpenChange,
  canEdit = false,
}: {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
  /** Only the assignee (or an admin) may post progress; everyone else reads. */
  canEdit?: boolean;
}) {
  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[90vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-lg">
        {task ? <Body key={task.id} task={task} canEdit={canEdit} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function Body({ task, canEdit }: { task: Task; canEdit: boolean }) {
  const router = useRouter();
  const [progress, setProgress] = React.useState(task.progress);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Keep the slider in sync when fresh server data arrives.
  React.useEffect(() => setProgress(task.progress), [task.progress]);

  const dirty = note.trim().length > 0 || progress !== task.progress;

  const post = () => {
    if (saving) return;
    setSaving(true);
    addTaskUpdateAction(task.id, { note: note.trim(), progress })
      .then((res) => {
        if (res.ok) {
          toast.success("Progress posted 🎯");
          setNote("");
          router.refresh();
        } else {
          toast.error(res.error ?? "Couldn't post that update.");
        }
      })
      .catch(() => toast.error("Couldn't post that update."))
      .finally(() => setSaving(false));
  };

  const tint = STATUS_TINT[task.status] ?? "#8b93a1";

  return (
    <div>
      <DialogHeader className="space-y-3 border-b p-5 text-left">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold"
            style={{ background: `${tint}22`, color: tint }}
          >
            {TASK_STATUS_LABEL[task.status]}
          </span>
          {task.team ? (
            <span className="text-muted-foreground font-mono text-[0.68rem] tracking-wide uppercase">
              {task.team}
            </span>
          ) : null}
        </div>
        <DialogTitle className="text-lg leading-snug">{task.title}</DialogTitle>
        {task.description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {task.description}
          </p>
        ) : null}
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.7rem]">
          <span className="inline-flex items-center gap-1">
            <UserRound className="size-3" /> {task.assigneeName}
          </span>
          {task.dueDate ? (
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
              })}
            </span>
          ) : null}
          <span>assigned by {task.assignedByName}</span>
        </div>
      </DialogHeader>

      {/* Progress — editable only by the assignee or an admin. */}
      <div className="space-y-4 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Progress</span>
            <span
              className="font-mono text-sm font-bold tabular-nums"
              style={{ color: tint }}
            >
              {progress}%
            </span>
          </div>
          {canEdit ? (
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--muted)] accent-[var(--orange)]"
              style={{
                background: `linear-gradient(to right, ${tint} ${progress}%, var(--muted) ${progress}%)`,
              }}
              aria-label="Progress percent"
            />
          ) : (
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${progress}%`, background: tint }}
              />
            </div>
          )}
        </div>

        {!canEdit ? (
          <p className="text-muted-foreground border-border/60 rounded-xl border border-dashed px-3 py-2.5 text-xs">
            Only {task.assigneeName.split(/\s+/)[0]} can post progress on this
            task. You can follow the updates below.
          </p>
        ) : (
          <div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you get done? (e.g. finished the poster draft, waiting on copy)"
              rows={3}
              maxLength={500}
              className="resize-none text-sm"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground text-[0.7rem]">
                {progress >= 100
                  ? "Marks this task done."
                  : progress > 0
                    ? "Marks this in progress."
                    : "Log where you're at."}
              </span>
              <Button
                size="sm"
                onClick={post}
                disabled={!dirty || saving}
                className="rounded-full"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Post update
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Log */}
      <div className="border-t p-5">
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
          <History className="size-3.5" />
          Activity
          <span className="font-mono">({task.updates.length})</span>
        </div>
        {task.updates.length === 0 ? (
          <p className="text-muted-foreground/70 text-sm">
            No updates yet — post the first one above.
          </p>
        ) : (
          <ol className="space-y-3">
            {task.updates.map((u, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-0.5 flex flex-col items-center">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: tint }}
                  />
                  {i < task.updates.length - 1 ? (
                    <span className="bg-border mt-1 w-px flex-1" />
                  ) : null}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{u.byName}</span>
                    <span className="text-muted-foreground font-mono text-[0.68rem]">
                      {u.progress}%
                    </span>
                    <span className="text-muted-foreground/70 ml-auto text-[0.68rem]">
                      {timeAgo(u.at)}
                    </span>
                  </div>
                  {u.note ? (
                    <p
                      className={cn(
                        "text-muted-foreground mt-0.5 text-sm leading-relaxed",
                      )}
                    >
                      {u.note}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
