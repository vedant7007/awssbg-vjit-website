"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { updateMember, deleteMember } from "@/lib/firestore/members";
import { signOut } from "@/lib/auth/client";
import type { MemberFormValues } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

export function SettingsClient({
  uid,
  email,
  values,
}: {
  uid: string;
  email: string | null;
  values: MemberFormValues | null;
}) {
  const router = useRouter();
  const [isPublic, setIsPublic] = React.useState(values?.isPublic ?? false);
  const [savingVisibility, setSavingVisibility] = React.useState(false);

  async function handleVisibility(next: boolean) {
    if (!values) return;
    setIsPublic(next);
    setSavingVisibility(true);
    try {
      await updateMember(uid, { ...values, isPublic: next });
      toast.success(next ? "Profile is now public" : "Profile is now private");
      router.refresh();
    } catch (error) {
      setIsPublic(!next);
      toast.error(
        error instanceof Error ? error.message : "Could not update visibility",
      );
    } finally {
      setSavingVisibility(false);
    }
  }

  async function handleLeave() {
    try {
      await deleteMember(uid);
      toast.success("Your profile has been removed");
      await signOut();
      router.push(routes.home);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not remove your profile",
      );
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="eyebrow">Account</h2>
        <div className="flex items-center justify-between rounded-sm border p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Signed in as</p>
            <p className="text-muted-foreground truncate text-sm">
              {email ?? "your account"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              signOut()
                .then(() => router.push(routes.home))
                .catch(() => undefined);
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </section>

      {values ? (
        <section className="space-y-4">
          <h2 className="eyebrow">Privacy</h2>
          <div className="flex items-center justify-between rounded-sm border p-4">
            <div className="space-y-0.5 pr-4">
              <Label>Public profile</Label>
              <p className="text-muted-foreground text-sm">
                When on, anyone can view your profile at your username.
              </p>
            </div>
            <Switch
              checked={isPublic}
              disabled={savingVisibility}
              onCheckedChange={handleVisibility}
            />
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="eyebrow">Privacy</h2>
          <p className="text-muted-foreground rounded-sm border border-dashed p-4 text-sm">
            Complete your profile to manage visibility.
          </p>
        </section>
      )}

      {values ? (
        <section className="space-y-4">
          <h2 className="eyebrow text-danger">Danger zone</h2>
          <div className="border-danger/30 flex flex-col gap-4 rounded-sm border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Leave the group</p>
              <p className="text-muted-foreground text-sm">
                Removes your member profile and frees your username. This cannot
                be undone.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="shrink-0">
                  Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave AWS SBG VJIT?</DialogTitle>
                  <DialogDescription>
                    This removes your member profile and frees your username.
                    You will be signed out. This cannot be undone.
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
                        handleLeave().catch(() => undefined);
                      }}
                    >
                      Leave the group
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      ) : null}
    </div>
  );
}
