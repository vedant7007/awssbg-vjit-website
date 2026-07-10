"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/lib/constants/routes";
import { getEventByIdSerialized, updateEvent } from "@/lib/firestore/events";
import type { Event, EventFormValues, Serialized } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { EventForm } from "@/components/forms/EventForm";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [event, setEvent] = React.useState<Serialized<Event> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    async function loadEvent() {
      try {
        const data = await getEventByIdSerialized(id);
        if (!data) {
          toast.error("Event not found");
          router.push(routes.adminEvents);
          return;
        }
        setEvent(data);
      } catch {
        toast.error("Could not load event");
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id, router]);

  async function handleSubmit(values: EventFormValues) {
    try {
      await updateEvent(id, values);
      toast.success(`Updated event: ${values.title}`);
      router.push(routes.adminEvents);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update event",
      );
    }
  }

  if (loading) {
    return (
      <PageShell eyebrow="Events" title="Edit event" description="Loading...">
        <div className="flex h-32 items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Loading event details...
          </p>
        </div>
      </PageShell>
    );
  }

  if (!event) return null;

  return (
    <PageShell
      eyebrow="Events"
      title={`Edit ${event.title}`}
      description="Update event details."
    >
      <EventForm
        defaultValues={event}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </PageShell>
  );
}
