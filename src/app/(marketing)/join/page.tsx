/*
 * Owner: Laasya
 * Status: skeleton
 * Acceptance criteria:
 *   - Explain who can join and how, with a clear primary action to /signin.
 *   - What to expect after joining (complete profile in /console/profile).
 *   - No fabricated numbers or promises.
 * Reference: src/app/(marketing)/page.tsx closing CTA; /signin flow.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { RouteSkeleton } from "@/components/feedback/RouteSkeleton";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Join",
  description: "Join AWS SBG VJIT and start building on the cloud.",
  alternates: {
    canonical: "/join",
  },
};

export default function JoinPage() {
  return (
    <div className="pt-16">
      <RouteSkeleton
        eyebrow="Get started"
        title="Join AWS SBG VJIT"
        description="Anyone on campus who wants to build in the cloud is welcome."
        owner="Laasya"
        reference="src/app/(marketing)/page.tsx"
        criteria={[
          "Explain eligibility and the join steps clearly.",
          "Primary action to sign in, then complete the console profile.",
          "Set honest expectations; no invented stats.",
        ]}
      >
        <Button asChild size="lg">
          <Link href={routes.signin}>Sign in to get started</Link>
        </Button>
      </RouteSkeleton>
    </div>
  );
}
