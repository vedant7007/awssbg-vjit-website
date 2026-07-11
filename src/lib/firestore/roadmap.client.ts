"use client";

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { RoadmapItem } from "@/lib/types";

const roadmapCollection = collection(db, "roadmap_items");
const votesCollection = collection(db, "roadmap_votes");

export async function createRoadmapItem(
  data: Omit<RoadmapItem, "id" | "voteCount" | "createdAt" | "updatedAt">,
): Promise<void> {
  const ref = doc(roadmapCollection);
  await setDoc(ref, {
    ...data,
    voteCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateRoadmapItem(
  id: string,
  updates: Partial<
    Omit<RoadmapItem, "id" | "createdAt" | "updatedAt" | "voteCount">
  >,
): Promise<void> {
  const ref = doc(db, "roadmap_items", id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRoadmapItem(id: string): Promise<void> {
  const itemRef = doc(db, "roadmap_items", id);
  const votesSnap = await getDocs(
    query(votesCollection, where("itemId", "==", id)),
  );
  const batch = writeBatch(db);

  votesSnap.docs.forEach((voteDoc) => batch.delete(voteDoc.ref));
  batch.delete(itemRef);

  await batch.commit();
}
