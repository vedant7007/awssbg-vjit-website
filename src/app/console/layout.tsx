import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { getViewer } from "@/lib/auth/viewer";
import { routes } from "@/lib/constants/routes";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { ConsoleNav } from "./ConsoleNav";

/** Authenticated console shell. Server-side auth gate; middleware is the first pass. */
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
            <Link href={routes.home} className="rounded-sm">
              <Logo variant="compact" />
            </Link>
            <div className="overflow-x-auto">
              <ConsoleNav />
            </div>
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}
