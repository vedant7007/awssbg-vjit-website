import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { PROGRAMS, TRACKS, PERKS } from "@/lib/constants/club";
import { safe } from "@/lib/utils/safe";
import { getFeaturedEvent, listEvents } from "@/lib/firestore/events";
import {
  getFeaturedProjects,
  listProjects,
} from "@/lib/firestore/projects.server";
import {
  getPublicMembers,
  getMemberById,
} from "@/lib/firestore/members.server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
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

  const upcoming = allEvents
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) => a.startAt.toDate().getTime() - b.startAt.toDate().getTime(),
    );
  const heroEvent = featuredEvent ?? upcoming[0] ?? null;

  const leadership = publicMembers.filter(
    (m) => m.role === "core" || m.role === "lead",
  );
  const crew = (leadership.length > 0 ? leadership : publicMembers).slice(0, 8);

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

      {/* 01 — About. 60/40. */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <Reveal>
              <p className="eyebrow-pixel mb-6">{"// who we are"}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance md:text-6xl">
                We learn the cloud by{" "}
                <span className="text-sheen">building things that run.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
                AWS SBG VJIT is a student-led builder group at Vidya Jyothi
                Institute of Technology. We meet to learn cloud fundamentals,
                run real programs, and ship projects to production together — no
                gatekeeping. If you want to build on AWS, you belong here.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <dl className="glass grid grid-cols-3 gap-px overflow-hidden rounded-2xl">
              <Stat label="builders" value={publicMembers.length} />
              <Stat label="projects" value={allProjects.length} />
              <Stat label="events" value={allEvents.length} />
            </dl>
          </Reveal>
        </div>
      </Section>

      {/* 02 — Our plan / tracks. */}
      <Section muted>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow-pixel mb-4">{"// our plan"}</p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Pick a track, follow the path
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Five domains, each a route through the AWS services that matter —
            learned by building, together.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track, i) => {
            const Icon = track.icon;
            return (
              <Reveal key={track.key} delay={i * 0.06}>
                <article className="glow-card group flex h-full flex-col gap-4 rounded-2xl p-6">
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
                        className="border-border bg-background/40 text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[0.7rem]"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* 03 — Events glimpse. 60/40. */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[2fr_3fr]">
          <div className="order-2 lg:order-1">
            <Reveal>
              <p className="eyebrow-pixel mb-4">{"// what we run"}</p>
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Programs, not one-off meetups
              </h2>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                A repeating calendar built to move you forward — foundations,
                camps, sprints, and a flagship community day.
              </p>
            </Reveal>
            <ul className="mt-6 space-y-2">
              {PROGRAMS.slice(0, 4).map((program, i) => (
                <Reveal key={program.key} delay={0.05 + i * 0.05}>
                  <li className="flex items-center gap-3">
                    <span className="bg-orange size-1.5 rounded-full" />
                    <span className="font-medium">{program.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {program.cadence}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.3}>
              <Button asChild variant="outline" className="mt-8 rounded-full">
                <Link href={routes.events} className="group">
                  See all events
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </Reveal>
          </div>

          <Reveal className="order-1 lg:order-2" delay={0.1}>
            {heroEvent ? (
              <EventCard event={heroEvent} featured />
            ) : (
              <EmptyState title="Next event dropping soon" />
            )}
          </Reveal>
        </div>
      </Section>

      {/* 04 — Projects. */}
      {featuredProjects.length > 0 ? (
        <Section muted>
          <Reveal className="max-w-2xl">
            <p className="eyebrow-pixel mb-4">{"// shipped"}</p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Built by students, running on AWS
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Not tutorials — deployed projects with a name attached.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <Reveal key={project.id} delay={i * 0.06}>
                <ProjectCard project={project} className="h-full" />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 05 — Crew. */}
      {crew.length > 0 ? (
        <Section>
          <Reveal className="max-w-2xl">
            <p className="eyebrow-pixel mb-4">{"// the crew"}</p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Run by students, for students
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              A captain, functional leads, and builders who keep it all moving.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {crew.map((member, i) => (
              <Reveal key={member.id} delay={i * 0.05}>
                <MemberCard member={member} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <Button asChild variant="outline" className="mt-8 rounded-full">
              <Link href={routes.members} className="group">
                Meet everyone
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </Reveal>
        </Section>
      ) : null}

      {/* 06 — Join. */}
      <JoinSection />
    </>
  );
}

/** Full-screen section shell with brand vertical rhythm. */
function Section({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className={`flex min-h-screen items-center py-24 ${
        muted ? "bg-muted/30" : "bg-background"
      }`}
    >
      <Container>{children}</Container>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background/50 px-5 py-7 text-center">
      <dd className="text-orange text-4xl font-bold tabular-nums">
        <CountUp value={value} />
      </dd>
      <dt className="text-muted-foreground mt-1 font-mono text-xs tracking-wide uppercase">
        {label}
      </dt>
    </div>
  );
}

function JoinSection() {
  return (
    <section className="bg-background relative flex min-h-screen items-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, color-mix(in oklab, var(--orange) 14%, transparent), transparent 70%)",
        }}
      />
      <Container className="relative text-center">
        <Reveal>
          <p className="eyebrow-pixel mb-6">$ aws configure</p>
          <h2 className="font-display text-glow mx-auto max-w-3xl text-5xl font-bold tracking-tight text-balance md:text-7xl">
            Your cloud journey starts with{" "}
            <span className="text-sheen">one account.</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-6 max-w-md text-lg">
            Applications are open. Join the group, pick a track, and ship
            something real this semester.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="glow-pill rounded-full hover:shadow-[0_0_28px_-4px_rgba(255,153,0,0.7)]"
            >
              <Link href={routes.join}>Join the group</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <Link href={routes.events}>See what&apos;s on</Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-16 flex flex-wrap justify-center gap-2">
          {PERKS.map((perk, i) => (
            <Reveal key={perk.key} delay={0.15 + i * 0.03}>
              <span className="glass text-muted-foreground rounded-full px-3 py-1.5 text-xs">
                {perk.title}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
