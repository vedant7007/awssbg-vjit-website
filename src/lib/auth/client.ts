"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase/client";
import { logger } from "@/lib/utils/logger";

export type UseUserState = {
  user: User | null;
  loading: boolean;
};

/**
 * Subscribe to Firebase auth state. UI-only: use this for button labels and
 * avatars, never for gating protected content. Gating happens server-side.
 */
export function useUser(): UseUserState {
  const [state, setState] = useState<UseUserState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // No Firebase Auth (keys not configured yet): render as signed-out.
    if (!auth) {
      setState({ user: null, loading: false });
      return;
    }
    return onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false });
    });
  }, []);

  return state;
}

/**
 * Sign in with Google, then exchange the ID token for a server session cookie.
 * Returns true on success.
 */
export async function signInWithGoogle(): Promise<boolean> {
  if (!auth) {
    logger.error(
      "Sign-in unavailable: Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local.",
    );
    return false;
  }
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const idToken = await cred.user.getIdToken();

    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      logger.error("session exchange failed", res.status);
      await fbSignOut(auth);
      return false;
    }
    return true;
  } catch (error) {
    logger.error("google sign-in failed", error);
    return false;
  }
}

/** Sign out of Firebase and clear the server session cookie. */
export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch (error) {
    logger.warn("session clear failed", error);
  }
  if (auth) await fbSignOut(auth);
}
