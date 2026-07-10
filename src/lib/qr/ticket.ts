import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import QRCode from "qrcode";

import { logger } from "@/lib/utils/logger";

/*
 * Owner: Rishikesh
 * Used by: Mohiuddin's registration + check-in flows.
 *
 * Signed ticket codes follow the format:
 *   `${registrationId}.${eventId}.${signature}`
 *
 * The signature is a base64url HMAC-SHA256 over the payload
 * `${registrationId}.${eventId}`.
 *
 * TICKET_SECRET must be a cryptographically random string:
 *   openssl rand -base64 32
 *
 * This entire module is gated by `import "server-only"`, so Next.js will
 * throw a build-time error if it is ever imported from a Client Component
 * or an edge route that runs in the browser context.
 */

/** Read and validate the signing secret from the environment. */
function getSecret(): string {
  const secret = process.env["TICKET_SECRET"];
  if (!secret || secret.length < 16) {
    throw new Error(
      "TICKET_SECRET is not set or is too short. Generate one with: openssl rand -base64 32",
    );
  }
  return secret;
}

/** Internal HMAC-SHA256 signer. Never exported; secret stays server-only. */
function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/**
 * Generate a signed, self-contained ticket code.
 *
 * The resulting string encodes both the registration and event identifiers
 * alongside a tamper-evident HMAC signature. It is safe to embed in a QR
 * code or print on a physical ticket.
 *
 * @param registrationId - Firestore document ID for the registration record.
 * @param eventId - Firestore document ID for the event.
 * @returns A dot-separated token: `{registrationId}.{eventId}.{signature}`
 */
export function generateTicketCode(
  registrationId: string,
  eventId: string,
): string {
  if (!registrationId || !eventId) {
    throw new Error("registrationId and eventId must be non-empty strings.");
  }
  const payload = `${registrationId}.${eventId}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify a signed ticket code in constant time to prevent timing attacks.
 *
 * Returns the decoded identifiers on success or null if the code is
 * malformed or the signature does not match.
 *
 * @param code - A token previously produced by `generateTicketCode`.
 */
export function verifyTicketCode(
  code: string,
): { registrationId: string; eventId: string } | null {
  const parts = code.split(".");
  if (parts.length !== 3) return null;

  const [registrationId, eventId, signature] = parts;
  if (!registrationId || !eventId || !signature) return null;

  const expected = sign(`${registrationId}.${eventId}`);

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);

  // Lengths must match before timingSafeEqual to avoid a thrown error.
  if (expectedBuf.length !== actualBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

  return { registrationId, eventId };
}

/**
 * Render a signed ticket code as an inline base64-encoded PNG.
 *
 * The image is sized at 200x200 px with 4 px of quiet-zone margin so it
 * prints at roughly 0.7 in when embedded in email at 300 dpi. Error
 * correction level M gives ~15% redundancy, which balances data density
 * with scanability on matte paper and standard phone cameras.
 *
 * Returns a data URI string: `data:image/png;base64,...`
 *
 * @param code - A token produced by `generateTicketCode`.
 */
export async function generateTicketQrImage(code: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(code, {
      type: "image/png",
      width: 200,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#161d27",
        light: "#ffffff",
      },
    });
    return dataUrl;
  } catch (err) {
    logger.error("QR image generation failed", err);
    throw new Error("Failed to generate QR image for ticket code.");
  }
}
