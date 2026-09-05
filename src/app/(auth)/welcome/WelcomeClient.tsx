"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, ShieldCheck } from "lucide-react";

import { changePassword } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/brand/LogoMark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { finishFirstLoginAction } from "./actions";

const RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Za-z]/.test(p), label: "A letter" },
  { test: (p: string) => /\d/.test(p), label: "A number" },
];

export function WelcomeClient({ name }: { name: string }) {
  const router = useRouter();
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const firstName = name.split(/\s+/)[0] ?? name;
  const passed = RULES.filter((r) => r.test(pw1)).length;
  const strong = passed === RULES.length;
  const match = pw1.length > 0 && pw1 === pw2;
  const ready = strong && match && !pending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!strong) {
      toast.error("Pick a stronger password.");
      return;
    }
    if (!match) {
      toast.error("Passwords don't match.");
      return;
    }
    setPending(true);

    const changed = await changePassword(pw1);
    if (!changed) {
      setPending(false);
      toast.error(
        "Couldn't set your password. Sign out, sign in again, then retry.",
      );
      return;
    }
    const res = await finishFirstLoginAction();
    if (!res.ok) {
      setPending(false);
      toast.error(
        "Password saved, but finishing setup failed. Refresh and try once more.",
      );
      return;
    }
    toast.success("You're all set 🎉");
    router.replace(routes.console);
    router.refresh();
  }

  return (
    <Card className="glass-panel w-full max-w-sm rounded-2xl border-0">
      <CardHeader className="items-center text-center">
        <span className="bg-orange/10 mb-2 grid size-14 place-items-center rounded-2xl">
          <LogoMark className="size-8" />
        </span>
        <CardTitle className="text-2xl">Welcome, {firstName} 👋</CardTitle>
        <CardDescription>
          Set your own password to finish setting up your account. You
          won&apos;t need the starting one again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pw1">New password</Label>
            <PasswordInput
              id="pw1"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              autoComplete="new-password"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw2">Confirm password</Label>
            <PasswordInput
              id="pw2"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <ul className="grid gap-1 py-1">
            {RULES.map((r) => {
              const ok = r.test(pw1);
              return (
                <li
                  key={r.label}
                  className={
                    ok
                      ? "text-success flex items-center gap-2 text-xs"
                      : "text-muted-foreground flex items-center gap-2 text-xs"
                  }
                >
                  <Check
                    className={ok ? "size-3.5" : "size-3.5 opacity-30"}
                    aria-hidden
                  />
                  {r.label}
                </li>
              );
            })}
            <li
              className={
                match
                  ? "text-success flex items-center gap-2 text-xs"
                  : "text-muted-foreground flex items-center gap-2 text-xs"
              }
            >
              <Check
                className={match ? "size-3.5" : "size-3.5 opacity-30"}
                aria-hidden
              />
              Passwords match
            </li>
          </ul>

          <Button
            type="submit"
            disabled={!ready}
            className="mt-1 w-full rounded-full"
            size="lg"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {pending ? "Setting up…" : "Set password & continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
