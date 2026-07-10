"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/lib/constants/routes";
import { createEvent } from "@/lib/firestore/events";
import type { EventFormValues } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { EventForm } from "@/components/forms/EventForm";

export default function NewEventPage() {
  const router = useRouter();

  async function handleSubmit(values: EventFormValues) {
    try {
      await createEvent(values);
      toast.success(`Created event: ${values.title}`);
      router.push(routes.adminEvents);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create event",
      );
    }
  }

  return (
    <PageShell
      eyebrow="Events"
      title="Add event"
      description="Create a new community event."
    >
      <EventForm onSubmit={handleSubmit} submitLabel="Create event" />
    </PageShell>
  );
}
