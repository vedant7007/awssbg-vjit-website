import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { safe } from "@/lib/utils/safe";
import { getRoadmapItemById } from "@/lib/firestore/roadmap";
import type { RoadmapItemFormValues } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { EditRoadmapItemForm } from "@/components/admin/EditRoadmapItemForm";

export const metadata: Metadata = { title: "Edit roadmap item | Admin" };
export const dynamic = "force-dynamic";

export default async function EditRoadmapItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await safe(
    getRoadmapItemById(id),
    null,
    "admin:editRoadmapItem",
  );
  if (!item) notFound();

  const initialValues: RoadmapItemFormValues = {
    title: item.title,
    description: item.description,
    quarter: item.quarter,
    status: item.status,
    category: item.category,
  };

  return (
    <PageShell
      eyebrow="Roadmap"
      title={`Edit ${item.title}`}
      description={item.description}
    >
      <EditRoadmapItemForm id={item.id} initialValues={initialValues} />
    </PageShell>
  );
}
