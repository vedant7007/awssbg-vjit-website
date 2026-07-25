import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, HelpCircle, Target, Wallet } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import {
  COMING_SOON,
  LEVEL_COLORS,
  ROADMAPS,
  ROADMAP_LEDGER,
  type Cert,
  type Roadmap,
  type RoadmapStep,
} from "@/lib/constants/roadmaps";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { RollingText } from "@/components/motion/RollingText";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Roadmaps",
  description:
    "AWS certification roadmaps for students — the architect path, the builder path and the data path, with real exam codes, costs, formats and honest prep estimates.",
};

export default function RoadmapPage() {
  return (
    <div className="pt-28 md:pt-36">
      <Hero />
      <Legend />
      {ROADMAPS.map((roadmap, i) => (
        <PathSection key={roadmap.slug} roadmap={roadmap} index={i} />
      ))}
      <ComingSoonSection />
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
          <p className="eyebrow-pixel text-orange mb-6">{"// pick a lane"}</p>
          <RollingText
            as="h1"
            text="Roadmaps"
            className="font-display text-[clamp(2.5rem,9vw,7rem)] leading-[0.88] font-bold tracking-[-0.045em] uppercase"
          />
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl leading-relaxed text-balance">
            Three routes through AWS certification, in the order we&apos;d
            actually take them. Every exam code, cost, format and passing score
            below is from the official AWS exam guide — and every prep estimate
            assumes you&apos;re a student with coursework, not a full-time
            candidate.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <dl className="border-border/60 mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 border-t pt-7 sm:grid-cols-4">
            {ROADMAP_LEDGER.map((row) => (
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

/* -------------------------------- legend --------------------------------- */

function Legend() {
  return (
    <Container>
      <section className="border-b py-10">
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
              Levels
            </p>
            {(
              Object.entries(LEVEL_COLORS) as [
                keyof typeof LEVEL_COLORS,
                string,
              ][]
            ).map(([level, color]) => (
              <span
                key={level}
                className="text-muted-foreground inline-flex items-center gap-2 font-mono text-xs"
              >
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {level}
              </span>
            ))}
          </div>
        </Reveal>
      </section>
    </Container>
  );
}

/* ------------------------------ path section ----------------------------- */

function PathSection({ roadmap, index }: { roadmap: Roadmap; index: number }) {
  const Icon = roadmap.icon;

  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <Reveal>
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:gap-14">
            <span
              className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.8] font-extrabold tracking-[-0.05em] tabular-nums opacity-25 lg:w-40 lg:shrink-0"
              style={{ color: roadmap.accent }}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <span
                className="mb-5 grid size-12 place-items-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in oklab, ${roadmap.accent} 14%, transparent)`,
                  color: roadmap.accent,
                }}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="font-display text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance">
                {roadmap.title}
              </h2>
              <p
                className="mt-3 font-mono text-xs tracking-[0.16em] uppercase"
                style={{
                  color: `color-mix(in oklab, ${roadmap.accent} 70%, var(--foreground))`,
                }}
              >
                {roadmap.tagline}
              </p>
              <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed">
                {roadmap.forWho}
              </p>
            </div>
          </div>
        </Reveal>

        <ol className="mt-12 lg:mt-16 lg:pl-[13.5rem]">
          {roadmap.steps.map((step, i) => (
            <StepCard
              key={step.cert.code}
              step={step}
              index={i}
              accent={roadmap.accent}
              last={i === roadmap.steps.length - 1}
            />
          ))}
        </ol>
      </section>
    </Container>
  );
}

/* ------------------------------- step card ------------------------------- */

/**
 * One exam in a path. The node + connector on the left make the order literal;
 * the spec row carries the facts a student actually needs before booking.
 */
function StepCard({
  step,
  index,
  accent,
  last,
}: {
  step: RoadmapStep;
  index: number;
  accent: string;
  last: boolean;
}) {
  const { cert } = step;
  const levelColor = LEVEL_COLORS[cert.level];

  return (
    <li className="relative flex gap-5 pb-6 last:pb-0 sm:gap-7">
      {/* rail */}
      <div className="flex shrink-0 flex-col items-center">
        <span
          className="font-display grid size-9 place-items-center rounded-full text-xs font-bold tabular-nums"
          style={{
            backgroundColor: `color-mix(in oklab, ${accent} 18%, transparent)`,
            color: accent,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${accent} 45%, transparent)`,
          }}
        >
          {index + 1}
        </span>
        {!last ? (
          <span
            aria-hidden
            className="mt-2 w-px flex-1"
            style={{
              background: `linear-gradient(to bottom, color-mix(in oklab, ${accent} 40%, transparent), transparent)`,
            }}
          />
        ) : null}
      </div>

      {/* card */}
      <Reveal className="min-w-0 flex-1" delay={index * 0.05}>
        <article className="border-border/70 bg-card/40 rounded-2xl border p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            {/* Blended toward the theme foreground so the chip keeps contrast
                on a near-white page as well as on the dark one. */}
            <span
              className="rounded-full px-2.5 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.14em] uppercase"
              style={{
                backgroundColor: `color-mix(in oklab, ${levelColor} 16%, transparent)`,
                color: `color-mix(in oklab, ${levelColor} 58%, var(--foreground))`,
              }}
            >
              {cert.level}
            </span>
            <span className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.14em]">
              {cert.code}
            </span>
          </div>

          <h3 className="font-display mt-4 text-xl leading-tight font-bold tracking-[-0.02em] sm:text-2xl">
            {cert.name}
          </h3>

          <p className="text-muted-foreground mt-4 leading-relaxed">
            {cert.proves}
          </p>

          <p className="border-border/60 mt-5 border-l-2 pl-4 text-sm leading-relaxed italic">
            {step.why}
          </p>

          <ul className="text-muted-foreground mt-6 grid gap-2 text-sm sm:grid-cols-2">
            {cert.covers.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span
                  aria-hidden
                  className="mt-[0.55rem] size-1 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                {item}
              </li>
            ))}
          </ul>

          <dl className="border-border/60 text-muted-foreground mt-7 flex flex-wrap gap-x-7 gap-y-3 border-t pt-6 font-mono text-xs">
            <Spec icon={HelpCircle} label={`${cert.questions} questions`} />
            <Spec icon={Clock} label={`${cert.minutes} min`} />
            <Spec icon={Target} label={`${cert.passingScore}/1000 to pass`} />
            <Spec icon={Wallet} label={`from $${cert.priceUsd}`} />
          </dl>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted-foreground font-mono text-[0.7rem]">
              Prep: {step.prep}
            </p>
            <OfficialLink cert={cert} accent={accent} />
          </div>
        </article>
      </Reveal>
    </li>
  );
}

function Spec({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

function OfficialLink({ cert, accent }: { cert: Cert; accent: string }) {
  return (
    <a
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-visible:ring-ring group inline-flex items-center gap-1.5 rounded-sm font-mono text-xs tracking-[0.1em] uppercase focus-visible:ring-2 focus-visible:outline-none"
      style={{ color: `color-mix(in oklab, ${accent} 72%, var(--foreground))` }}
    >
      Official exam guide
      <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
    </a>
  );
}

/* ------------------------------ coming soon ------------------------------ */

function ComingSoonSection() {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <Reveal>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Coming soon
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(1.6rem,3.4vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            More lanes, once we&apos;ve walked them ourselves.
          </h2>
          <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed">
            We only publish a path after someone in the club has actually sat
            the exams on it. These are next.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COMING_SOON.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={Math.min(i, 3) * 0.06}>
                <div className="border-border/60 h-full rounded-2xl border border-dashed p-6">
                  <span className="bg-foreground/[0.04] text-muted-foreground grid size-10 place-items-center rounded-lg">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <h3 className="font-display mt-5 text-lg font-bold tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
                    {item.blurb}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- closer --------------------------------- */

function Closer() {
  return (
    <Container>
      <section className="py-20 text-center lg:py-28">
        <Reveal>
          <h2 className="font-display mx-auto max-w-2xl text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            Don&apos;t study alone.
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg leading-relaxed">
            Pick a path, say so in the community, and find the others going the
            same way. Exam costs and formats change — always confirm on the
            official AWS page before you book.
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
              <Link href={routes.playground}>Drill it in the playground</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </Container>
  );
}
