import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  MapPin,
  Quote,
  Trophy,
  Users,
} from "lucide-react";

import { routes } from "@/lib/constants/routes";
import {
  ALL_EVENTS,
  getEventBySlug,
  type ClubEvent,
} from "@/lib/constants/events";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

/** Static content — prerender every event at build time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_EVENTS.map((event) => ({ slug: event.slug }));
}

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event" };

  return {
    title: event.title,
    description: event.summary,
    openGraph: {
      title: `${event.title} — AWS SBG VJIT`,
      description: event.summary,
      images: [{ url: event.cover }],
      type: "article",
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const others = ALL_EVENTS.filter((e) => e.slug !== event.slug);

  return (
    <article className="pt-24 md:pt-28">
      <Hero event={event} />
      <StatBand event={event} />
      <Overview event={event} />
      {event.rounds ? <Rounds rounds={event.rounds} /> : null}
      {event.roles ? <Roles roles={event.roles} /> : null}
      {event.scoring ? <Scoring scoring={event.scoring} /> : null}
      {event.winners ? <Winners winners={event.winners} /> : null}
      {event.outcomes ? <Outcomes outcomes={event.outcomes} /> : null}
      {event.feedback ? <Feedback feedback={event.feedback} /> : null}
      <Gallery event={event} />
      {event.conclusion ? <Conclusion paragraphs={event.conclusion} /> : null}
      <Credits event={event} />
      <NextEvent others={others} />
    </article>
  );
}

/* --------------------------------- hero ---------------------------------- */

function Hero({ event }: { event: ClubEvent }) {
  return (
    <header>
      <Container>
        <Link
          href={routes.events}
          className="text-muted-foreground hover:text-orange inline-flex items-center gap-2 font-mono text-xs tracking-[0.16em] uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          All events
        </Link>

        <div className="mt-8 max-w-4xl">
          <p className="text-orange font-mono text-xs tracking-[0.2em] uppercase">
            {event.categoryLabel} · {event.dateLabel}
          </p>
          <h1 className="font-display mt-5 text-[clamp(2rem,6.4vw,4.75rem)] leading-[0.94] font-bold tracking-[-0.04em] text-balance">
            {event.fullTitle}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-balance md:text-xl">
            {event.subtitle}
          </p>
        </div>

        <dl className="border-border/60 text-muted-foreground mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t pt-7 font-mono text-xs">
          <Meta icon={CalendarDays} term="Date" value={event.dateLabel} />
          {event.venue ? (
            <Meta icon={MapPin} term="Venue" value={event.venue} />
          ) : null}
          <Meta icon={Users} term="Participants" value={event.audience} />
          <Meta icon={Building2} term="Department" value={event.department} />
        </dl>

        <div className="border-border/60 relative mt-10 aspect-[16/10] overflow-hidden rounded-2xl border md:aspect-[16/7]">
          <Image
            src={event.cover}
            alt={event.coverAlt}
            fill
            priority
            sizes="(min-width: 768px) 80vw, 100vw"
            className="object-cover"
          />
        </div>
        {event.coverNote ? (
          <p className="text-muted-foreground mt-3 font-mono text-[0.7rem] leading-relaxed">
            {event.coverNote}
          </p>
        ) : null}
      </Container>
    </header>
  );
}

function Meta({
  icon: Icon,
  term,
  value,
}: {
  icon: typeof CalendarDays;
  term: string;
  value: string;
}) {
  return (
    <div className="flex max-w-xs items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <div>
        <dt className="sr-only">{term}</dt>
        <dd className="leading-relaxed">{value}</dd>
      </div>
    </div>
  );
}

/* ------------------------------- stat band -------------------------------- */

/**
 * Hardcoded dark, like the other feature strips. In light mode the fill alone
 * makes the band; in dark mode it sits too close to the page colour, so the
 * hairline edges and the orange wash are what keep it reading as a band.
 */
function StatBand({ event }: { event: ClubEvent }) {
  return (
    <section
      className="relative mt-16 border-y border-white/10 md:mt-24"
      style={{ backgroundColor: "#06080e" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 140% at 12% 0%, color-mix(in oklab, var(--orange) 12%, transparent), transparent 62%)",
        }}
      />
      <Container className="relative">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 py-14 md:grid-cols-4 md:py-20">
          {event.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.07}>
              <div className="flex flex-col-reverse gap-2">
                <dt className="font-mono text-[0.7rem] tracking-[0.16em] text-white/45 uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-none font-bold text-white tabular-nums">
                  {stat.value}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}

/* ------------------------------- section kit ------------------------------ */

function SectionHead({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <Reveal>
      <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display mt-4 max-w-3xl text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
        {title}
      </h2>
      {intro ? (
        <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed">
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}

/* ------------------------------- overview -------------------------------- */

function Overview({ event }: { event: ClubEvent }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead eyebrow="Overview" title="What happened" />
        <div className="mt-9 max-w-3xl space-y-6">
          {event.overview.map((para, i) => (
            <Reveal key={para.slice(0, 24)} delay={0.06 + i * 0.05}>
              <p className="text-muted-foreground text-[1.05rem] leading-[1.75]">
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- rounds --------------------------------- */

function Rounds({ rounds }: { rounds: NonNullable<ClubEvent["rounds"]> }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead
          eyebrow="The format"
          title={rounds.title}
          intro={rounds.intro}
        />

        <ol className="mt-12 flex flex-col gap-5">
          {rounds.items.map((round, i) => {
            const Icon = round.icon;
            return (
              <Reveal key={round.tag} delay={0.05 + i * 0.05}>
                <li
                  className="group border-border/70 bg-card/40 relative overflow-hidden rounded-2xl border p-6 transition-colors duration-300 md:p-8"
                  style={{ borderLeft: `3px solid ${round.color}` }}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                    <div className="flex items-center gap-4 md:w-44 md:shrink-0 md:flex-col md:items-start md:gap-3">
                      <span
                        className="grid size-11 shrink-0 place-items-center rounded-xl"
                        style={{
                          backgroundColor: `${round.color}1f`,
                          color: round.color,
                        }}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span
                        className="font-mono text-xs tracking-[0.2em] uppercase"
                        style={{ color: round.color }}
                      >
                        {round.tag}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display text-xl leading-tight font-bold tracking-[-0.02em] md:text-2xl">
                        {round.title}
                      </h3>
                      <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                        {round.body}
                      </p>
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </section>
    </Container>
  );
}

/* --------------------------------- roles --------------------------------- */

function Roles({ roles }: { roles: NonNullable<ClubEvent["roles"]> }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead
          eyebrow="Who did what"
          title={roles.title}
          intro={roles.intro}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {roles.items.map((role, i) => (
            <Reveal key={role.code} delay={0.05 + i * 0.07}>
              <div
                className="border-border/70 bg-card/40 h-full rounded-2xl border p-6 md:p-7"
                style={{ boxShadow: `inset 0 1px 0 0 ${role.color}22` }}
              >
                <span
                  className="font-display text-4xl leading-none font-extrabold tracking-[-0.04em] md:text-5xl"
                  style={{ color: role.color }}
                >
                  {role.code}
                </span>
                <h3 className="font-display mt-4 text-lg font-bold tracking-[-0.02em]">
                  {role.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {role.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- scoring -------------------------------- */

function Scoring({ scoring }: { scoring: NonNullable<ClubEvent["scoring"]> }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead
          eyebrow="How it was scored"
          title={scoring.title}
          intro={scoring.intro}
        />

        <div className="mt-12 max-w-3xl">
          {scoring.metrics.map((metric, i) => (
            <Reveal key={metric.label} delay={0.05 + i * 0.07}>
              <div className="border-border/60 border-t py-7">
                <div className="flex items-baseline justify-between gap-6">
                  <h3 className="font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
                    {metric.label}
                  </h3>
                  <span className="font-display text-orange text-2xl leading-none font-bold tabular-nums md:text-3xl">
                    {metric.weight}%
                  </span>
                </div>

                <div
                  className="bg-muted mt-4 h-1.5 overflow-hidden rounded-full"
                  role="presentation"
                >
                  <span
                    className="bg-orange block h-full rounded-full"
                    style={{ width: `${metric.weight}%` }}
                  />
                </div>

                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  {metric.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- winners -------------------------------- */

function Winners({ winners }: { winners: NonNullable<ClubEvent["winners"]> }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead
          eyebrow="Results"
          title={winners.title}
          intro={winners.intro}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:max-w-3xl">
          {winners.items.map((winner, i) => (
            <Reveal key={winner.name} delay={0.05 + i * 0.08}>
              <div className="border-orange/35 bg-orange/[0.06] flex items-center gap-5 rounded-2xl border p-6">
                <span className="bg-orange/15 text-orange grid size-12 shrink-0 place-items-center rounded-xl">
                  <Trophy className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-display truncate text-xl font-bold tracking-[-0.02em]">
                    {winner.name}
                  </p>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    {winner.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- outcomes -------------------------------- */

function Outcomes({
  outcomes,
}: {
  outcomes: NonNullable<ClubEvent["outcomes"]>;
}) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead eyebrow="What came out of it" title={outcomes.title} />
        <div className="mt-9 max-w-3xl space-y-6">
          {outcomes.body.map((para, i) => (
            <Reveal key={para.slice(0, 24)} delay={0.06 + i * 0.05}>
              <p className="text-muted-foreground text-[1.05rem] leading-[1.75]">
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- feedback -------------------------------- */

function Feedback({ feedback }: { feedback: string }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <Reveal>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Feedback
          </p>
          <blockquote className="border-orange/60 mt-8 max-w-3xl border-l-2 pl-6 md:pl-8">
            <Quote className="text-orange/50 mb-4 size-6" aria-hidden />
            <p className="font-display text-xl leading-[1.45] tracking-[-0.01em] text-balance md:text-2xl">
              {feedback}
            </p>
          </blockquote>
        </Reveal>
      </section>
    </Container>
  );
}

/* -------------------------------- gallery -------------------------------- */

function Gallery({ event }: { event: ClubEvent }) {
  if (event.gallery.length === 0) return null;

  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead eyebrow="Gallery" title="From the day" />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {event.gallery.map((photo, i) => (
            <Reveal key={photo.src} delay={Math.min(i, 5) * 0.05}>
              <figure className="border-border/60 relative aspect-[4/3] overflow-hidden rounded-xl border">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 27vw, (min-width: 640px) 42vw, 90vw"
                  className="object-cover"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* ------------------------------- conclusion ------------------------------- */

function Conclusion({ paragraphs }: { paragraphs: string[] }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <SectionHead eyebrow="In closing" title="Conclusion" />
        <div className="mt-9 max-w-3xl space-y-6">
          {paragraphs.map((para, i) => (
            <Reveal key={para.slice(0, 24)} delay={0.06 + i * 0.05}>
              <p className="text-muted-foreground text-[1.05rem] leading-[1.75]">
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- credits -------------------------------- */

function Credits({ event }: { event: ClubEvent }) {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <Reveal>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Under the guidance of
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {event.credits.map((credit, i) => (
            <Reveal key={credit.name} delay={0.05 + i * 0.06}>
              <div>
                <p className="text-orange font-mono text-[0.7rem] tracking-[0.16em] uppercase">
                  {credit.role}
                </p>
                <p className="font-display mt-2.5 text-lg font-bold tracking-[-0.02em]">
                  {credit.name}
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {credit.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="text-muted-foreground mt-10 font-mono text-[0.7rem] leading-relaxed">
            Organised by {event.organiser} · Department of {event.department}
          </p>
        </Reveal>
      </section>
    </Container>
  );
}

/* ------------------------------- next event ------------------------------- */

function NextEvent({ others }: { others: ClubEvent[] }) {
  const next = others[0];

  return (
    <Container>
      <section className="py-16 lg:py-24">
        {next ? (
          <Reveal>
            <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
              Read next
            </p>
            <Link
              href={routes.event(next.slug)}
              className="group focus-visible:ring-ring mt-6 flex flex-col gap-6 rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none sm:flex-row sm:items-center sm:gap-8"
            >
              <div className="border-border/60 relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border sm:w-56">
                <Image
                  src={next.cover}
                  alt={next.coverAlt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 224px, 90vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground font-mono text-xs">
                  {next.dateLabel}
                </p>
                <h2 className="font-display mt-2 text-[clamp(1.35rem,2.6vw,2rem)] leading-[1.08] font-bold tracking-[-0.03em] text-balance">
                  {next.title}
                </h2>
                <p className="text-foreground mt-4 inline-flex items-center gap-2 font-mono text-sm">
                  <span className="group-hover:decoration-orange underline decoration-transparent underline-offset-[6px] transition-colors duration-300">
                    View full event details
                  </span>
                  <ArrowUpRight className="text-orange size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                </p>
              </div>
            </Link>
          </Reveal>
        ) : null}

        <Reveal delay={0.1}>
          <div className="border-border/60 mt-14 flex flex-wrap items-center justify-between gap-6 border-t pt-10">
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Every session is free and open to any VJIT student. Come to the
              next one.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="glow-pill rounded-full">
                <Link href={routes.join}>Join the community</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link href={routes.events}>All events</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </Container>
  );
}
