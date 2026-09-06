import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";

/*
 * Profile photos, kept in their own collection rather than on the member doc.
 * Firebase Storage isn't provisioned on this project, so the image lives as a
 * compressed data URL — but member docs are listed 41 at a time on the admin
 * and team screens, and inlining ~25KB of base64 into each would bloat every
 * one of those queries. Here it is fetched only by the route that serves it.
 *
 * All access is server-side via the Admin SDK, so the deny-all Firestore rule
 * already covers the collection.
 */
const COLLECTION = "memberPhotos";

export async function setMemberPhoto(
  uid: string,
  dataUrl: string,
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .doc(uid)
    .set({ dataUrl, updatedAt: Timestamp.now() });
}

export async function getMemberPhoto(uid: string): Promise<string | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(uid).get();
  const url = snap.data()?.dataUrl;
  return typeof url === "string" ? url : null;
}

export async function deleteMemberPhoto(uid: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(uid).delete();
}
