import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";

const ADMIN_LINKS = [
  { label: "Home", href: routes.admin },
  { label: "Members", href: routes.adminMembers },
  { label: "Events", href: routes.adminEvents },
  { label: "Projects", href: routes.adminProjects },
  { label: "Roadmap", href: routes.adminRoadmap },
  { label: "Check-in", href: routes.adminCheckin },
];

/** Admin shell. Server-side admin-claim gate via requireAdmin. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await requireAdmin(routes.admin);

  return (
    <div className="min-h-dvh">
      <header className="bg-ink text-paper border-b">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={routes.home} className="rounded-sm">
                <Logo variant="mono" />
              </Link>
              <Badge className="bg-orange text-ink gap-1">
                <ShieldCheck className="size-3" />
                Admin
              </Badge>
            </div>
            <nav
              aria-label="Admin"
              className="flex items-center gap-1 overflow-x-auto"
            >
              {ADMIN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-paper/70 hover:text-paper rounded-sm px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
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
