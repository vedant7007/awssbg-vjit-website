"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createRoadmapItem } from "@/lib/firestore/roadmap.client";
import type { RoadmapItemFormValues } from "@/lib/types";
import { routes } from "@/lib/constants/routes";
import { RoadmapItemForm } from "@/components/forms/RoadmapItemForm";

export function NewRoadmapItemForm() {
  const router = useRouter();

  async function handleSubmit(values: RoadmapItemFormValues) {
    try {
      await createRoadmapItem(values);
      toast.success(`Added ${values.title}`);
      router.push(routes.adminRoadmap);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create item",
      );
    }
  }

  return (
    <RoadmapItemForm
      onSubmit={handleSubmit}
      submitLabel="Create roadmap item"
    />
  );
}
