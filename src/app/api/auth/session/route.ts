import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAdminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/server";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

const bodySchema = z.object({ idToken: z.string().min(20) });

/** Exchange a Firebase ID token for an httpOnly session cookie. */
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { idToken } = parsed.data;
    // Reject tokens older than 5 minutes to keep session minting fresh.
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return NextResponse.json(
        { error: "Recent sign-in required" },
        { status: 401 },
      );
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const response = NextResponse.json({ status: "ok" });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    logger.error("failed to create session", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Clear the session cookie. */
export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
