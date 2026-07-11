"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { collection, doc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { routes } from "@/lib/constants/routes";
import { createProject } from "@/lib/firestore/projects";
import type { ProjectFormValues } from "@/lib/types";
import { ProjectForm } from "@/components/forms/ProjectForm";

export function NewProjectForm() {
  const router = useRouter();

  async function handleSubmit(values: ProjectFormValues) {
    // Generate a random Firestore document ID for the project
    const newId = doc(collection(db, "projects")).id;
    try {
      await createProject(newId, values);
      toast.success(`Created project ${values.title}`);
      router.push(routes.adminProjects);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create project",
      );
    }
  }

  return (
    <div className="space-y-8">
      <ProjectForm onSubmit={handleSubmit} submitLabel="Create project" />
    </div>
  );
}
