"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  updateRoadmapItem,
  deleteRoadmapItem,
} from "@/lib/firestore/roadmap.client";
import type { RoadmapItemFormValues } from "@/lib/types";
import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { RoadmapItemForm } from "@/components/forms/RoadmapItemForm";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditRoadmapItemForm({
  id,
  initialValues,
}: {
  id: string;
  initialValues: RoadmapItemFormValues;
}) {
  const router = useRouter();

  async function handleSubmit(values: RoadmapItemFormValues) {
    try {
      await updateRoadmapItem(id, values);
      toast.success("Roadmap item updated");
      router.push(routes.adminRoadmap);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update item",
      );
    }
  }

  async function handleDelete() {
    try {
      await deleteRoadmapItem(id);
      toast.success("Roadmap item removed");
      router.push(routes.adminRoadmap);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete item",
      );
    }
  }

  return (
    <div className="space-y-8">
      <RoadmapItemForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
      <div className="max-w-2xl border-t pt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete roadmap item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete roadmap item</DialogTitle>
              <DialogDescription>
                This removes the item and all associated votes. This cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete().catch(() => undefined);
                  }}
                >
                  Delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
