"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { createMember, updateMember } from "@/lib/firestore/members";
import type { MemberFormValues } from "@/lib/types";
import { ProfileForm } from "@/components/forms/ProfileForm";

export function ProfileClient({
  uid,
  initialValues,
  isNew,
}: {
  uid: string;
  initialValues: MemberFormValues;
  isNew: boolean;
}) {
  const router = useRouter();
  const [username, setUsername] = React.useState(initialValues.username);

  async function handleSubmit(values: MemberFormValues) {
    try {
      if (isNew) {
        await createMember(uid, values);
        toast.success("Profile created. Welcome aboard.");
        router.push(routes.console);
      } else {
        await updateMember(uid, values);
        setUsername(values.username);
        toast.success("Profile saved.");
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save your profile",
      );
    }
  }

  return (
    <div className="space-y-6">
      {!isNew && username ? (
        <Link
          href={routes.member(username)}
          className="text-orange inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
        >
          View your public profile
          <ExternalLink className="size-3.5" />
        </Link>
      ) : null}
      {isNew ? (
        <div className="border-orange/30 bg-orange/5 rounded-sm border-l-2 px-4 py-3 text-sm">
          Welcome. Complete your profile to finish setting up your account.
        </div>
      ) : null}
      <ProfileForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={isNew ? "Create profile" : "Save changes"}
      />
    </div>
  );
}
