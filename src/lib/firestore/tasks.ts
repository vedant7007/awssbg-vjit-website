import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { Task, TaskStatus } from "@/lib/types/task";

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

function toTask(id: string, d: FirebaseFirestore.DocumentData): Task {
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
    status: (["todo", "in_progress", "done"] as const).includes(d.status)
      ? (d.status as TaskStatus)
      : "todo",
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
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
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({ status, updatedAt: Timestamp.now() });
}

export async function deleteTask(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
