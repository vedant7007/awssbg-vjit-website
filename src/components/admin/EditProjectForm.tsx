"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/lib/constants/routes";
import { updateProject, deleteProject } from "@/lib/firestore/projects";
import type { ProjectFormValues } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/forms/ProjectForm";
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

export function EditProjectForm({
  id,
  initialValues,
}: {
  id: string;
  initialValues: ProjectFormValues;
}) {
  const router = useRouter();

  async function handleSubmit(values: ProjectFormValues) {
    try {
      await updateProject(id, values);
      toast.success("Project updated");
      router.push(routes.adminProjects);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update project",
      );
    }
  }

  async function handleDelete() {
    try {
      await deleteProject(id);
      toast.success("Project removed");
      router.push(routes.adminProjects);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete project",
      );
    }
  }

  return (
    <div className="space-y-8">
      <ProjectForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
      <div className="max-w-2xl border-t pt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete project</DialogTitle>
              <DialogDescription>
                This removes the project and frees its slug permanently. This
                cannot be undone.
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
