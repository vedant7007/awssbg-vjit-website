import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateTicketQrImage } from "@/lib/qr/ticket";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Load the registration
  const regSnap = await getAdminDb().collection("registrations").doc(id).get();
  if (!regSnap.exists) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 },
    );
  }
  const reg = regSnap.data();

  // 2. Authorize: Only the ticket owner or an admin
  const isOwner = reg?.userId === user.uid;
  const isAdmin = user.admin;
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ticketCode = reg?.ticketCode;
  if (!ticketCode) {
    return NextResponse.json(
      { error: "Ticket code not generated" },
      { status: 500 },
    );
  }

  // 3. Check if image request
  const url = new URL(request.url);
  const isImage =
    url.searchParams.get("img") === "true" ||
    request.headers.get("accept")?.includes("image/") ||
    false;

  if (isImage) {
    try {
      // generateTicketQrImage returns a data URI; extract the base64 payload
      const dataUri = await generateTicketQrImage(ticketCode);
      const base64 = dataUri.replace(/^data:image\/png;base64,/, "");
      const pngBuffer = Buffer.from(base64, "base64");

      return new Response(new Uint8Array(pngBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Could not generate QR image" },
        { status: 500 },
      );
    }
  }

  // Default: Return JSON
  return NextResponse.json({ ticketCode });
}
