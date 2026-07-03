"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/lib/constants/routes";
import { createMember } from "@/lib/firestore/members";
import type { MemberFormValues } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberForm } from "@/components/forms/MemberForm";

/**
 * Admin create flow. A member doc id must be the member's Firebase Auth UID, so
 * we collect it explicitly here. Once the console profile flow ships, most
 * members will self-create on first sign-in and this stays the admin escape hatch.
 */
export function NewMemberForm() {
  const router = useRouter();
  const [uid, setUid] = React.useState("");
  const [uidError, setUidError] = React.useState<string | null>(null);

  async function handleSubmit(values: MemberFormValues) {
    if (uid.trim().length < 6) {
      setUidError("Enter the member's Firebase Auth UID");
      return;
    }
    try {
      await createMember(uid.trim(), values);
      toast.success(`Added ${values.displayName}`);
      router.push(routes.adminMembers);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create member",
      );
    }
  }

  return (
    <div className="space-y-8">
      <div className="max-w-md space-y-2">
        <Label htmlFor="uid">Firebase Auth UID</Label>
        <Input
          id="uid"
          value={uid}
          onChange={(e) => {
            setUid(e.target.value);
            setUidError(null);
          }}
          placeholder="e.g. 3kQ2...z9"
          aria-invalid={Boolean(uidError)}
        />
        {uidError ? (
          <p className="text-destructive text-sm font-medium">{uidError}</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            The member signs in once with Google; copy their UID from Firebase
            Auth.
          </p>
        )}
      </div>
      <MemberForm onSubmit={handleSubmit} submitLabel="Create member" />
    </div>
  );
}
