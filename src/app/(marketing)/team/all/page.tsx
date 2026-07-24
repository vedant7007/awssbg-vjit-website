import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { CAPTAIN, CORE, LEADS, TEAM_COUNTS } from "@/lib/constants/team";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { CoreRoster } from "@/components/team/CoreRoster";

export const metadata: Metadata = {
  title: "Full team",
  description:
    "Every member of AWS Student Builder Group VJIT — leads and core team, across all five teams.",
};

/** Leads first, then core, so the roster reads top-down like the org does. */
const EVERYONE = [CAPTAIN, ...LEADS, ...CORE];

export default function FullTeamPage() {
  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <Reveal>
          <Link
            href={routes.team}
            className="text-muted-foreground hover:text-foreground group inline-flex items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase transition-colors"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to team
          </Link>

          <h1 className="font-display mt-7 text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.92] font-bold tracking-[-0.04em] uppercase">
            Everyone
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed">
            All {EVERYONE.length} of us — the captain, {TEAM_COUNTS.leads} team
            leads and {TEAM_COUNTS.core} core members. Tap anyone to see their
            profile.
          </p>
        </Reveal>

        <section className="py-14 lg:py-20">
          <CoreRoster members={EVERYONE} />
        </section>
      </Container>
    </div>
  );
}
