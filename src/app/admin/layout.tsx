import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { requireAdmin } from "@/lib/auth/server";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "./AdminNav";

/** Admin shell. Server-side admin-claim gate via requireAdmin. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin-claim gate. The middleware only checks a cookie exists;
  // this verifies the session and the `admin` custom claim before any admin
  // page renders (which read via the Admin SDK, bypassing Firestore rules).
  await requireAdmin(routes.admin);

  return (
    <div className="min-h-dvh">
      <header className="bg-ink text-paper sticky top-0 z-30 border-b">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex shrink-0 items-center gap-3">
              <Link href={routes.home} className="rounded-sm">
                <Logo variant="mono" />
              </Link>
              <Badge className="bg-orange text-ink gap-1">
                <ShieldCheck className="size-3" />
                Admin
              </Badge>
            </div>
            <AdminNav />
          </div>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}
