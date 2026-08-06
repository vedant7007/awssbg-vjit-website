"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { signInWithUsername } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/brand/LogoMark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/*
 * Team-only sign-in. Members use the handle + password their team provided;
 * there are no public accounts. On success we exchange the ID token for a
 * server session cookie, then route to `next` (or /console).
 */
export function SignInClient() {
  const router = useRouter();
  const params = useSearchParams();
  // Only honor internal, single-slash paths — never an absolute/`//host` URL.
  const rawNext = params.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : routes.console;

  const [handle, setHandle] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim() || !password) return;
    setPending(true);
    const ok = await signInWithUsername(handle, password);
    if (ok) {
      toast.success("Signed in");
      router.replace(next);
      router.refresh();
    } else {
      toast.error("Wrong handle or password.");
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <span className="bg-orange/10 mb-2 grid size-14 place-items-center rounded-2xl">
          <LogoMark className="size-8" />
        </span>
        <CardTitle className="text-2xl">Team sign in</CardTitle>
        <CardDescription>
          Use the handle and password your team gave you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
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
          <Button
            type="submit"
            disabled={pending}
            className="mt-1 w-full rounded-full"
            size="lg"
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-muted-foreground mt-5 text-center text-xs leading-relaxed">
          For core members only. Not on the team?{" "}
          <a href={routes.join} className="text-orange hover:underline">
            Join the community
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}
