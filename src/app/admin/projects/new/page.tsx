import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { NewProjectForm } from "@/components/admin/NewProjectForm";

export const metadata: Metadata = { title: "Add project | Admin" };

export default function NewProjectPage() {
  return (
    <PageShell
      eyebrow="Projects"
      title="Add project"
      description="Create a new showcase project. All writes go through the typed Firestore helpers."
    >
      <NewProjectForm />
    </PageShell>
  );
}
