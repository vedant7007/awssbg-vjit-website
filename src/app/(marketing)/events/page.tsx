import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { DISCORD_INVITE } from "@/lib/constants/nav";
import {
  EVENTS_LEDGER,
  PAST_EVENTS,
  UPCOMING_EVENTS,
  type ClubEvent,
} from "@/lib/constants/events";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Every session AWS Student Builder Group VJIT has run — hands-on cloud workshops, simulations and quizzes, with the full report for each one.",
};

export default function EventsPage() {
  return (
    <div className="pt-28 md:pt-36">
      <Hero />
      <NextUp />
      <Archive />
      <Closer />
    </div>
  );
}

/* --------------------------------- hero ---------------------------------- */

function Hero() {
  return (
    <Container>
      <div className="border-b pb-10 text-center lg:pb-14">
        <Reveal>
          <p className="eyebrow-pixel text-orange mb-6">{"// what we run"}</p>
          <h1 className="font-display text-[clamp(2.75rem,9vw,7rem)] leading-[0.88] font-bold tracking-[-0.045em] uppercase">
            <span className="headline-shimmer">Events</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl leading-relaxed text-balance">
            Hands-on sessions, simulations and quizzes for students who want to
            actually use the cloud — not just read about it. Every event here
            has a filed report, and the numbers below come from those.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <dl className="border-border/60 mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 border-t pt-7 sm:grid-cols-4">
            {EVENTS_LEDGER.map((row) => (
              <div key={row.label} className="flex flex-col-reverse gap-1.5">
                <dt className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.16em] uppercase">
                  {row.label}
                </dt>
                <dd className="font-display text-4xl leading-none font-bold tabular-nums md:text-5xl">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Container>
  );
}

/* -------------------------------- next up -------------------------------- */

/**
 * With no confirmed date to publish, an honest empty state beats a fake
 * countdown. The moment UPCOMING_EVENTS has an entry this flips to real cards.
 */
function NextUp() {
  return (
    <Container>
      <section className="border-b py-14 lg:py-20">
        <Reveal>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Next up
          </p>
        </Reveal>

        {UPCOMING_EVENTS.length > 0 ? (
          <div className="mt-10 flex flex-col gap-14">
            {UPCOMING_EVENTS.map((event, i) => (
              <Reveal key={event.slug} delay={0.06}>
                <EventBlock event={event} flip={i % 2 === 1} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={0.1}>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 className="font-display max-w-2xl text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
                  The next session isn&apos;t announced yet.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-lg leading-relaxed">
                  We plan in the open. Dates, venues and sign-up links go out on
                  Discord first — that&apos;s the fastest way to hear about the
                  next one.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="glow-pill rounded-full">
                  <a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get the announcement
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                >
                  <Link href={routes.join}>Join the community</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </Container>
  );
}

/* -------------------------------- archive -------------------------------- */

function Archive() {
  return (
    <Container>
      <section className="py-14 lg:py-20">
        <Reveal>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            The archive
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            Everything we&apos;ve run so far.
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-col gap-14 lg:mt-16 lg:gap-20">
          {PAST_EVENTS.map((event, i) => (
            <Reveal key={event.slug} delay={0.06}>
              <EventBlock event={event} flip={i % 2 === 1} />
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* ------------------------------ event block ------------------------------ */

/**
 * One event, one block: thumbnail, the essentials, and a single way in. The
 * whole block is the link, so on a phone the hit target is the entire card.
 */
function EventBlock({ event, flip }: { event: ClubEvent; flip: boolean }) {
  return (
    <Link
      href={routes.event(event.slug)}
      className="group focus-visible:ring-ring block rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
    >
      <article className="grid items-center gap-7 lg:grid-cols-2 lg:gap-14">
        <div
          className={[
            "border-border/60 relative aspect-[16/10] overflow-hidden rounded-2xl border",
            flip ? "lg:order-2" : "",
          ].join(" ")}
        >
          <Image
            src={event.cover}
            alt={event.coverAlt}
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
          />
          <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 font-mono text-[0.65rem] tracking-[0.16em] text-white/90 uppercase backdrop-blur-sm">
            {event.categoryLabel}
          </span>
          <span className="font-display absolute bottom-4 left-4 text-2xl leading-none font-bold text-white tabular-nums md:text-3xl">
            {event.dateShort}
          </span>
        </div>

        <div className={flip ? "lg:order-1" : undefined}>
          <h3 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
            {event.title}
          </h3>
          <p className="text-orange mt-3 font-mono text-xs tracking-[0.14em] uppercase">
            {event.subtitle}
          </p>

          <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed">
            {event.summary}
          </p>

          <dl className="text-muted-foreground mt-7 flex flex-wrap gap-x-7 gap-y-3 font-mono text-xs">
            <MetaItem icon={CalendarDays} label={event.dateLabel} />
            {event.venue ? (
              <MetaItem icon={MapPin} label={event.venue} />
            ) : null}
            <MetaItem icon={Users} label={event.audience} />
          </dl>

          <p className="text-foreground mt-8 inline-flex items-center gap-2 font-mono text-sm">
            <span className="group-hover:decoration-orange underline decoration-transparent underline-offset-[6px] transition-colors duration-300">
              View full event details
            </span>
            <ArrowUpRight className="text-orange size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
          </p>
        </div>
      </article>
    </Link>
  );
}

function MetaItem({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

/* -------------------------------- closer --------------------------------- */

function Closer() {
  return (
    <Container>
      <section className="border-t py-20 text-center lg:py-28">
        <Reveal>
          <h2 className="font-display mx-auto max-w-2xl text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            Want to be in the next one?
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg leading-relaxed">
            Every session is free and open to any VJIT student. No prior cloud
            experience needed — the first one started from zero.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="glow-pill rounded-full">
              <Link href={routes.join}>Join the community</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <Link href={routes.team}>Meet the team</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </Container>
  );
}
