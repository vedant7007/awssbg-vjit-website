"use server";

import { Timestamp } from "firebase-admin/firestore";

import { getCurrentUser } from "@/lib/auth/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { logger } from "@/lib/utils/logger";

/** Clears the first-login flag once the member has set their own password. */
export async function finishFirstLoginAction(): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  try {
    await getAdminDb().collection("members").doc(user.uid).update({
      mustChangePassword: false,
      updatedAt: Timestamp.now(),
    });
    return { ok: true };
  } catch (e) {
    logger.error("welcome:finish-first-login", e);
    return { ok: false };
  }
}
