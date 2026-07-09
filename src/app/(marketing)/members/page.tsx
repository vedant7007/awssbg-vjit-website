import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { getPublicMembers } from "@/lib/firestore/members.server";
import { PageShell } from "@/components/layout/PageShell";
import { MembersDirectoryClient } from "./MembersDirectoryClient";
import { mockMembers } from "@/lib/constants/mock-members";

export const metadata: Metadata = {
  title: "Members",
  description: "The people of AWS SBG VJIT.",
};

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  // Fetch members from Firestore database
  const dbMembers = await safe(getPublicMembers(200), [], "members:list");

  // Fallback to local mock database if Firestore is empty
  const members = dbMembers.length > 0 ? dbMembers : mockMembers;

  return (
    <PageShell
      eyebrow="The community"
      title="Members Directory"
      description="Meet the builders, innovators, and cloud engineers of AWS Student Builder Group at VJIT."
    >
      <MembersDirectoryClient initialMembers={members} />
    </PageShell>
  );
}
