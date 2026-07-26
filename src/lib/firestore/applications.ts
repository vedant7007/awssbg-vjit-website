import "server-only";
import { createHash } from "node:crypto";

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
  // Deterministic doc id from the normalized email, so a resubmission (or a
  // double-click / retry) overwrites the same record instead of piling up.
  const email = input.email.trim().toLowerCase();
  const id = createHash("sha256").update(email).digest("hex").slice(0, 40);

  await getAdminDb()
    .collection(COLLECTION)
    .doc(id)
    .set({
      ...input,
      email,
      createdAt: Timestamp.now(),
      source: "website",
    });
}

/** A stored application, serialized (Timestamp → ISO) for the admin view. */
export type Application = ApplicationInput & {
  id: string;
  source: string;
  createdAt: string | null;
};

const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)) : [];
const s = (v: unknown): string => (typeof v === "string" ? v : "");

/** Read all applications, newest first. Admin-only (Admin SDK, server). */
export async function listApplications(): Promise<Application[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    const created = data.createdAt;
    return {
      id: d.id,
      name: s(data.name),
      email: s(data.email),
      whatsapp: s(data.whatsapp),
      year: s(data.year),
      branch: s(data.branch),
      section: s(data.section),
      domains: arr(data.domains),
      focusing: arr(data.focusing),
      wants: arr(data.wants),
      projects: s(data.projects),
      linkedin: s(data.linkedin),
      github: s(data.github),
      learn: s(data.learn),
      why: s(data.why),
      source: s(data.source),
      createdAt:
        created && typeof created.toDate === "function"
          ? created.toDate().toISOString()
          : null,
    };
  });
}
