/*
 * Owner: Hanu
 * Status: skeleton
 * Acceptance criteria:
 *   - Full roadmap CRUD mirroring /admin/members.
 *   - Manage status transitions; voteCount is read-only here (mutated by votes).
 * Reference: src/app/admin/members/page.tsx (the reference CRUD).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { safe } from "@/lib/utils/safe";
import { listRoadmapItems } from "@/lib/firestore/roadmap";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { RoadmapTable } from "@/components/admin/RoadmapTable";

export const metadata: Metadata = { title: "Roadmap | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminRoadmapPage() {
  const items = await safe(listRoadmapItems(), [], "admin:roadmap");

  return (
    <PageShell
      eyebrow="Reference CRUD"
      title="Roadmap"
      description="The full create, read, update, delete pattern. Every other admin CRUD copies this."
      actions={
        <Button asChild>
          <Link href={routes.adminRoadmapNew}>
            <Plus className="size-4" />
            Add roadmap item
          </Link>
        </Button>
      }
    >
      <RoadmapTable items={items} />
    </PageShell>
  );
}
