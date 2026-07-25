import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const COLLECTION = "applications";

/**
 * A community sign-up, mirroring the club's registration form. This holds PII
 * (email, WhatsApp) so it lives ONLY in Firestore — it is never rendered on any
 * public page. The captain's admin panel reads it later.
 */
export type ApplicationInput = {
  name: string;
  email: string;
  whatsapp: string;
  year: string;
  branch: string;
  section: string;
  domains: string[];
  focusing: string[];
  wants: string[];
  projects: string;
  linkedin: string;
  github: string;
  learn: string;
  why: string;
};

export async function createApplication(
  input: ApplicationInput,
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTION)
    .add({
      ...input,
      createdAt: Timestamp.now(),
      source: "website",
    });
}
