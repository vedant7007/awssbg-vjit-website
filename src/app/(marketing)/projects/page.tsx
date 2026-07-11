import type { Metadata } from "next";
import { Suspense } from "react";

import { safe } from "@/lib/utils/safe";
import { listProjects } from "@/lib/firestore/projects.server";
import { getMemberById } from "@/lib/firestore/members.server";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectsClient } from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects | AWS Student Builder Group",
  description: "Explore the awesome projects built by our members.",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await safe(listProjects(), [], "marketing:projects");

  const serializedProjects = await Promise.all(
    projects.map(async (p) => {
      const contributors = await Promise.all(
        p.contributors.map(async (uid) => {
          const member = await safe(
            getMemberById(uid),
            null,
            "marketing:projects:contributor",
          );
          return member
            ? {
                id: member.id,
                displayName: member.displayName,
                photoURL: member.photoURL,
                github: member.socials?.github,
              }
            : null;
        }),
      );

      return {
        ...p,
        createdAt: p.createdAt?.toDate().toISOString() ?? "",
        updatedAt: p.updatedAt?.toDate().toISOString() ?? "",
        populatedContributors: contributors.filter((c) => c !== null),
      };
    }),
  );

  return (
    <PageShell
      eyebrow="Showcase"
      title="Our Projects"
      description="Explore the awesome projects built by our members. Filter by tech stack to see how we build."
      className="pb-24"
    >
      <Suspense
        fallback={<div className="bg-muted h-96 animate-pulse rounded-sm" />}
      >
        <ProjectsClient projects={serializedProjects} />
      </Suspense>
    </PageShell>
  );
}
