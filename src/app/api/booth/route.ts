import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createBoothPhoto } from "@/lib/firestore/booth";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

// The image is stored inline in the Firestore doc (no external Storage bucket
// needed). Firestore caps a document at ~1 MB, so the client compresses to a
// small jpeg first and we reject anything that would risk the limit.
const MAX_DATA_URL = 900 * 1024;
const bodySchema = z.object({
  image: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/, "unsupported image")
    .max(MAX_DATA_URL, "image too large"),
});

/* Best-effort per-IP rate limit so the endpoint can't be flooded. In-memory,
 * so it's per-instance — a speed bump for a supervised one-day event. */
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

/** Save a captured booth photo. Public + unauthenticated by design. */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many photos too fast. Wait a moment." },
      { status: 429 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid or oversized image." },
      { status: 400 },
    );
  }

  try {
    await createBoothPhoto(parsed.data.image);
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("booth: save failed", err);
    return NextResponse.json(
      { error: "Save failed. Please try again." },
      { status: 500 },
    );
  }
}
