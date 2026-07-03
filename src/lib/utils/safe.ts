import { logger } from "@/lib/utils/logger";

/**
 * Run an async read and fall back to a default if it throws. Used for
 * non-critical server reads so a Firestore hiccup (or missing credentials in
 * local scaffolding) degrades to an empty state instead of a crashed page.
 * Critical writes should NOT use this; they must surface their errors.
 */
export async function safe<T>(
  promise: Promise<T>,
  fallback: T,
  context?: string,
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    logger.warn(`safe read failed${context ? ` (${context})` : ""}`, error);
    return fallback;
  }
}
