"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/server";
import { routes } from "@/lib/constants/routes";
import { deleteBoothPhoto } from "@/lib/firestore/booth";
import { logger } from "@/lib/utils/logger";

export type ActionState = { ok: boolean; error?: string };

/** Admin-only: delete a booth photo (doc + Storage file). */
export async function deleteBoothPhotoAction(id: string): Promise<ActionState> {
  await requireAdmin(routes.adminBooth);
  try {
    await deleteBoothPhoto(id);
    revalidatePath(routes.adminBooth);
    return { ok: true };
  } catch (err) {
    logger.error("booth: delete failed", err);
    return { ok: false, error: "Couldn't delete that photo." };
  }
}
