import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { DISCORD_INVITE } from "@/lib/constants/nav";
import {
  CLUB,
  WHAT_WE_DO,
  IMPACT_STATS,
  ABOUT,
  CLOSING_CTA,
} from "@/lib/constants/club";
import { safe } from "@/lib/utils/safe";
import { getFeaturedEvent, listEvents } from "@/lib/firestore/events";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { HeroGrid } from "@/components/home/HeroGrid";
import { StrandsBackdrop } from "@/components/motion/StrandsBackdrop";
import { MomentsSection } from "@/components/home/MomentsSection";
import { EventCard } from "@/components/cards/EventCard";

export const metadata: Metadata = {
  title: "Learn cloud. Build projects. Grow together.",
  description: CLUB.intro,
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
  const nextEvent = featuredEvent ?? upcoming[0] ?? null;

  return (
    <>
      <HeroGrid />
      <AboutSection />
      <WhatWeDoSection />
      {nextEvent ? <UpcomingEventSection event={nextEvent} /> : null}
      <ImpactSection />
      <MomentsSection />
      <JoinSection />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Section({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className={`py-20 lg:py-28 ${muted ? "bg-muted/30" : "bg-background"}`}
    >
      <Container className="w-full">{children}</Container>
    </section>
  );
}

/** Who we are — kept as the terminal window, now with the club's real copy. */
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
              {CLUB.name}
            </p>
            <p className="text-muted-foreground">
              {CLUB.fullName} · {CLUB.institute}
            </p>

            <p className="text-orange/80 pt-6"># who we are</p>
            <p className="text-muted-foreground">{ABOUT.whoWeAre}</p>

            <p className="text-orange/80 pt-4"># the rule</p>
            <p className="text-muted-foreground">
              No gatekeeping. Previous AWS experience is not required — students
              from every branch, year and skill level are welcome.
              <span className="animate-caret bg-orange ml-1 inline-block h-4 w-2 -translate-y-0.5 align-middle" />
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** The next real event, straight from Firestore. */
function UpcomingEventSection({
  event,
}: {
  event: NonNullable<Awaited<ReturnType<typeof getFeaturedEvent>>>;
}) {
  return (
    <Section muted>
      <div className="grid items-center gap-12 lg:grid-cols-[2fr_3fr]">
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow-pixel mb-4">{"// upcoming event"}</p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Come build with us
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Hands-on sessions open to every student — no prior AWS experience
              needed. Register on the site and get your entry pass.
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
          <EventCard event={event} featured />
        </Reveal>
      </div>
    </Section>
  );
}

/** Learn · Build · Connect · Compete. */
function WhatWeDoSection() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow-pixel mb-4">{"// what we do"}</p>
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {CLUB.tagline}
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">{CLUB.intro}</p>
      </Reveal>

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {WHAT_WE_DO.map((item, i) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.key} delay={i * 0.06}>
              <article className="glow-card group flex h-full flex-col gap-3 rounded-2xl p-6">
                <span className="bg-orange/10 text-orange flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.blurb}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.3}>
        <p className="text-muted-foreground mt-10 text-center font-mono text-sm">
          {CLUB.pillars.join("  •  ")}
        </p>
      </Reveal>
    </Section>
  );
}

/**
 * Verified club numbers, as a bold editorial band — a big watermark word, a
 * left headline, and oversized figures on the right with per-stat meters.
 * Dense on purpose: the old centred-cards version left the section half empty.
 */
function ImpactSection() {
  return (
    <section className="relative overflow-hidden bg-[#080a10] py-20 lg:py-28">
      {/* Oversized watermark, clipped by the section — reference-style depth. */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -top-4 left-0 text-[22vw] leading-none font-extrabold tracking-tighter whitespace-nowrap text-white/[0.03] select-none"
      >
        THE NUMBERS
      </span>

      <Container className="relative">
        <div className="grid items-end gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <p className="font-pixel text-orange text-[0.6rem] tracking-[0.25em]">
              {"// community impact"}
            </p>
            <h2 className="font-display mt-5 max-w-xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.95] font-bold tracking-[-0.035em] text-balance text-white">
              Built by students.
              <br />
              Growing every semester.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm leading-relaxed text-white/55">
              Every figure here is one we can point at — no rounded-up vanity
              metrics.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4">
          {IMPACT_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Reveal key={stat.key} delay={i * 0.07}>
                <div className="group relative border-b border-white/10 px-1 py-9 sm:px-6 lg:border-b-0 lg:[&:not(:last-child)]:border-r lg:[&:not(:last-child)]:border-white/10">
                  <Icon className="text-orange/70 mb-5 size-5" />
                  <div className="font-display text-orange text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-extrabold tracking-tight tabular-nums">
                    {stat.value}
                  </div>
                  <div className="mt-3 font-mono text-xs tracking-[0.12em] text-white/60 uppercase">
                    {stat.label}
                  </div>
                  <span className="bg-orange/60 mt-5 block h-px w-10 origin-left transition-transform duration-500 group-hover:scale-x-[3]" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/**
 * The club's Discord invite. Null until the real link lands — the CTA points at
 * the join form meanwhile, since the flow is form first, then invite.
 */
const DISCORD_URL: string | null = DISCORD_INVITE;

/** Full-screen closer — bookends the hero with the same perspective grid. */
function JoinSection() {
  return (
    <section className="bg-background relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-80">
        <StrandsBackdrop />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, transparent 12%, var(--background) 72%)",
        }}
      />

      <Container className="relative z-10 text-center">
        <Reveal>
          <p className="eyebrow-pixel text-orange mb-7">{"// join us"}</p>
          <h2 className="font-display text-foreground text-[clamp(2.75rem,11vw,8rem)] leading-[0.86] font-extrabold tracking-[-0.045em] uppercase">
            Come build
            <br />
            <span className="text-orange">with us.</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-7 max-w-lg text-lg leading-relaxed">
            {CLOSING_CTA.blurb}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="glow-pill rounded-full px-8 hover:shadow-[0_0_28px_-4px_rgba(255,153,0,0.7)]"
            >
              <Link href={routes.join} className="group">
                Join the community
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <Link href={DISCORD_URL ?? routes.join}>
                {DISCORD_URL ? "Open our Discord" : "See what's on"}
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground/70 mt-6 font-mono text-xs tracking-wide">
            {DISCORD_URL
              ? "Fill the form, then jump into the Discord."
              : "Fill the form — your Discord invite follows."}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
