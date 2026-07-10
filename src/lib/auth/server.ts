import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminAuth } from "@/lib/firebase/admin";
import { routes } from "@/lib/constants/routes";
import { logger } from "@/lib/utils/logger";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AuthUser = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  admin: boolean;
};

/**
 * Read and verify the session cookie. Returns the authenticated user or null.
 * Verification is done against Firebase Admin, checking revocation.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  if (!session) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string | undefined) ?? null,
      picture: (decoded.picture as string | undefined) ?? null,
      admin: decoded.admin === true,
    };
  } catch (error) {
    logger.warn("session verification failed", error);
    return null;
  }
}

/** Require any authenticated user. Redirects to /signin?next=... otherwise. */
export async function requireAuth(nextPath: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(routes.signinNext(nextPath));
  return user;
}

/** Require an admin. Non-admins are redirected to /signin?next=... */
export async function requireAdmin(nextPath: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect(routes.signinNext(nextPath));
  if (!user.admin) redirect(routes.signinNext(nextPath));
  return user;
}
