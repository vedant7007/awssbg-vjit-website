import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { Timestamp } from "firebase-admin/firestore";

import { getCurrentUser } from "@/lib/auth/server";
import { getEventById } from "@/lib/firestore/events";
import { createRegistration } from "@/lib/firestore/registrations";
import { getMemberById } from "@/lib/firestore/members.server";
import { safe } from "@/lib/utils/safe";
import { formatDateTime } from "@/lib/utils/format";
import { sendEmail } from "@/lib/email/resend";
import { renderEventTicketEmail } from "@/lib/email/templates/eventTicket";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";

const bodySchema = z.object({ eventId: z.string().min(1) });

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { eventId } = parsed.data;

  // 1. Load the event
  const event = await getEventById(eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    // 2. Create the registration (enforcing capacity, deadlines, duplicates in transaction)
    const reg = await createRegistration(eventId, user.uid);

    // 3. Send email confirmation if it's a new registration
    // If it's a duplicate, reg.registeredAt is older
    const isNew =
      reg.registeredAt &&
      Timestamp.now().toMillis() -
        Timestamp.fromDate(reg.registeredAt.toDate()).toMillis() <
        5000;

    if (isNew && user.email) {
      try {
        const member = await safe(
          getMemberById(user.uid),
          null,
          "api:reg:member",
        );
        const memberName = member?.displayName || user.name || "Member";
        const eventDate = formatDateTime(event.startAt);

        const qrBuffer = await QRCode.toBuffer(reg.ticketCode, {
          type: "png",
          margin: 2,
          width: 300,
        });

        const html = renderEventTicketEmail({
          memberName,
          eventTitle: event.title,
          eventDate,
          venue: event.venue,
          ticketCode: reg.ticketCode,
          coverImageUrl: event.coverImage || null,
        });

        await sendEmail({
          to: user.email,
          subject: `Your ticket for ${event.title}`,
          html,
          attachments: [
            {
              filename: "ticket-qr.png",
              content: qrBuffer,
              contentType: "image/png",
              cid: "ticket-qr",
            },
          ],
        });
      } catch (emailError) {
        logger.error("Graceful email failure", emailError);
      }
    }

    return NextResponse.json({ registrationId: reg.id });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not complete registration";
    let status = 400;
    if (message === "Event capacity is full") {
      status = 409;
    }
    return NextResponse.json({ error: message }, { status });
  }
}
