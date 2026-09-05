import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { getViewer } from "@/lib/auth/viewer";
import { routes } from "@/lib/constants/routes";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { AppNav } from "@/components/console/AppNav";

/** The one authenticated shell — used for everyone. Admin areas render in this
 * same shell (see the admin layout), so it never feels like a second app. */
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(routes.console);

  // First sign-in: force setting a personal password before anything else.
  const viewer = await getViewer();
  if (viewer?.mustChangePassword) redirect(routes.welcome);

  return (
    <div className="min-h-dvh">
      <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex shrink-0 items-center gap-2.5">
              <Link href={routes.home} className="rounded-sm">
                <Logo />
              </Link>
              {viewer?.isAdmin ? (
                <Badge className="bg-orange/15 text-orange border-0">
                  Admin
                </Badge>
              ) : viewer?.isLead ? (
                <Badge variant="secondary">Lead</Badge>
              ) : null}
            </div>
            <div className="min-w-0">
              <AppNav isAdmin={viewer?.isAdmin ?? false} />
            </div>
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}
