/*
 * Owner: Akshithi
 * Status: skeleton (reads wired via lib/firestore/projects.ts)
 * Acceptance criteria:
 *   - Grid of ProjectCard with a stack filter.
 *   - Featured projects surfaced first.
 * Reference: src/app/(marketing)/page.tsx featured projects section.
 */
import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { listProjects } from "@/lib/firestore/projects";
import { RouteSkeleton } from "@/components/feedback/RouteSkeleton";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects built and shipped by AWS SBG VJIT members.",
  alternates: {
    canonical: "/projects",
  },
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await safe(listProjects(), [], "projects:list");

  return (
    <div className="pt-16">
      <RouteSkeleton
        eyebrow="Shipped"
        title="Projects"
        owner="Akshithi"
        reference="src/app/(marketing)/page.tsx"
        criteria={[
          "Grid of ProjectCard with a stack filter.",
          "Surface featured projects first.",
          "Empty state when there are no projects.",
        ]}
      >
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects yet"
            description="Add projects in admin to showcase them here."
          />
        )}
      </RouteSkeleton>
    </div>
  );
}
