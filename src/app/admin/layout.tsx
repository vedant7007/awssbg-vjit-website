import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";
import { requireAdmin } from "@/lib/auth/server";
import { getViewer } from "@/lib/auth/viewer";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { AppNav } from "@/components/console/AppNav";

/** Admin areas render in the SAME shell as the console — same header, same nav,
 * same look — so moving between "your space" and management never feels like a
 * different app. Only the gate differs: this verifies the admin claim. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(routes.admin);

  // First sign-in: force setting a personal password before anything else.
  const viewer = await getViewer();
  if (viewer?.mustChangePassword) redirect(routes.welcome);

  return (
    <div className="relative min-h-dvh">
      <div className="app-bg" aria-hidden />
      <header className="glass sticky top-0 z-30 border-b">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex shrink-0 items-center gap-2.5">
              <Link href={routes.home} className="rounded-sm">
                <Logo />
              </Link>
              <Badge className="bg-orange/15 text-orange border-0">Admin</Badge>
            </div>
            <div className="min-w-0">
              <AppNav isAdmin />
            </div>
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}
