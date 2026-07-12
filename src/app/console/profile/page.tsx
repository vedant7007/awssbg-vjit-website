import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/server";
import { getMemberById } from "@/lib/firestore/members.server";
import { routes } from "@/lib/constants/routes";
import { PageShell } from "@/components/layout/PageShell";
import type { MemberFormValues } from "@/lib/types";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = { title: "Profile | Console" };
export const dynamic = "force-dynamic";

const CURRENT_YEAR = 2026;

export default async function ConsoleProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.signinNext(routes.consoleProfile));

  const member = await getMemberById(user.uid);
  const isNew = member === null;

  const initialValues: MemberFormValues = member
    ? {
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
      }
    : {
        username: "",
        displayName: user.name ?? "",
        email: user.email ?? "",
        photoURL: user.picture,
        role: "member",
        team: null,
        cohortYear: CURRENT_YEAR,
        batchYear: CURRENT_YEAR + 2,
        branch: "",
        bio: "",
        skills: [],
        socials: {},
        isPublic: true,
      };

  return (
    <PageShell
      eyebrow="Console"
      title={isNew ? "Complete your profile" : "Your profile"}
      description={
        isNew
          ? "Set up your public member profile."
          : "Update how you appear across the site."
      }
    >
      <ProfileClient
        uid={user.uid}
        initialValues={initialValues}
        isNew={isNew}
      />
    </PageShell>
  );
}
