"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { signInWithUsername, signInWithGoogle } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/*
 * Members sign in with their handle + password (provisioned by the team). Admins
 * can also use Google. On success we exchange the ID token for a server session
 * cookie, then route to `next` (or /console).
 */
export function SignInClient() {
  const router = useRouter();
  const params = useSearchParams();
  // Only honor internal, single-slash paths — never an absolute/`//host` URL —
  // so a crafted ?next= can't drive a post-login redirect to another site.
  const rawNext = params.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : routes.console;

  const [handle, setHandle] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const onSuccess = () => {
    toast.success("Signed in");
    router.replace(next);
    router.refresh();
  };

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim() || !password) return;
    setPending(true);
    const ok = await signInWithUsername(handle, password);
    if (ok) onSuccess();
    else {
      toast.error("Wrong handle or password.");
      setPending(false);
    }
  }

  async function handleGoogle() {
    setPending(true);
    const ok = await signInWithGoogle();
    if (ok) onSuccess();
    else {
      toast.error("Google sign in failed. Please try again.");
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in with the handle and password your team gave you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handlePassword} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. ruthvik"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full" size="lg">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={pending}
          variant="outline"
          className="w-full"
        >
          Continue with Google
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          By continuing you agree to the AWS SBG VJIT code of conduct.
        </p>
      </CardContent>
    </Card>
  );
}
