import * as React from "react";
import Link from "next/link";

import { requireAuth } from "@/lib/auth/server";
import { routes } from "@/lib/constants/routes";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";

const CONSOLE_LINKS = [
  { label: "Overview", href: routes.console },
  { label: "Tasks", href: routes.consoleTasks },
  { label: "Profile", href: routes.consoleProfile },
  { label: "My events", href: routes.consoleMyEvents },
  { label: "Settings", href: routes.consoleSettings },
];

/** Authenticated console shell. Server-side auth gate; middleware is the first pass. */
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(routes.console);

  return (
    <div className="min-h-dvh">
      <header className="bg-paper-warm border-b">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href={routes.home} className="rounded-sm">
              <Logo variant="compact" />
            </Link>
            <nav aria-label="Console" className="flex items-center gap-1">
              {CONSOLE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground rounded-sm px-3 py-2 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}
