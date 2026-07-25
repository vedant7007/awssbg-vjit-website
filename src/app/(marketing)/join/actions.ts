"use server";

import {
  createApplication,
  type ApplicationInput,
} from "@/lib/firestore/applications";
import { logger } from "@/lib/utils/logger";

export type JoinState = { ok: boolean; error?: string };

const str = (v: FormDataEntryValue | null): string =>
  typeof v === "string" ? v.trim() : "";

/**
 * Handles a community sign-up. Validates the required fields server-side, then
 * writes to Firestore. On success the client shows the Discord step — the
 * invite is never gated behind auth.
 */
export async function submitApplication(
  formData: FormData,
): Promise<JoinState> {
  const input: ApplicationInput = {
    name: str(formData.get("name")),
    email: str(formData.get("email")),
    whatsapp: str(formData.get("whatsapp")),
    year: str(formData.get("year")),
    branch: str(formData.get("branch")),
    section: str(formData.get("section")),
    domains: formData.getAll("domains").map(String),
    focusing: formData.getAll("focusing").map(String),
    wants: formData.getAll("wants").map(String),
    projects: str(formData.get("projects")),
    linkedin: str(formData.get("linkedin")),
    github: str(formData.get("github")),
    learn: str(formData.get("learn")),
    why: str(formData.get("why")),
  };

  // Required fields (mirrors the form). Optional: linkedin, github, why.
  const required: [string, string][] = [
    ["name", input.name],
    ["email", input.email],
    ["whatsapp", input.whatsapp],
    ["year", input.year],
    ["branch", input.branch],
    ["section", input.section],
    ["projects", input.projects],
    ["learn", input.learn],
  ];
  for (const [field, value] of required) {
    if (!value) return { ok: false, error: `Missing ${field}.` };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) {
    return { ok: false, error: "That email doesn't look right." };
  }
  if (input.domains.length === 0) {
    return { ok: false, error: "Pick at least one domain." };
  }

  try {
    await createApplication(input);
    return { ok: true };
  } catch (err) {
    logger.error("join:submit", err);
    return { ok: false, error: "Something broke on our side. Try again?" };
  }
}
