import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { PROGRAMS, TRACKS, PERKS } from "@/lib/constants/club";
import { safe } from "@/lib/utils/safe";
import { getFeaturedEvent, listEvents } from "@/lib/firestore/events";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { DecryptText } from "@/components/motion/DecryptText";
import { HeroGrid } from "@/components/home/HeroGrid";
import { EventCard } from "@/components/cards/EventCard";

export const metadata: Metadata = {
  title: "Build the cloud, on campus",
  description:
    "AWS Student Builder Group at VJIT. Learn AWS, run real programs, and grow with a community of student builders in Hyderabad.",
};

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [featuredEvent, allEvents] = await Promise.all([
    safe(getFeaturedEvent(), null, "landing:featuredEvent"),
    safe(listEvents(), [], "landing:events"),
  ]);

  const upcoming = allEvents
    .filter((e) => e.status === "upcoming")
    .sort(
      (a, b) => a.startAt.toDate().getTime() - b.startAt.toDate().getTime(),
    );
  const heroEvent = featuredEvent ?? upcoming[0] ?? null;

  return (
    <>
      <HeroGrid />
      <AboutSection />
      <TracksSection />
      <ProgramsSection />
      {heroEvent ? <EventsSection heroEvent={heroEvent} /> : null}
      <PerksSection />
      <JoinSection />
    </>
  );
}

/* ------------------------------------------------------------------ */

/** Full-screen section shell with brand vertical rhythm. */
function Section({
  children,
  muted = false,
  className,
}: {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-screen items-center py-24 ${
        muted ? "bg-muted/30" : "bg-background"
      } ${className ?? ""}`}
    >
      <Container className="w-full">{children}</Container>
    </section>
  );
}

/** About — a terminal / README window. Distinctive, on-brand for a builder group. */
function AboutSection() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-3xl">
        <p className="eyebrow-pixel mb-6 text-center">{"// who we are"}</p>
        <div className="glass overflow-hidden rounded-2xl shadow-xl shadow-black/5">
          <div className="border-border/60 flex items-center gap-2 border-b px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#27c93f]" />
            </span>
            <span className="text-muted-foreground ml-2 font-mono text-xs">
              ~/aws-sbg-vjit — about
            </span>
          </div>
          <div className="space-y-1 p-6 font-mono text-sm leading-relaxed md:p-9 md:text-base">
            <p>
              <span className="text-orange">$</span> whoami
            </p>
            <p className="font-display pt-1 text-2xl font-bold md:text-3xl">
              AWS SBG VJIT
            </p>
            <p className="text-muted-foreground">
              AWS Student Builder Group · VJIT, Hyderabad
            </p>

            <p className="text-orange/80 pt-6"># what we are</p>
            <p className="text-muted-foreground">
              A student-led builder group. We learn cloud fundamentals, run real
              programs, and ship projects to production — together.
            </p>

            <p className="text-orange/80 pt-4"># the rule</p>
            <p className="text-muted-foreground">
              No gatekeeping. If you want to build on AWS, you belong here.
              <span className="animate-caret bg-orange ml-1 inline-block h-4 w-2 -translate-y-0.5 align-middle" />
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** Tracks — five numbered "path" cards, balanced (3 + 2 centred). */
function TracksSection() {
  return (
    <Section muted>
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow-pixel mb-4">{"// pick a track"}</p>
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          <DecryptText text="Follow the path" trigger="view" duration={1500} />
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Five domains, each a route through the AWS services that matter —
          learned by building, together.
        </p>
      </Reveal>

      <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-4">
        {TRACKS.map((track, i) => {
          const Icon = track.icon;
          return (
            <Reveal
              key={track.key}
              delay={i * 0.06}
              className="w-full sm:w-[280px]"
            >
              <article className="glow-card group flex h-full flex-col gap-3 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <Icon className="text-orange size-6 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-muted-foreground/50 font-mono text-xs">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {track.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {track.blurb}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
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
  );
}

/** Programs — the recurring calendar. */
function ProgramsSection() {
  return (
    <Section>
      <Reveal className="max-w-2xl">
        <p className="eyebrow-pixel mb-4">{"// what we run"}</p>
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          <DecryptText
            text="Programs, not one-off meetups"
            trigger="view"
            duration={1600}
          />
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          A repeating calendar built to move you forward — foundations, camps,
          sprints, and a flagship community day.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROGRAMS.map((program, i) => {
          const Icon = program.icon;
          return (
            <Reveal key={program.key} delay={i * 0.05}>
              <article
                className={`glow-card group flex h-full flex-col gap-3 rounded-2xl p-6 ${
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
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/** Events glimpse — only shown when there's a real event. */
function EventsSection({
  heroEvent,
}: {
  heroEvent: NonNullable<Awaited<ReturnType<typeof getFeaturedEvent>>>;
}) {
  return (
    <Section muted>
      <div className="grid items-center gap-12 lg:grid-cols-[2fr_3fr]">
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow-pixel mb-4">{"// next up"}</p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              <DecryptText
                text="Something is always on"
                trigger="view"
                duration={1500}
              />
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Workshops, camps, and community days — open to every student who
              wants to build.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Button asChild variant="outline" className="mt-8 rounded-full">
              <Link href={routes.events} className="group">
                See all events
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </Reveal>
        </div>
        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <EventCard event={heroEvent} featured />
        </Reveal>
      </div>
    </Section>
  );
}

/** Perks — what you actually get. */
function PerksSection() {
  return (
    <Section>
      <Reveal className="max-w-2xl">
        <p className="eyebrow-pixel mb-4">{"// why join"}</p>
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          <DecryptText
            text="What you actually get"
            trigger="view"
            duration={1500}
          />
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Beyond the community — the concrete things that move your cloud
          career.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERKS.map((perk, i) => {
          const Icon = perk.icon;
          return (
            <Reveal key={perk.key} delay={i * 0.05}>
              <article className="glow-card flex h-full items-start gap-4 rounded-2xl p-6">
                <span className="bg-orange/10 text-orange flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </span>
                <span>
                  <h3 className="font-display font-semibold">{perk.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {perk.blurb}
                  </p>
                </span>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
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
      </Container>
    </section>
  );
}
