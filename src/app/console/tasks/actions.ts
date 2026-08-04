"use server";

import { revalidatePath } from "next/cache";

import { getViewer, canAssignToTeam } from "@/lib/auth/viewer";
import { getMemberById } from "@/lib/firestore/members.server";
import {
  createTask,
  getTask,
  updateTaskStatus,
  deleteTask,
} from "@/lib/firestore/tasks";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types/task";
import { logger } from "@/lib/utils/logger";

export type TaskActionState = { ok: boolean; error?: string };

function refresh() {
  revalidatePath("/console/tasks");
  revalidatePath("/admin/tasks");
}

export async function createTaskAction(input: {
  title: string;
  description: string;
  assigneeUid: string;
  dueDate: string;
}): Promise<TaskActionState> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "You're not signed in." };
  if (!viewer.isAdmin && !viewer.isLead) {
    return { ok: false, error: "Only team leads and admins can assign tasks." };
  }

  const title = input.title.trim();
  const description = (input.description ?? "").trim();
  const assigneeUid = input.assigneeUid.trim();
  if (!title) return { ok: false, error: "Add a task title." };
  if (title.length > 140) return { ok: false, error: "Title is too long." };
  if (description.length > 2000)
    return { ok: false, error: "Description is too long." };
  if (!assigneeUid)
    return { ok: false, error: "Pick someone to assign it to." };

  const assignee = await getMemberById(assigneeUid);
  if (!assignee) return { ok: false, error: "That member no longer exists." };
  if (!canAssignToTeam(viewer, assignee.team)) {
    return { ok: false, error: "You can only assign within your own team." };
  }

  let dueDate: Date | null = null;
  if (input.dueDate) {
    const d = new Date(input.dueDate);
    if (!Number.isNaN(d.getTime())) dueDate = d;
  }

  try {
    await createTask({
      title,
      description,
      assigneeUid,
      assigneeName: assignee.displayName,
      team: assignee.team ?? null,
      assignedByUid: viewer.uid,
      assignedByName: viewer.name,
      dueDate,
    });
    refresh();
    return { ok: true };
  } catch (e) {
    logger.error("task:create", e);
    return { ok: false, error: "Couldn't save the task. Try again?" };
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
    await updateTaskStatus(taskId, status);
    refresh();
    return { ok: true };
  } catch (e) {
    logger.error("task:status", e);
    return { ok: false, error: "Couldn't update the task." };
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
