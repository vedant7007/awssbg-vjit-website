import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import type { RoadmapItem } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

/*
 * Owner: Hanu
 * Status: server reads implemented; voting + write helpers implemented below.
 * Acceptance criteria:
 *   - castVote / removeVote inside a transaction that writes roadmap_votes and
 *     increments/decrements the denormalized voteCount on the item.
 *   - Enforce one vote per (itemId, userId) using the composite doc id.
 * Reference: lib/firestore/members.ts transaction pattern.
 */

const COLLECTION = "roadmap_items";
const VOTES_COLLECTION = "roadmap_votes";

function toItem(id: string, data: FirebaseFirestore.DocumentData): RoadmapItem {
  return { ...(data as Omit<RoadmapItem, "id">), id };
}

export async function listRoadmapItems(): Promise<RoadmapItem[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("quarter", "asc")
    .get();
  return snap.docs.map((d) => toItem(d.id, d.data()));
}

export async function getRoadmapItemById(
  id: string,
): Promise<RoadmapItem | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toItem(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

/** Create a roadmap item. Admin-only callers should use this. */
export async function createRoadmapItem(
  data: Omit<RoadmapItem, "id" | "voteCount" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): Promise<RoadmapItem> {
  const db = getAdminDb();
  const ref = data.id
    ? db.collection(COLLECTION).doc(data.id)
    : db.collection(COLLECTION).doc();
  const payload = {
    ...data,
    voteCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(payload, { merge: true });
  const snap = await ref.get();
  return toItem(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

/** Update a roadmap item. Admin-only. */
export async function updateRoadmapItem(
  id: string,
  updates: Partial<
    Omit<RoadmapItem, "id" | "createdAt" | "updatedAt" | "voteCount">
  >,
): Promise<RoadmapItem> {
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  await ref.set(
    { ...updates, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  const snap = await ref.get();
  return toItem(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

/** Delete a roadmap item and associated votes. Admin-only. */
export async function deleteRoadmapItem(id: string): Promise<void> {
  const db = getAdminDb();
  // delete votes for the item (batched simple delete)
  const votesSnap = await db
    .collection(VOTES_COLLECTION)
    .where("itemId", "==", id)
    .get();
  const batch = db.batch();
  votesSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await db.collection(COLLECTION).doc(id).delete();
}

/**
 * Cast a vote for `itemId` by `userId`.
 * Enforces one vote per (itemId, userId) by using the composite vote doc id.
 */
export async function castVote(itemId: string, userId: string): Promise<void> {
  const db = getAdminDb();
  const voteId = `${itemId}_${userId}`;
  const voteRef = db.collection(VOTES_COLLECTION).doc(voteId);
  const itemRef = db.collection(COLLECTION).doc(itemId);

  await db.runTransaction(async (tx) => {
    const voteSnap = await tx.get(voteRef);
    if (voteSnap.exists) {
      // already voted
      throw new Error("Already voted");
    }

    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists) {
      throw new Error("Item not found");
    }

    tx.set(voteRef, {
      id: voteId,
      itemId,
      userId,
      createdAt: FieldValue.serverTimestamp(),
    });

    tx.update(itemRef, { voteCount: FieldValue.increment(1) });
  });
}

/** Remove a vote for `itemId` by `userId`. */
export async function listRoadmapVotesByUser(
  userId: string,
): Promise<string[]> {
  const snap = await getAdminDb()
    .collection(VOTES_COLLECTION)
    .where("userId", "==", userId)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data() as FirebaseFirestore.DocumentData;
    return data.itemId as string;
  });
}

export async function removeVote(
  itemId: string,
  userId: string,
): Promise<void> {
  const db = getAdminDb();
  const voteId = `${itemId}_${userId}`;
  const voteRef = db.collection(VOTES_COLLECTION).doc(voteId);
  const itemRef = db.collection(COLLECTION).doc(itemId);

  await db.runTransaction(async (tx) => {
    const voteSnap = await tx.get(voteRef);
    if (!voteSnap.exists) {
      throw new Error("Vote not found");
    }

    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists) {
      throw new Error("Item not found");
    }

    tx.delete(voteRef);
    tx.update(itemRef, { voteCount: FieldValue.increment(-1) });
  });
}
