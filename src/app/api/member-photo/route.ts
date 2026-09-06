import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/server";
import { setMemberPhoto } from "@/lib/firestore/memberPhotos";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

/* Upload your own profile photo. The browser has already cropped and
 * compressed it to a small square, so anything large here is a client that
 * skipped that step — reject rather than store it. */
const MAX_BYTES = 400_000;

const schema = z.object({
  image: z
    .string()
    .regex(
      /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/,
      "Unsupported image format.",
    )
    .refine((v) => v.length <= MAX_BYTES, "That image is too large."),
});

export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid image." },
      { status: 400 },
    );
  }

  try {
    // Always keyed by the signed-in user: nobody can overwrite someone else's.
    await setMemberPhoto(user.uid, parsed.data.image);
    // Cache-busting stamp so a replaced photo shows up immediately.
    return NextResponse.json({
      url: `/api/member-photo/${user.uid}?v=${Date.now()}`,
    });
  } catch (e) {
    logger.error("member-photo:upload", e);
    return NextResponse.json(
      { error: "Couldn't save that photo." },
      { status: 500 },
    );
  }
}
