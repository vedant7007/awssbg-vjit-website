"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/lib/constants/routes";
import { updateEvent } from "@/lib/firestore/events";
import type { EventFormValues } from "@/lib/types";
import { EventForm } from "@/components/forms/EventForm";

export function EditEventClient({
  id,
  defaultValues,
}: {
  id: string;
  defaultValues: EventFormValues;
}) {
  const router = useRouter();

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

  return (
    <EventForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitLabel="Save changes"
    />
  );
}
