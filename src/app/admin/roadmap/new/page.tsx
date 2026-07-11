import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { NewRoadmapItemForm } from "@/components/admin/NewRoadmapItemForm";

export const metadata: Metadata = { title: "Add roadmap item | Admin" };

export default function NewRoadmapItemPage() {
  return (
    <PageShell
      eyebrow="Roadmap"
      title="Add roadmap item"
      description="Create a roadmap item for members to vote on."
    >
      <NewRoadmapItemForm />
    </PageShell>
  );
}
