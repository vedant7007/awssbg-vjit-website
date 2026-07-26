"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { signInWithGoogle } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/*
 * Owner: Jashwanth (polish)
 * Google is the only provider. On success we exchange the ID token for a server
 * session cookie, then route to `next` (or /console). New members without a
 * member doc should be sent to /console/profile to complete onboarding;
 * TODO(Jashwanth): add that first-run redirect once the profile flow lands.
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
  const [pending, setPending] = React.useState(false);

  async function handleSignIn() {
    setPending(true);
    const ok = await signInWithGoogle();
    if (ok) {
      toast.success("Signed in");
      router.replace(next);
      router.refresh();
    } else {
      toast.error("Sign in failed. Please try again.");
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to access your console, tickets, and profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleSignIn}
          disabled={pending}
          className="w-full"
          size="lg"
        >
          {pending ? "Signing in..." : "Continue with Google"}
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          By continuing you agree to the AWS SBG VJIT code of conduct.
        </p>
      </CardContent>
    </Card>
  );
}
