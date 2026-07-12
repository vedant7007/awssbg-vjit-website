import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { safe } from "@/lib/utils/safe";
import { getProjectById } from "@/lib/firestore/projects.server";
import { PageShell } from "@/components/layout/PageShell";
import { EditProjectForm } from "@/components/admin/EditProjectForm";

export const metadata: Metadata = { title: "Edit project | Admin" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await safe(getProjectById(id), null, "admin:project:read");

  if (!project) notFound();

  return (
    <PageShell
      eyebrow="Projects"
      title="Edit project"
      description={`Updating ${project.title}`}
    >
      <EditProjectForm
        id={project.id}
        initialValues={{
          slug: project.slug,
          title: project.title,
          tagline: project.tagline,
          description: project.description,
          coverImage: project.coverImage,
          stack: project.stack,
          contributors: project.contributors,
          repoUrl: project.repoUrl,
          liveUrl: project.liveUrl,
          architectureDiagram: project.architectureDiagram,
          featured: project.featured,
        }}
      />
    </PageShell>
  );
}
