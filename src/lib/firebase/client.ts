import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

import { logger } from "@/lib/utils/logger";

/**
 * Client-side Firebase. Safe to import in Client Components only.
 * Values are public (NEXT_PUBLIC_*); the real security boundary is the
 * Firestore rules plus the server-side session verification.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

/**
 * Auth validates the API key eagerly: getAuth throws auth/invalid-api-key when
 * NEXT_PUBLIC_FIREBASE_API_KEY is missing or invalid. Guard it so the whole app
 * still renders during local development before real Firebase keys land. Any
 * auth-dependent UI (sign-in button, avatar) stays inert until keys are set.
 */
export const auth: Auth | null = (() => {
  try {
    return getAuth(firebaseApp);
  } catch (error) {
    logger.warn(
      "Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local to enable sign-in.",
      error,
    );
    return null;
  }
})();

export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
