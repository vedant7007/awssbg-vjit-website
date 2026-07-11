import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Project } from "@/lib/types";

/*
 * Server-side reads for the projects collection via the Admin SDK. Used by
 * Server Components (landing, projects list, project detail, admin list/edit).
 * Writes go through the client-SDK helpers in projects.ts.
 */

const COLLECTION = "projects";

function toProject(id: string, data: FirebaseFirestore.DocumentData): Project {
  return { ...(data as Omit<Project, "id">), id };
}

export async function listProjects(): Promise<Project[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => toProject(d.id, d.data()));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toProject(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  const first = snap.docs[0];
  return first ? toProject(first.id, first.data()) : null;
}

export async function getFeaturedProjects(max = 3): Promise<Project[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("featured", "==", true)
    .limit(max)
    .get();
  return snap.docs.map((d) => toProject(d.id, d.data()));
}

export async function getProjectsByContributor(
  uid: string,
): Promise<Project[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("contributors", "array-contains", uid)
    .get();
  return snap.docs.map((d) => toProject(d.id, d.data()));
}
