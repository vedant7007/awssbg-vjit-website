import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { PROGRAMS, TRACKS, PERKS } from "@/lib/constants/club";
import { safe } from "@/lib/utils/safe";
import { initials } from "@/lib/utils/format";
import { getFeaturedEvent, listEvents } from "@/lib/firestore/events";
import {
  getFeaturedProjects,
  listProjects,
} from "@/lib/firestore/projects.server";
import {
  getPublicMembers,
  getMemberById,
} from "@/lib/firestore/members.server";
import type { Member } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { FadeUp } from "@/components/motion/FadeUp";
import { HeroGrid } from "@/components/home/HeroGrid";
import { EventCard } from "@/components/cards/EventCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { MemberCard } from "@/components/cards/MemberCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export const metadata: Metadata = {
  title: "Build the cloud, on campus",
  description:
    "AWS Student Builder Group at VJIT. Learn AWS, run real programs, ship projects to production, and grow with a community of student builders in Hyderabad.",
};

// Reads live Firestore data at request time; never prerendered at build.
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [
    featuredEvent,
    rawFeaturedProjects,
    publicMembers,
    allProjects,
    allEvents,
  ] = await Promise.all([
    safe(getFeaturedEvent(), null, "landing:featuredEvent"),
    safe(getFeaturedProjects(3), [], "landing:featuredProjects"),
    safe(getPublicMembers(100), [], "landing:members"),
    safe(listProjects(), [], "landing:projects"),
    safe(listEvents(), [], "landing:events"),
  ]);

  // Next upcoming event → hero countdown + featured block fallback.
  const upcoming = allEvents
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) => a.startAt.toDate().getTime() - b.startAt.toDate().getTime(),
    );
  const nextEv = upcoming[0] ?? null;
  const heroEvent = featuredEvent ?? nextEv;

  // Real leaderboard: rank public members by projects they contributed to.
  const contribCount = new Map<string, number>();
  for (const p of allProjects) {
    for (const uid of p.contributors ?? []) {
      contribCount.set(uid, (contribCount.get(uid) ?? 0) + 1);
    }
  }
  const memberById = new Map(publicMembers.map((m) => [m.id, m]));
  const leaderboard = [...contribCount.entries()]
    .map(([uid, count]) => ({ member: memberById.get(uid), count }))
    .filter((x): x is { member: Member; count: number } => Boolean(x.member))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const topCount = leaderboard[0]?.count ?? 1;

  // Crew = leadership + leads, falling back to the first members.
  const leadership = publicMembers.filter(
    (m) => m.role === "core" || m.role === "lead",
  );
  const crew = (leadership.length > 0 ? leadership : publicMembers).slice(0, 8);

  // Featured projects with contributor chips.
  const featuredProjects = await Promise.all(
    rawFeaturedProjects.map(async (p) => {
      const contributors = await Promise.all(
        p.contributors.map(async (uid) => {
          const member = await safe(
            getMemberById(uid),
            null,
            "landing:projects:contributor",
          );
          return member
            ? {
                id: member.id,
                displayName: member.displayName,
                photoURL: member.photoURL,
                github: member.socials?.github,
              }
            : null;
        }),
      );
      return {
        ...p,
        createdAt: p.createdAt?.toDate().toISOString() ?? "",
        updatedAt: p.updatedAt?.toDate().toISOString() ?? "",
        populatedContributors: contributors.filter((c) => c !== null),
      };
    }),
  );

  return (
    <>
      <HeroGrid />

      {/* Manifesto. */}
      <Section className="!pb-16">
        <FadeUp>
          <p className="eyebrow mb-6">{"// what this is"}</p>
          <p className="font-display max-w-4xl text-[clamp(1.5rem,3vw+0.5rem,2.5rem)] leading-[1.15] font-medium tracking-tight text-balance">
            A student-led AWS builder group at VJIT, Hyderabad. We run real
            programs, ship projects to production, and{" "}
            <span className="text-orange">
              take members from first login to certified and hired.
            </span>{" "}
            No gatekeeping — if you want to build on the cloud, you belong here.
          </p>
        </FadeUp>
      </Section>

      {/* 01 — Programs + next event. */}
      <Section className="!pt-0">
        <SectionLead
          index="01"
          eyebrow="What we run"
          title="Programs, not one-off meetups"
          description="A repeating calendar built to move you forward — foundations, camps, sprints, and a flagship community day."
        />

        <div className="mt-10">
          {heroEvent ? (
            <FadeUp>
              <EventCard event={heroEvent} featured />
            </FadeUp>
          ) : (
            <EmptyState
              title="Next event dropping soon"
              description="We're lining up the next session. Sign in to get notified."
              action={
                <Button asChild variant="outline">
                  <Link href={routes.events}>See all events</Link>
                </Button>
              }
            />
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program, i) => {
            const Icon = program.icon;
            return (
              <FadeUp key={program.key} index={i}>
                <article
                  className={`glow-card group flex h-full flex-col gap-3 rounded-sm p-6 ${
                    program.flagship ? "ring-orange/30 ring-1" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="text-orange size-6 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-muted-foreground font-mono text-[0.65rem] tracking-wide uppercase">
                      {program.cadence}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {program.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {program.blurb}
                  </p>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      {/* 02 — Proof: projects + leaderboard. */}
      <Section className="!pt-0">
        <SectionLead
          index="02"
          eyebrow="The proof"
          title="Shipped by students, running on AWS"
          description="Not tutorials — deployed projects with a name attached. The people who build the most show up here."
        />

        {featuredProjects.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <FadeUp key={project.id} index={i}>
                <ProjectCard project={project} className="h-full" />
              </FadeUp>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState title="First projects landing soon" />
          </div>
        )}

        {leaderboard.length > 0 ? (
          <FadeUp className="mt-12">
            <div className="glow-card rounded-sm p-6">
              <div className="mb-6 flex items-center gap-2">
                <Trophy className="text-orange size-5" />
                <h3 className="font-display text-lg font-semibold">
                  Top builders
                </h3>
                <span className="text-muted-foreground font-mono text-xs">
                  by projects shipped
                </span>
              </div>
              <ol className="space-y-3">
                {leaderboard.map((row, i) => (
                  <li key={row.member.id}>
                    <Link
                      href={routes.member(row.member.username)}
                      className="group hover:bg-muted/50 flex items-center gap-4 rounded-sm p-2 transition-colors"
                    >
                      <span
                        className={`w-6 shrink-0 text-center font-mono text-sm ${
                          i === 0 ? "text-orange" : "text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full font-mono text-xs">
                        {row.member.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.member.photoURL}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          initials(row.member.displayName)
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {row.member.displayName}
                        </span>
                        <span className="bg-muted mt-1 block h-1 overflow-hidden rounded-full">
                          <span
                            className="bg-orange block h-full rounded-full"
                            style={{
                              width: `${Math.max(
                                12,
                                (row.count / topCount) * 100,
                              )}%`,
                            }}
                          />
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-sm tabular-nums">
                        {row.count}
                        <span className="text-muted-foreground">
                          {" "}
                          {row.count === 1 ? "project" : "projects"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </FadeUp>
        ) : null}
      </Section>

      {/* 03 — The crew. */}
      {crew.length > 0 ? (
        <Section className="!pt-0">
          <SectionLead
            index="03"
            eyebrow="The crew"
            title="Run by students, for students"
            description="A captain, functional leads, and builders who keep the whole thing moving."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {crew.map((member, i) => (
              <FadeUp key={member.id} index={i}>
                <MemberCard member={member} />
              </FadeUp>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href={routes.members} className="group">
                Meet everyone
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Section>
      ) : null}

      {/* 04 — Tracks (learning, secondary). */}
      <Section className="!pt-0">
        <SectionLead
          index="04"
          eyebrow="What you'll learn"
          title="Pick a track, follow the path"
          description="Five domains, each a route through the AWS services that matter — learn them by building, together."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track, i) => {
            const Icon = track.icon;
            return (
              <FadeUp key={track.key} index={i}>
                <article className="glow-card group flex h-full flex-col gap-4 rounded-sm p-6">
                  <div className="flex items-center gap-3">
                    <Icon className="text-orange size-6" />
                    <h3 className="font-display text-lg font-semibold">
                      {track.name}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {track.blurb}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {track.services.map((svc) => (
                      <span
                        key={svc}
                        className="border-border bg-muted/40 text-muted-foreground rounded-sm border px-2 py-0.5 font-mono text-[0.7rem]"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      {/* 05 — Perks. */}
      <Section className="!pt-0">
        <SectionLead
          index="05"
          eyebrow="Why join"
          title="What you actually get"
          description="Beyond the community — the concrete things that move your cloud career."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <FadeUp key={perk.key} index={i}>
                <article className="glow-card group flex h-full items-start gap-4 rounded-sm p-6">
                  <span className="bg-orange/10 text-orange flex size-10 shrink-0 items-center justify-center rounded-sm">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <h3 className="font-display font-semibold">{perk.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {perk.blurb}
                    </p>
                  </span>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      <ClosingCTA />
    </>
  );
}

/** Editorial section header with a mono index tag. */
function SectionLead({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <FadeUp className="max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="text-orange font-mono text-sm">{index}</span>
        <span className="bg-border h-px flex-1" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          {description}
        </p>
      ) : null}
    </FadeUp>
  );
}

function ClosingCTA() {
  return (
    <section className="console relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="aurora" />
        <div className="console-grid absolute inset-0" />
      </div>
      <Container className="relative">
        <div className="flex flex-col items-start gap-8 py-24 md:flex-row md:items-center md:justify-between md:py-32">
          <div className="max-w-2xl">
            <p className="text-orange mb-4 font-mono text-xs tracking-wide uppercase">
              $ aws configure
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
              Your cloud journey starts with{" "}
              <span className="text-sheen">one account.</span>
            </h2>
            <p className="mt-4 max-w-md text-white/60">
              Applications are open. Join the group, pick a track, and ship
              something real this semester.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3">
            <Button
              asChild
              size="lg"
              className="glow-pill hover:shadow-[0_0_28px_-4px_rgba(255,153,0,0.7)]"
            >
              <Link href={routes.join}>Join the group</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 text-white hover:bg-white/5 hover:text-white"
            >
              <Link href={routes.events}>See what&apos;s on</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
