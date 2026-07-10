"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type {
  Event,
  EventCategory,
  EventStatus,
  EventFormValues,
  Serialized,
} from "@/lib/types";
import { toDate } from "@/lib/utils/format";

const COLLECTION = "events";

function toEvent(id: string, data: FirebaseFirestore.DocumentData): Event {
  return { ...(data as Omit<Event, "id">), id };
}

export async function listEvents(options?: {
  status?: EventStatus;
  category?: EventCategory;
  startDate?: Date;
  endDate?: Date;
  startAfterId?: string;
  limit?: number;
}): Promise<Event[]> {
  let query: FirebaseFirestore.Query = getAdminDb().collection(COLLECTION);

  if (options?.status) {
    query = query.where("status", "==", options.status);
  }
  if (options?.category) {
    query = query.where("category", "==", options.category);
  }
  if (options?.startDate) {
    query = query.where("startAt", ">=", Timestamp.fromDate(options.startDate));
  }
  if (options?.endDate) {
    query = query.where("startAt", "<=", Timestamp.fromDate(options.endDate));
  }

  query = query.orderBy("startAt", "desc");

  if (options?.startAfterId) {
    const docSnap = await getAdminDb()
      .collection(COLLECTION)
      .doc(options.startAfterId)
      .get();
    if (docSnap.exists) {
      query = query.startAfter(docSnap);
    }
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snap = await query.get();
  return snap.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getEventById(id: string): Promise<Event | null> {
  const snap = await getAdminDb().collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toEvent(snap.id, snap.data() as FirebaseFirestore.DocumentData);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  const first = snap.docs[0];
  return first ? toEvent(first.id, first.data()) : null;
}

/** Fetch multiple events by id. Batched in groups of 30 (Firestore `in` cap). */
export async function getEventsByIds(ids: string[]): Promise<Event[]> {
  if (ids.length === 0) return [];
  const { FieldPath } = await import("firebase-admin/firestore");
  const out: Event[] = [];
  for (let i = 0; i < ids.length; i += 30) {
    const batch = ids.slice(i, i + 30);
    const snap = await getAdminDb()
      .collection(COLLECTION)
      .where(FieldPath.documentId(), "in", batch)
      .get();
    out.push(...snap.docs.map((d) => toEvent(d.id, d.data())));
  }
  return out;
}

/** The most relevant event for the landing hero: a live one, else next upcoming. */
export async function getFeaturedEvent(): Promise<Event | null> {
  const live = await getAdminDb()
    .collection(COLLECTION)
    .where("status", "==", "live")
    .orderBy("startAt", "asc")
    .limit(1)
    .get();
  if (live.docs[0]) return toEvent(live.docs[0].id, live.docs[0].data());

  const upcoming = await getAdminDb()
    .collection(COLLECTION)
    .where("status", "==", "upcoming")
    .orderBy("startAt", "asc")
    .limit(1)
    .get();
  return upcoming.docs[0]
    ? toEvent(upcoming.docs[0].id, upcoming.docs[0].data())
    : null;
}

export async function checkEventSlugAvailable(
  slug: string,
  forEventId?: string,
): Promise<boolean> {
  const snap = await getAdminDb()
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return true;
  const first = snap.docs[0];
  return (
    forEventId !== undefined && first !== undefined && first.id === forEventId
  );
}

export async function createEvent(values: EventFormValues): Promise<string> {
  const isAvailable = await checkEventSlugAvailable(values.slug);
  if (!isAvailable) {
    throw new Error(`Slug "${values.slug}" is already taken`);
  }

  const docRef = getAdminDb().collection(COLLECTION).doc();
  const id = docRef.id;

  const startAtDate = new Date(values.startAt);
  const endAtDate = new Date(values.endAt);
  const deadlineDate = values.registrationDeadline
    ? new Date(values.registrationDeadline)
    : null;

  const data = {
    slug: values.slug,
    title: values.title.trim(),
    tagline: values.tagline.trim(),
    description: values.description,
    coverImage: values.coverImage || "",
    gallery: values.gallery.filter(Boolean),
    category: values.category,
    status: values.status,
    startAt: Timestamp.fromDate(startAtDate),
    endAt: Timestamp.fromDate(endAtDate),
    venue: values.venue.trim(),
    capacity: values.capacity ? Number(values.capacity) : null,
    registrationOpen: values.registrationOpen,
    registrationDeadline: deadlineDate
      ? Timestamp.fromDate(deadlineDate)
      : null,
    externalLink: values.externalLink || null,
    outcomes: values.outcomes.filter(Boolean),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(data);
  return id;
}

export async function updateEvent(
  id: string,
  values: EventFormValues,
): Promise<void> {
  const isAvailable = await checkEventSlugAvailable(values.slug, id);
  if (!isAvailable) {
    throw new Error(`Slug "${values.slug}" is already taken`);
  }

  const docRef = getAdminDb().collection(COLLECTION).doc(id);

  const startAtDate = new Date(values.startAt);
  const endAtDate = new Date(values.endAt);
  const deadlineDate = values.registrationDeadline
    ? new Date(values.registrationDeadline)
    : null;

  const data = {
    slug: values.slug,
    title: values.title.trim(),
    tagline: values.tagline.trim(),
    description: values.description,
    coverImage: values.coverImage || "",
    gallery: values.gallery.filter(Boolean),
    category: values.category,
    status: values.status,
    startAt: Timestamp.fromDate(startAtDate),
    endAt: Timestamp.fromDate(endAtDate),
    venue: values.venue.trim(),
    capacity: values.capacity ? Number(values.capacity) : null,
    registrationOpen: values.registrationOpen,
    registrationDeadline: deadlineDate
      ? Timestamp.fromDate(deadlineDate)
      : null,
    externalLink: values.externalLink || null,
    outcomes: values.outcomes.filter(Boolean),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.update(data);
}

export async function deleteEvent(id: string): Promise<void> {
  await getAdminDb().collection(COLLECTION).doc(id).delete();
}

function serializeEvent(event: Event): Serialized<Event> {
  const startAtDate = toDate(event.startAt);
  const endAtDate = toDate(event.endAt);
  const registrationDeadlineDate = toDate(event.registrationDeadline);
  const createdAtDate = toDate(event.createdAt);
  const updatedAtDate = toDate(event.updatedAt);

  return {
    ...event,
    startAt: startAtDate ? startAtDate.toISOString() : "",
    endAt: endAtDate ? endAtDate.toISOString() : "",
    registrationDeadline: registrationDeadlineDate
      ? registrationDeadlineDate.toISOString()
      : null,
    createdAt: createdAtDate ? createdAtDate.toISOString() : "",
    updatedAt: updatedAtDate ? updatedAtDate.toISOString() : "",
  };
}

export async function listEventsSerialized(options?: {
  status?: EventStatus;
  category?: EventCategory;
  startDate?: Date;
  endDate?: Date;
  startAfterId?: string;
  limit?: number;
}): Promise<Serialized<Event>[]> {
  const events = await listEvents(options);
  return events.map(serializeEvent);
}

export async function getEventByIdSerialized(
  id: string,
): Promise<Serialized<Event> | null> {
  const event = await getEventById(id);
  return event ? serializeEvent(event) : null;
}
