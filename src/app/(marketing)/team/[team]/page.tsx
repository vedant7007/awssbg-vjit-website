import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { CORE, LEADS, TEAMS, type TeamKey } from "@/lib/constants/team";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { TeamLeadCard } from "@/components/team/TeamLeadCard";
import { CoreRoster } from "@/components/team/CoreRoster";

type Params = { team: string };

/** One page per team, same shape for all five. */
export function generateStaticParams() {
  return TEAMS.map((t) => ({ team: t.key }));
}

function resolve(key: string) {
  const meta = TEAMS.find((t) => t.key === key);
  if (!meta) return null;
  const teamKey = meta.key as TeamKey;
  return {
    meta,
    lead: LEADS.find((l) => l.team === teamKey) ?? null,
    members: CORE.filter((m) => m.team === teamKey),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { team } = await params;
  const found = resolve(team);
  if (!found) return { title: "Team" };
  return {
    title: `${found.meta.label} team`,
    description: found.meta.charter,
  };
}

export default async function TeamSubPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { team } = await params;
  const found = resolve(team);
  if (!found) notFound();

  const { meta, lead, members } = found;

  return (
    <div
      className="pt-28 md:pt-36"
      style={{ "--accent": meta.color } as React.CSSProperties}
    >
      <Container>
        <Reveal>
          <Link
            href={routes.team}
            className="text-muted-foreground hover:text-foreground group inline-flex items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase transition-colors"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to team
          </Link>

          <p
            className="mt-8 font-mono text-xs tracking-[0.2em] uppercase"
            style={{ color: meta.color }}
          >
            {meta.wrap[0]}
            {meta.label}
            {meta.wrap[1]}
          </p>
          <h1 className="font-display mt-3 text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.92] font-bold tracking-[-0.04em] uppercase">
            {meta.label}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed">
            {meta.charter}
          </p>
        </Reveal>
      </Container>

      {/* The lead sits alone and larger, then the team beneath. */}
      {lead ? (
        <Container>
          <section className="border-b py-14 lg:py-20">
            <Reveal>
              <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
                Team lead
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-8">
                <TeamLeadCard member={lead} />
              </div>
            </Reveal>
          </section>
        </Container>
      ) : null}

      <Container>
        <section className="py-14 lg:py-20">
          <Reveal>
            <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
              Team members
            </p>
            <h2 className="font-display mt-4 text-[clamp(1.5rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em]">
              {members.length} {members.length === 1 ? "member" : "members"} on{" "}
              {meta.label}
            </h2>
          </Reveal>

          <div className="mt-10">
            {members.length > 0 ? (
              <CoreRoster members={members} showFilters={false} />
            ) : (
              <p className="text-muted-foreground">
                No members listed on this team yet.
              </p>
            )}
          </div>

          <Reveal delay={0.15}>
            <p className="text-muted-foreground mt-16 font-mono text-[0.7rem] tracking-[0.2em] uppercase">
              Other teams
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              {TEAMS.filter((t) => t.key !== meta.key).map((t) => (
                <Link
                  key={t.key}
                  href={routes.teamPage(t.key)}
                  className="text-muted-foreground hover:text-foreground font-mono text-xs tracking-[0.15em] uppercase transition-colors"
                  style={{ borderColor: t.color }}
                >
                  {t.wrap[0]}
                  {t.label}
                  {t.wrap[1]}
                </Link>
              ))}
              <Link
                href={routes.teamAll}
                className="text-muted-foreground hover:text-foreground font-mono text-xs tracking-[0.15em] uppercase transition-colors"
              >
                Everyone →
              </Link>
            </div>
          </Reveal>
        </section>
      </Container>
    </div>
  );
}

export const dynamicParams = false;
