"use client";

import * as React from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

export type LivePhoto = { id: string; url: string; alt: string };

/**
 * Live subscription to the orientation booth photos, newest first. Powers the
 * homepage globe so a photo appears for everyone the instant it's uploaded.
 */
export function useBoothPhotos(max = 50): LivePhoto[] {
  const [photos, setPhotos] = React.useState<LivePhoto[]>([]);

  React.useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, "boothPhotos"),
      orderBy("createdAt", "desc"),
      limit(max),
    );
    const unsub = onSnapshot(
      q,
      (snap) =>
        setPhotos(
          snap.docs
            .map((d) => ({
              id: d.id,
              url: String(d.data().url ?? ""),
              alt: "Orientation day photo",
            }))
            .filter((p) => p.url),
        ),
      () => {
        /* transient listener errors are non-fatal for a decorative globe */
      },
    );
    return unsub;
  }, [max]);

  return photos;
}
