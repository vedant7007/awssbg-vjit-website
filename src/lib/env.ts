import "server-only";
import { z } from "zod";

/**
 * Validated server-side environment. Deliberately validated LAZILY (on first
 * use), not at import: the Firebase Admin SDK is initialised lazily so `next
 * build` stays green with placeholder credentials, and eager validation here
 * would reintroduce a build-time failure. Calling `serverEnv()` at runtime
 * turns a missing/typo'd var into one clear, named error instead of a cryptic
 * failure deep inside Firebase/Resend.
 */
const schema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, "required"),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1, "required"),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, "required"),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(
      `Missing or invalid server environment variable(s): ${fields}. ` +
        `Set them in .env.local (local) or the Vercel project settings (deploy).`,
    );
  }
  cached = parsed.data;
  return cached;
}
