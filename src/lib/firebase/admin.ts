import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { serverEnv } from "@/lib/env";

/*
 * Server-only Firebase Admin. Never import this from a Client Component.
 *
 * Initialization is LAZY: cert() parses the private key eagerly, so calling it
 * at module load would run during `next build` (page-data collection) and fail
 * with placeholder credentials. Deferring to first use keeps the build green and
 * only touches real credentials when a request actually needs the Admin SDK.
 *
 * The private key arrives as a single-line env var with escaped newlines, so we
 * restore them before handing it to cert().
 */
let cachedApp: App | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps();
  if (existing.length > 0 && existing[0]) {
    cachedApp = existing[0];
    return cachedApp;
  }
  // Validates presence with a clear error before cert() parses the key.
  const env = serverEnv();
  cachedApp = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  return cachedApp;
}

export function getAdminAuth(): Auth {
  if (!cachedAuth) cachedAuth = getAuth(getAdminApp());
  return cachedAuth;
}

export function getAdminDb(): Firestore {
  if (!cachedDb) cachedDb = getFirestore(getAdminApp());
  return cachedDb;
}
