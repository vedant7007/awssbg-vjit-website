import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Owner: Rishikesh (polish), used by Mohiuddin's registration + checkin flows.
 * Signed ticket codes: `${registrationId}.${eventId}.${signature}` where the
 * signature is a base64url HMAC-SHA256 over `${registrationId}.${eventId}`.
 * TICKET_SECRET must be set (openssl rand -base64 32).
 */

function getSecret(): string {
  const secret = process.env.TICKET_SECRET;
  if (!secret) {
    throw new Error("TICKET_SECRET is not set");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function generateTicketCode(
  registrationId: string,
  eventId: string,
): string {
  const payload = `${registrationId}.${eventId}`;
  return `${payload}.${sign(payload)}`;
}

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
  if (expectedBuf.length !== actualBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

  return { registrationId, eventId };
}
