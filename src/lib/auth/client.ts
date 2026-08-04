"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  updatePassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase/client";
import { handleToEmail } from "@/lib/constants/auth";
import { logger } from "@/lib/utils/logger";

/** POST a fresh ID token to mint the httpOnly session cookie. */
async function exchangeForSession(user: User): Promise<boolean> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return res.ok;
}

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
    if (!(await exchangeForSession(cred.user))) {
      await fbSignOut(auth);
      return false;
    }
    return true;
  } catch (error) {
    logger.error("google sign-in failed", error);
    return false;
  }
}

/**
 * Sign in with a roster handle + password. The handle is mapped to the
 * synthetic email the account was provisioned under, then exchanged for a
 * session cookie. Returns true on success.
 */
export async function signInWithUsername(
  handle: string,
  password: string,
): Promise<boolean> {
  if (!auth) {
    logger.error("Sign-in unavailable: Firebase Auth is not configured.");
    return false;
  }
  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      handleToEmail(handle),
      password,
    );
    if (!(await exchangeForSession(cred.user))) {
      await fbSignOut(auth);
      return false;
    }
    return true;
  } catch (error) {
    logger.error("username sign-in failed", error);
    return false;
  }
}

/** Change the signed-in user's password (Firebase requires a recent login). */
export async function changePassword(newPassword: string): Promise<boolean> {
  if (!auth?.currentUser) return false;
  try {
    await updatePassword(auth.currentUser, newPassword);
    return true;
  } catch (error) {
    logger.error("password change failed", error);
    return false;
  }
}

/** Sign out of Firebase and clear the server session cookie. */
export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "include",
    });
  } catch (error) {
    logger.warn("session clear failed", error);
  }
  if (auth) await fbSignOut(auth);
}
