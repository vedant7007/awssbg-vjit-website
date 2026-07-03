"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/lib/constants/routes";
import { updateMember, deleteMember } from "@/lib/firestore/members";
import type { MemberFormValues } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MemberForm } from "@/components/forms/MemberForm";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditMemberForm({
  id,
  initialValues,
}: {
  id: string;
  initialValues: MemberFormValues;
}) {
  const router = useRouter();

  async function handleSubmit(values: MemberFormValues) {
    try {
      await updateMember(id, values);
      toast.success("Member updated");
      router.push(routes.adminMembers);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update member",
      );
    }
  }

  async function handleDelete() {
    try {
      await deleteMember(id);
      toast.success("Member removed");
      router.push(routes.adminMembers);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete member",
      );
    }
  }

  return (
    <div className="space-y-8">
      <MemberForm
        defaultValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
      <div className="max-w-2xl border-t pt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete member</DialogTitle>
              <DialogDescription>
                This removes the profile and frees the username. This cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete().catch(() => undefined);
                  }}
                >
                  Delete
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
