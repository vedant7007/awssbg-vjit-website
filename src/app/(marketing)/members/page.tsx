/*
 * Owner: Aarush
 * Status: skeleton (reads all public members)
 * Acceptance criteria:
 *   - Searchable, filterable directory of public members.
 *   - Filter by role, team, batch year, skills.
 * Reference: src/components/admin/MembersTable.tsx (client filtering pattern).
 */
import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { getPublicMembers } from "@/lib/firestore/members.server";
import { RouteSkeleton } from "@/components/feedback/RouteSkeleton";
import { MemberCard } from "@/components/cards/MemberCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export const metadata: Metadata = {
  title: "Members",
  description: "The people of AWS SBG VJIT.",
  alternates: {
    canonical: "/members",
  },
};

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await safe(getPublicMembers(200), [], "members:list");

  return (
    <div className="pt-16">
      <RouteSkeleton
        eyebrow="The people"
        title="Members"
        owner="Aarush"
        reference="src/components/admin/MembersTable.tsx"
        criteria={[
          "Searchable directory with role, team, batch, and skills filters.",
          "Responsive grid of member cards.",
          "Empty and no-match states.",
        ]}
      >
        {members.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <EmptyState title="No public members yet" />
        )}
      </RouteSkeleton>
    </div>
  );
}
