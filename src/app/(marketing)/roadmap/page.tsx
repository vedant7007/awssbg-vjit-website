/*
 * Owner: Hanu
 * Status: skeleton (reads roadmap items; voting is NOT built)
 * Acceptance criteria:
 *   - Board grouped by status; items grouped by quarter.
 *   - Upvote control wired to a transaction (roadmap_votes + voteCount).
 *     Enforce one vote per (itemId, userId). See lib/firestore/roadmap.ts TODOs.
 *   - Signed-out users are prompted to sign in before voting.
 * Reference: /admin/members transaction pattern; lib/firestore/members.ts.
 */
import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { listRoadmapItems } from "@/lib/firestore/roadmap";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { RoadmapBoard } from "@/components/roadmap/RoadmapBoard";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What AWS SBG VJIT is planning next. Vote on what matters.",
};

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const rawItems = await safe(listRoadmapItems(), [], "roadmap:list");

  // Strip Firestore Timestamps (class instances) before passing to the client
  // board, which only needs the plain fields.
  const items = rawItems.map(
    ({ createdAt: _createdAt, updatedAt: _updatedAt, ...rest }) => {
      void _createdAt;
      void _updatedAt;
      return rest;
    },
  );

  return (
    <div className="pt-16">
      <PageShell
        eyebrow="What's next"
        title="Roadmap"
        description="Vote on upcoming work, grouped by status and quarter."
      >
        {items.length > 0 ? (
          <>
            <div className="border-muted/40 bg-muted/60 text-muted-foreground rounded-3xl border p-5 text-sm">
              Members may vote once per idea. Sign in first so your vote is
              recorded in the club roadmap.
            </div>
            <RoadmapBoard items={items} />
          </>
        ) : (
          <div className="space-y-8">
            <EmptyState title="Roadmap coming soon" />
            <div className="border-muted/40 bg-muted/50 rounded-sm border p-6">
              <p className="text-muted-foreground mb-4">
                No roadmap items were found in Firestore. Add roadmap items via
                admin or deploy with seeded data.
              </p>
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
