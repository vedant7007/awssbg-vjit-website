import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/server";
import { verifyTicketCode } from "@/lib/qr/ticket";
import { markAttended } from "@/lib/firestore/registrations";
import { getMemberById } from "@/lib/firestore/members.server";
import { getEventById } from "@/lib/firestore/events";
import { safe } from "@/lib/utils/safe";

export const runtime = "nodejs";

const bodySchema = z.object({
  ticketCode: z.string().min(1),
  eventId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { ticketCode, eventId } = parsed.data;

  // 1. Verify and decode the ticket code
  const decoded = verifyTicketCode(ticketCode);
  if (!decoded) {
    return NextResponse.json(
      { error: "Invalid ticket code signature" },
      { status: 400 },
    );
  }

  // 2. Assert the eventId matches
  if (decoded.eventId !== eventId) {
    return NextResponse.json(
      { error: "Ticket is for a different event" },
      { status: 400 },
    );
  }

  try {
    // 3. Mark attended in transaction (checks for 404, double checkin, cancelled)
    const reg = await markAttended(decoded.registrationId, user.uid);

    // 4. Load member and event info for success UI
    const [member, event] = await Promise.all([
      safe(getMemberById(reg.userId), null, "checkin:member"),
      safe(getEventById(reg.eventId), null, "checkin:event"),
    ]);

    return NextResponse.json({
      success: true,
      member: {
        displayName: member?.displayName || "Member",
        username: member?.username || "unknown",
        photoURL: member?.photoURL || null,
      },
      event: {
        title: event?.title || "Event",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    let status = 400;
    if (message === "Registration not found") {
      status = 404;
    } else if (
      message === "Already checked in" ||
      message === "Registration is cancelled"
    ) {
      status = 409;
    }
    return NextResponse.json({ error: message }, { status });
  }
}
