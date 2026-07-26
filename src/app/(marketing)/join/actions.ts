"use server";

import { headers } from "next/headers";

import {
  JOIN_HONEYPOT_FIELD,
  JOIN_RENDERED_AT_FIELD,
  JOIN_MIN_FILL_MS,
} from "@/lib/constants/join";
import { joinSchema } from "@/lib/validation/join";
import { createApplication } from "@/lib/firestore/applications";
import { logger } from "@/lib/utils/logger";

export type JoinState = { ok: boolean; error?: string };

const str = (v: FormDataEntryValue | null): string =>
  typeof v === "string" ? v.trim() : "";

/* Best-effort per-IP rate limit. In-memory, so it resets on cold start and is
 * per-instance — a lightweight speed bump, not a hard guarantee. Combined with
 * the honeypot + timing trap it stops casual scripted spam at club scale. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude cap so the map can't grow forever
  return false;
}

function friendly(field: string): string {
  if (field === "email") return "That email doesn't look right.";
  if (field === "whatsapp") return "Enter a valid WhatsApp number.";
  if (field === "domains") return "Pick at least one domain.";
  if (field === "name") return "Please enter your name.";
  if (field === "learn") return "Tell us what you'd like to learn.";
  return "Some answers look off — please review and resubmit.";
}

/**
 * Handles a community sign-up. Public + unauthenticated by design, so it is
 * defended in layers: a honeypot field, a minimum fill-time, a per-IP rate
 * limit, and strict Zod validation (length caps + allow-listed option values)
 * before anything is written to Firestore.
 */
export async function submitApplication(
  formData: FormData,
): Promise<JoinState> {
  // 1. Honeypot — a real user never fills it. Pretend success and drop it.
  if (str(formData.get(JOIN_HONEYPOT_FIELD))) return { ok: true };

  // 2. Timing trap — reject anything submitted faster than a human could fill.
  const renderedAt = Number(formData.get(JOIN_RENDERED_AT_FIELD));
  if (
    Number.isFinite(renderedAt) &&
    renderedAt > 0 &&
    Date.now() - renderedAt < JOIN_MIN_FILL_MS
  ) {
    return {
      ok: false,
      error: "That was quick — take a moment and try again.",
    };
  }

  // 3. Per-IP rate limit.
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return {
      ok: false,
      error: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  // 4. Strict validation.
  const parsed = joinSchema.safeParse({
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
  });

  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    return { ok: false, error: friendly(field) };
  }

  try {
    await createApplication(parsed.data);
    return { ok: true };
  } catch (err) {
    logger.error("join:submit", err);
    return { ok: false, error: "Something broke on our side. Try again?" };
  }
}
