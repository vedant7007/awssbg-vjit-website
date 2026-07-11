import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { Registration, Event } from "@/lib/types";
import { generateTicketCode } from "@/lib/qr/ticket";

const COLLECTION = "registrations";

function toRegistration(
  id: string,
  data: FirebaseFirestore.DocumentData,
): Registration {
  return { ...(data as Omit<Registration, "id">), id };
}

export async function getRegistrationsForUser(
  userId: string,
): Promise<Registration[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .get();
  return snap.docs.map((d) => toRegistration(d.id, d.data()));
}

export async function getAttendedEventIds(userId: string): Promise<string[]> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .where("status", "==", "attended")
    .get();
  return snap.docs.map((d) => d.get("eventId") as string);
}

export async function getExistingRegistration(
  eventId: string,
  userId: string,
): Promise<Registration | null> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("eventId", "==", eventId)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  const first = snap.docs[0];
  return first ? toRegistration(first.id, first.data()) : null;
}

export async function createRegistration(
  eventId: string,
  userId: string,
): Promise<Registration> {
  return await getAdminDb().runTransaction(async (transaction) => {
    // 1. Check if user is already registered for this event
    const existingQuery = getAdminDb()
      .collection(COLLECTION)
      .where("eventId", "==", eventId)
      .where("userId", "==", userId)
      .limit(1);
    const existingSnap = await transaction.get(existingQuery);
    if (!existingSnap.empty) {
      const doc = existingSnap.docs[0]!;
      return toRegistration(doc.id, doc.data());
    }

    // 2. Fetch the event details to validate deadline, status, and capacity
    const eventRef = getAdminDb().collection("events").doc(eventId);
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists) {
      throw new Error("Event not found");
    }
    const event = eventSnap.data() as Event;

    // 3. Enforce registration open window
    if (!event.registrationOpen) {
      throw new Error("Registration is closed");
    }

    const now = Timestamp.now();

    // 4. Enforce registration deadline
    if (event.registrationDeadline) {
      const deadline = Timestamp.fromDate(event.registrationDeadline.toDate());
      if (deadline.toMillis() < now.toMillis()) {
        throw new Error("Registration deadline has passed");
      }
    }

    // 5. Enforce event ended check
    if (event.endAt) {
      const endAt = Timestamp.fromDate(event.endAt.toDate());
      if (endAt.toMillis() < now.toMillis()) {
        throw new Error("Event has already ended");
      }
    }

    // 6. Enforce capacity check
    if (event.capacity !== null && event.capacity !== undefined) {
      const countQuery = getAdminDb()
        .collection(COLLECTION)
        .where("eventId", "==", eventId)
        .where("status", "in", ["registered", "attended"]);
      const countSnap = await transaction.get(countQuery);
      if (countSnap.size >= event.capacity) {
        throw new Error("Event capacity is full");
      }
    }

    // 7. Create the registration document
    const regRef = getAdminDb().collection(COLLECTION).doc();
    const regId = regRef.id;
    const ticketCode = generateTicketCode(regId, eventId);

    const registrationData = {
      eventId,
      userId,
      ticketCode,
      status: "registered" as const,
      registeredAt: now,
      attendedAt: null,
      checkedInBy: null,
    };

    transaction.set(regRef, registrationData);

    return {
      ...registrationData,
      id: regId,
    };
  });
}

export async function markAttended(
  registrationId: string,
  checkedInBy: string,
): Promise<Registration> {
  return await getAdminDb().runTransaction(async (transaction) => {
    const regRef = getAdminDb().collection(COLLECTION).doc(registrationId);
    const regSnap = await transaction.get(regRef);
    if (!regSnap.exists) {
      throw new Error("Registration not found");
    }

    const reg = regSnap.data() as Registration;
    if (reg.status === "attended") {
      throw new Error("Already checked in");
    }
    if (reg.status === "cancelled") {
      throw new Error("Registration is cancelled");
    }

    const now = Timestamp.now();
    const updates = {
      status: "attended" as const,
      attendedAt: now,
      checkedInBy,
    };

    transaction.update(regRef, updates);

    return {
      ...reg,
      ...updates,
      id: registrationId,
    };
  });
}
