import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { Task, TaskStatus, TaskUpdate } from "@/lib/types/task";

/*
 * Task assignment store. All access is server-side via the Admin SDK (console
 * + admin server components / actions), so there is no client Firestore path
 * and the deny-all rule already covers the collection.
 *
 * ponytail: queries fetch-then-sort in memory instead of composite indexes —
 * fine at club scale (dozens of tasks). Add (assigneeUid|team + createdAt)
 * indexes if the collection ever grows into the thousands.
 */
const COLLECTION = "tasks";

export type NewTask = {
  title: string;
  description: string;
  assigneeUid: string;
  assigneeName: string;
  team: string | null;
  assignedByUid: string;
  assignedByName: string;
  dueDate: Date | null;
};

const iso = (v: unknown): string | null =>
  v && typeof (v as Timestamp).toDate === "function"
    ? (v as Timestamp).toDate().toISOString()
    : null;

const clampPct = (v: unknown): number =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(0, Math.min(100, Math.round(v)))
    : 0;

function toUpdate(u: FirebaseFirestore.DocumentData): TaskUpdate {
  return {
    note: typeof u.note === "string" ? u.note : "",
    progress: clampPct(u.progress),
    byUid: typeof u.byUid === "string" ? u.byUid : "",
    byName: typeof u.byName === "string" ? u.byName : "",
    at: iso(u.at),
  };
}

function toTask(id: string, d: FirebaseFirestore.DocumentData): Task {
  const rawUpdates = Array.isArray(d.updates) ? d.updates : [];
  const updates = rawUpdates
    .map(toUpdate)
    .sort((a, b) => (b.at ?? "").localeCompare(a.at ?? "")); // newest first
  const status: TaskStatus = (
    ["todo", "in_progress", "done"] as const
  ).includes(d.status)
    ? (d.status as TaskStatus)
    : "todo";
  return {
    id,
    title: typeof d.title === "string" ? d.title : "",
    description: typeof d.description === "string" ? d.description : "",
    assigneeUid: typeof d.assigneeUid === "string" ? d.assigneeUid : "",
    assigneeName: typeof d.assigneeName === "string" ? d.assigneeName : "",
    team: typeof d.team === "string" ? d.team : null,
    assignedByUid: typeof d.assignedByUid === "string" ? d.assignedByUid : "",
    assignedByName:
      typeof d.assignedByName === "string" ? d.assignedByName : "",
    status,
    // Fall back to the status when a legacy doc has no stored progress.
    progress:
      typeof d.progress === "number"
        ? clampPct(d.progress)
        : status === "done"
          ? 100
          : 0,
    updates,
    dueDate: iso(d.dueDate),
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  };
}

const byNewest = (a: Task, b: Task) =>
  (b.createdAt ?? "").localeCompare(a.createdAt ?? "");

export async function createTask(input: NewTask): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
      status: "todo" as TaskStatus,
      progress: 0,
      updates: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
}

/**
 * Create many tasks at once, in a single atomic batch.
 *
 * Assigning to several people fans out into one task per person rather than one
 * shared task with many owners: status and progress are tracked per assignee,
 * so a shared row could not represent "Medha is at 60%, Rohan hasn't started".
 */
export async function createTasks(inputs: NewTask[]): Promise<number> {
  if (inputs.length === 0) return 0;
  const db = getAdminDb();
  const batch = db.batch();
  const now = Timestamp.now();
  for (const input of inputs) {
    batch.set(db.collection(COLLECTION).doc(), {
      ...input,
      dueDate: input.dueDate ? Timestamp.fromDate(input.dueDate) : null,
      status: "todo" as TaskStatus,
      progress: 0,
      updates: [],
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
  return inputs.length;
}

export async function getTask(id: string): Promise<Task | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toTask(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

export async function listAllTasks(): Promise<Task[]> {
  const snap = await getAdminDb().collection(COLLECTION).get();
  return snap.docs.map((d) => toTask(d.id, d.data())).sort(byNewest);
}

export async function listTasksForAssignee(uid: string): Promise<Task[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("assigneeUid", "==", uid)
    .get();
  return snap.docs.map((d) => toTask(d.id, d.data())).sort(byNewest);
}

export async function listTasksForTeam(team: string): Promise<Task[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("team", "==", team)
    .get();
  return snap.docs.map((d) => toTask(d.id, d.data())).sort(byNewest);
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  progress?: number,
): Promise<void> {
  const patch: Record<string, unknown> = {
    status,
    updatedAt: Timestamp.now(),
  };
  if (typeof progress === "number") patch.progress = progress;
  await getAdminDb().collection(COLLECTION).doc(id).update(patch);
}

/** Append a progress note, set the new progress, and move status to match. */
export async function addTaskUpdate(
  id: string,
  update: { note: string; progress: number; byUid: string; byName: string },
  status: TaskStatus,
): Promise<void> {
  const entry = {
    note: update.note,
    progress: update.progress,
    byUid: update.byUid,
    byName: update.byName,
    at: Timestamp.now(),
  };
  await getAdminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      updates: FieldValue.arrayUnion(entry),
      progress: update.progress,
      status,
      updatedAt: Timestamp.now(),
    });
}

export async function deleteTask(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
