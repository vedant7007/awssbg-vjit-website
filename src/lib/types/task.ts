export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
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
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
