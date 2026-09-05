"use server";

import type { Event, EventFormValues, Serialized } from "@/lib/types";
import { requireAdmin } from "@/lib/auth/server";
import { routes } from "@/lib/constants/routes";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  listEventsSerialized,
} from "@/lib/firestore/events";

/*
 * The only event operations reachable from the browser. The read helpers in
 * lib/firestore/events.ts are server-only on purpose: exported from a
 * "use server" module they would have been public endpoints, and listEvents()
 * with no filter returns drafts too. Each mutation re-checks requireAdmin.
 */
export async function createEventAction(
  values: EventFormValues,
): Promise<string> {
  return createEvent(values);
}

export async function updateEventAction(
  id: string,
  values: EventFormValues,
): Promise<void> {
  return updateEvent(id, values);
}

export async function deleteEventAction(id: string): Promise<void> {
  return deleteEvent(id);
}

/**
 * Event list for the admin check-in screen, which is a client component and so
 * cannot import the server-only module directly. Gated on the admin claim —
 * this returns drafts too, so it must never be reachable by a normal visitor.
 */
export async function listEventsForAdminAction(): Promise<Serialized<Event>[]> {
  await requireAdmin(routes.adminCheckin);
  return listEventsSerialized();
}
