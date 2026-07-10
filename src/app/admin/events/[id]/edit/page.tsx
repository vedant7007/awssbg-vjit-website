import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEventByIdSerialized } from "@/lib/firestore/events";
import { requireAdmin } from "@/lib/auth/server";
import { routes } from "@/lib/constants/routes";
import type { EventFormValues } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { EditEventClient } from "./EditEventClient";

export const metadata: Metadata = { title: "Edit Event | Admin" };
export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin(routes.adminEvents);

  const { id } = await params;
  const event = await getEventByIdSerialized(id);
  if (!event) notFound();

  const defaultValues: EventFormValues = {
    slug: event.slug,
    title: event.title,
    tagline: event.tagline,
    description: event.description,
    coverImage: event.coverImage ?? "",
    gallery: event.gallery,
    category: event.category,
    status: event.status,
    startAt: event.startAt
      ? new Date(event.startAt).toISOString().slice(0, 16)
      : "",
    endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : "",
    venue: event.venue,
    capacity: event.capacity,
    registrationOpen: event.registrationOpen,
    registrationDeadline: event.registrationDeadline
      ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
      : "",
    externalLink: event.externalLink ?? "",
    outcomes: event.outcomes,
  };

  return (
    <PageShell
      eyebrow="Events"
      title={`Edit ${event.title}`}
      description="Update event details."
    >
      <EditEventClient id={id} defaultValues={defaultValues} />
    </PageShell>
  );
}
