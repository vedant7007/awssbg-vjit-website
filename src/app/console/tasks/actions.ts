"use server";

import { revalidatePath } from "next/cache";

import { getViewer, canAssignToTeam } from "@/lib/auth/viewer";
import { getMemberById } from "@/lib/firestore/members.server";
import {
  createTasks,
  getTask,
  updateTaskStatus,
  addTaskUpdate,
  deleteTask,
} from "@/lib/firestore/tasks";
import {
  TASK_STATUSES,
  progressForStatus,
  statusForProgress,
  type TaskStatus,
} from "@/lib/types/task";
import { logger } from "@/lib/utils/logger";

export type TaskActionState = { ok: boolean; error?: string };

function refresh() {
  revalidatePath("/console/tasks");
  revalidatePath("/admin/tasks");
}

const MAX_TITLES = 25;
const MAX_ASSIGNEES = 50;

/**
 * Assign one or more tasks to one or more people. Every (title × assignee)
 * pair becomes its own task so progress stays per-person. Permission is checked
 * for each assignee, so a lead can never slip someone outside their team into
 * the list.
 */
export async function createTaskAction(input: {
  titles: string[];
  description: string;
  assigneeUids: string[];
  dueDate: string;
}): Promise<TaskActionState & { created?: number }> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "You're not signed in." };
  if (!viewer.isAdmin && !viewer.isLead) {
    return { ok: false, error: "Only team leads and admins can assign tasks." };
  }

  const titles = (input.titles ?? []).map((t) => t.trim()).filter(Boolean);
  const description = (input.description ?? "").trim();
  const assigneeUids = [
    ...new Set((input.assigneeUids ?? []).map((u) => u.trim()).filter(Boolean)),
  ];

  if (titles.length === 0) return { ok: false, error: "Add a task title." };
  if (titles.length > MAX_TITLES)
    return {
      ok: false,
      error: `That's more than ${MAX_TITLES} tasks at once.`,
    };
  if (titles.some((t) => t.length > 140))
    return { ok: false, error: "One of the titles is too long." };
  if (description.length > 2000)
    return { ok: false, error: "Description is too long." };
  if (assigneeUids.length === 0)
    return { ok: false, error: "Pick at least one person." };
  if (assigneeUids.length > MAX_ASSIGNEES)
    return { ok: false, error: "That's too many people at once." };

  const assignees = await Promise.all(
    assigneeUids.map((uid) => getMemberById(uid)),
  );
  const resolved: { uid: string; name: string; team: string | null }[] = [];
  for (const [i, member] of assignees.entries()) {
    if (!member)
      return { ok: false, error: "One of those members no longer exists." };
    if (!canAssignToTeam(viewer, member.team)) {
      return {
        ok: false,
        error: `You can only assign within your own team — ${member.displayName} isn't on it.`,
      };
    }
    resolved.push({
      uid: assigneeUids[i]!,
      name: member.displayName,
      team: member.team ?? null,
    });
  }

  let dueDate: Date | null = null;
  if (input.dueDate) {
    const d = new Date(input.dueDate);
    if (!Number.isNaN(d.getTime())) dueDate = d;
  }

  const batch = titles.flatMap((title) =>
    resolved.map((a) => ({
      title,
      description,
      assigneeUid: a.uid,
      assigneeName: a.name,
      team: a.team,
      assignedByUid: viewer.uid,
      assignedByName: viewer.name,
      dueDate,
    })),
  );

  try {
    const created = await createTasks(batch);
    refresh();
    return { ok: true, created };
  } catch (e) {
    logger.error("task:create", e);
    return { ok: false, error: "Couldn't save the tasks. Try again?" };
  }
}

export async function setTaskStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<TaskActionState> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "You're not signed in." };
  if (!TASK_STATUSES.includes(status))
    return { ok: false, error: "Invalid status." };

  const task = await getTask(taskId);
  if (!task) return { ok: false, error: "Task not found." };

  const allowed =
    viewer.isAdmin ||
    viewer.uid === task.assigneeUid ||
    (viewer.isLead && viewer.team === task.team);
  if (!allowed) return { ok: false, error: "You can't change this task." };

  try {
    const implied = progressForStatus(status);
    await updateTaskStatus(taskId, status, implied ?? undefined);
    refresh();
    return { ok: true };
  } catch (e) {
    logger.error("task:status", e);
    return { ok: false, error: "Couldn't update the task." };
  }
}

/**
 * The assignee (or their lead / an admin) posts a progress note. The note is
 * appended to the task's log, `progress` is updated, and the status is nudged
 * to match (any progress ⇒ in progress; 100% ⇒ done).
 */
export async function addTaskUpdateAction(
  taskId: string,
  input: { note: string; progress: number },
): Promise<TaskActionState> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "You're not signed in." };

  const task = await getTask(taskId);
  if (!task) return { ok: false, error: "Task not found." };

  const allowed =
    viewer.isAdmin ||
    viewer.uid === task.assigneeUid ||
    (viewer.isLead && viewer.team === task.team);
  if (!allowed) return { ok: false, error: "You can't update this task." };

  const note = (input.note ?? "").trim();
  if (note.length > 500) return { ok: false, error: "Keep the note shorter." };
  const progress = Math.max(
    0,
    Math.min(100, Math.round(Number(input.progress) || 0)),
  );
  if (!note && progress === task.progress) {
    return { ok: false, error: "Add a note or move the progress." };
  }

  try {
    await addTaskUpdate(
      taskId,
      { note, progress, byUid: viewer.uid, byName: viewer.name },
      statusForProgress(progress, task.status),
    );
    refresh();
    return { ok: true };
  } catch (e) {
    logger.error("task:update", e);
    return { ok: false, error: "Couldn't post that update." };
  }
}

export async function deleteTaskAction(
  taskId: string,
): Promise<TaskActionState> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "You're not signed in." };

  const task = await getTask(taskId);
  if (!task) return { ok: true }; // already gone

  const allowed =
    viewer.isAdmin ||
    viewer.uid === task.assignedByUid ||
    (viewer.isLead && viewer.team === task.team);
  if (!allowed) return { ok: false, error: "You can't delete this task." };

  try {
    await deleteTask(taskId);
    refresh();
    return { ok: true };
  } catch (e) {
    logger.error("task:delete", e);
    return { ok: false, error: "Couldn't delete the task." };
  }
}
