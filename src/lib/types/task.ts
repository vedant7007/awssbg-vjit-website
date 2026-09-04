export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

/** A single progress note the assignee (or a lead/admin) posts on a task. */
export type TaskUpdate = {
  note: string;
  progress: number; // 0–100 at the time of the note
  byUid: string;
  byName: string;
  at: string | null; // ISO
};

/** A task, serialized (Timestamps → ISO strings) for client components. */
export type Task = {
  id: string;
  title: string;
  description: string;
  assigneeUid: string;
  assigneeName: string;
  team: string | null;
  assignedByUid: string;
  assignedByName: string;
  status: TaskStatus;
  progress: number; // 0–100
  updates: TaskUpdate[]; // newest first
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

/** Progress a status implies when it's set from a quick move (not a note). */
export function progressForStatus(status: TaskStatus): number | null {
  if (status === "done") return 100;
  if (status === "todo") return 0;
  return null; // in_progress leaves the current progress alone
}

/** Status a progress value implies when posting a note. */
export function statusForProgress(
  progress: number,
  current: TaskStatus,
): TaskStatus {
  if (progress >= 100) return "done";
  if (progress > 0) return "in_progress";
  return current === "done" ? "todo" : current;
}
