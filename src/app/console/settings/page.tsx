import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/server";
import { getMemberById } from "@/lib/firestore/members.server";
import { routes } from "@/lib/constants/routes";
import { safe } from "@/lib/utils/safe";
import { PageShell } from "@/components/layout/PageShell";
import type { MemberFormValues } from "@/lib/types";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = { title: "Settings | Console" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(routes.signinNext(routes.consoleSettings));

  const member = await safe(getMemberById(user.uid), null, "settings:member");

  const values: MemberFormValues | null = member
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
    : null;

  return (
    <PageShell
      eyebrow="Console"
      title="Settings"
      description="Manage your account, privacy, and membership."
    >
      <SettingsClient uid={user.uid} email={user.email} values={values} />
    </PageShell>
  );
}
