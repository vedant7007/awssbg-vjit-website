import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { safe } from "@/lib/utils/safe";
import { listProjects } from "@/lib/firestore/projects.server";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  ProjectsTable,
  type ProjectRow,
} from "@/components/admin/ProjectsTable";

import { getMemberById } from "@/lib/firestore/members.server";

export const metadata: Metadata = { title: "Projects | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await safe(listProjects(), [], "admin:projects");

  const rows: ProjectRow[] = await Promise.all(
    projects.map(async (p) => {
      const contributors = await Promise.all(
        p.contributors.map(async (uid) => {
          const member = await safe(
            getMemberById(uid),
            null,
            "admin:projects:contributor",
          );
          return member
            ? {
                id: member.id,
                displayName: member.displayName,
                photoURL: member.photoURL,
                github: member.socials?.github || undefined,
              }
            : null;
        }),
      );

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        coverImage: p.coverImage || null,
        featured: p.featured,
        repoUrl: p.repoUrl,
        liveUrl: p.liveUrl,
        contributors: contributors.filter((c) => c !== null),
      };
    }),
  );

  return (
    <PageShell
      eyebrow="Portfolio"
      title="Projects"
      description="Manage the student builder showcase. Featured projects appear on the landing page."
      actions={
        <Button asChild>
          <Link href={routes.adminProjectNew}>
            <Plus className="size-4" />
            Add project
          </Link>
        </Button>
      }
    >
      <ProjectsTable projects={rows} />
    </PageShell>
  );
}
