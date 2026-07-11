"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { createConverter } from "@/lib/firestore/converters";
import type { Project, ProjectFormValues } from "@/lib/types";

/*
 * Client-SDK write path for the projects collection. These run in the browser
 * with the signed-in user's ID token, so an admin's custom claim satisfies the
 * Firestore rules. Server-side reads live in projects.server.ts (Admin SDK).
 */

const projectsRef = collection(db, "projects").withConverter(
  createConverter<Project>(),
);

export async function checkProjectSlugAvailable(
  slug: string,
  forProjectId?: string,
): Promise<boolean> {
  const snap = await getDoc(doc(db, "projectSlugs", slug));
  if (!snap.exists()) return true;
  return forProjectId !== undefined && snap.data().projectId === forProjectId;
}

/**
 * Create a project and atomically reserve its slug.
 * Throws if the slug is already taken.
 */
export async function createProject(
  id: string,
  values: ProjectFormValues,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const slugRef = doc(db, "projectSlugs", values.slug);
    const slugSnap = await tx.get(slugRef);
    if (slugSnap.exists() && slugSnap.data().projectId !== id) {
      throw new Error(`Project slug "${values.slug}" is already taken`);
    }

    tx.set(doc(db, "projects", id), {
      ...values,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.set(slugRef, { projectId: id });
  });
}

/**
 * Update a project. If the slug changed, move the reservation atomically.
 */
export async function updateProject(
  id: string,
  values: ProjectFormValues,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const current = await tx.get(doc(db, "projects", id));
    if (!current.exists()) throw new Error("Project not found");
    const previousSlug = current.data().slug as string;

    if (previousSlug !== values.slug) {
      const nextRef = doc(db, "projectSlugs", values.slug);
      const nextSnap = await tx.get(nextRef);
      if (nextSnap.exists() && nextSnap.data().projectId !== id) {
        throw new Error(`Project slug "${values.slug}" is already taken`);
      }
      tx.set(nextRef, { projectId: id });
      tx.delete(doc(db, "projectSlugs", previousSlug));
    }

    tx.set(
      doc(db, "projects", id),
      {
        ...values,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

/** Delete a project and release its slug reservation. */
export async function deleteProject(id: string): Promise<void> {
  const snap = await getDoc(doc(db, "projects", id));
  if (snap.exists()) {
    const slug = snap.data().slug as string | undefined;
    if (slug) await deleteDoc(doc(db, "projectSlugs", slug));
  }
  await deleteDoc(doc(db, "projects", id));
}

export { projectsRef };
