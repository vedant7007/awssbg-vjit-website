import type { Timestamp } from "./firestore";

export const REGISTRATION_STATUSES = [
  "registered",
  "attended",
  "cancelled",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export type Registration = {
  id: string;
  eventId: string;
  userId: string; // member UID
  ticketCode: string; // HMAC-signed, encoded in QR
  status: RegistrationStatus;
  registeredAt: Timestamp;
  attendedAt: Timestamp | null;
  checkedInBy: string | null; // admin UID who scanned
};
