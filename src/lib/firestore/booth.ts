import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const COLLECTION = "boothPhotos";

export type BoothPhoto = {
  id: string;
  url: string; // an inline data: URL of the compressed photo
  createdAt: string | null;
};

/** Record a captured booth photo (inline data URL). Returns the new doc id. */
export async function createBoothPhoto(url: string): Promise<string> {
  const ref = await getAdminDb().collection(COLLECTION).add({
    url,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

/** List booth photos newest-first (admin moderation view). */
export async function listBoothPhotos(max = 200): Promise<BoothPhoto[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(max)
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    const created = data.createdAt;
    return {
      id: d.id,
      url: typeof data.url === "string" ? data.url : "",
      createdAt:
        created && typeof created.toDate === "function"
          ? created.toDate().toISOString()
          : null,
    };
  });
}

/** Delete a booth photo. */
export async function deleteBoothPhoto(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}
