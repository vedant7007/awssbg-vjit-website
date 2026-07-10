import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { getPublicMembers } from "@/lib/firestore/members.server";
import { PageShell } from "@/components/layout/PageShell";
import { MembersDirectoryClient } from "./MembersDirectoryClient";
import type { Member } from "@/lib/types";

export type MemberView = Omit<Member, "createdAt" | "updatedAt">;

export const metadata: Metadata = {
  title: "Members",
  description: "The people of AWS SBG VJIT.",
};

export const dynamic = "force-dynamic";

// Strip non-serializable fields (like functions/Timestamps) before passing to Client Component
function serializeMember(member: Member): MemberView {
  return {
    id: member.id,
    username: member.username,
    displayName: member.displayName,
    email: member.email,
    photoURL: member.photoURL,
    role: member.role,
    team: member.team,
    cohortYear: member.cohortYear,
    batchYear: member.batchYear,
    branch: member.branch,
    bio: member.bio,
    skills: member.skills,
    socials: member.socials,
    isPublic: member.isPublic,
  };
}

export default async function MembersPage() {
  // Fetch members from Firestore database
  const dbMembers = await safe(getPublicMembers(200), [], "members:list");

  // Map and serialize members directly (no mock fallback data)
  const members = dbMembers.map(serializeMember);

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
