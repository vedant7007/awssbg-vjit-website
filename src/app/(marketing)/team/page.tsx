import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Instagram, Quote } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import {
  CAPTAIN,
  FACULTY,
  TEAM_BY_KEY,
  TEAM_COUNTS,
  initialsOf,
} from "@/lib/constants/team";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { CaptainLanyard } from "@/components/team/CaptainLanyard";
import { LeadsGrid } from "@/components/team/LeadsGrid";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The students and faculty behind AWS Student Builder Group VJIT — the captain, the team leads, and the core members who run every session.",
};

export default function TeamPage() {
  return (
    <div className="pt-28 md:pt-36">
      <Hero />
      <Faculty />
      <Captain />
      <Leads />
      <Recruiting />
    </div>
  );
}

/* --------------------------------- hero --------------------------------- */

/**
 * The ledger on the right is the structural device for this page: it is a
 * literal headcount by tier, and the sections below appear in that same order.
 */
function Hero() {
  const ledger = [
    { n: TEAM_COUNTS.faculty, label: "Faculty" },
    { n: 1, label: "Captain" },
    { n: TEAM_COUNTS.leads, label: "Team leads" },
    { n: TEAM_COUNTS.core, label: "Core members" },
  ];

  return (
    <Container>
      <div className="border-b pb-10 text-center lg:pb-14">
        <Reveal>
          <h1 className="font-display text-[clamp(2.75rem,9vw,7rem)] leading-[0.88] font-bold tracking-[-0.045em] uppercase">
            <span className="headline-shimmer">The Team</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl leading-relaxed text-balance">
            The students and faculty who run AWS SBG VJIT — writing the labs,
            designing the posters, filling the seats.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <dl className="border-border/60 mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-7 border-t pt-7 sm:grid-cols-4">
            {ledger.map((row) => (
              <div key={row.label} className="flex flex-col-reverse gap-1.5">
                <dt className="text-muted-foreground font-mono text-[0.7rem] tracking-[0.16em] uppercase">
                  {row.label}
                </dt>
                <dd className="font-display text-4xl leading-none font-bold tabular-nums md:text-5xl">
                  {String(row.n).padStart(2, "0")}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Container>
  );
}

/* -------------------------------- faculty -------------------------------- */

function Faculty() {
  return (
    <Container>
      <section className="border-b py-16 lg:py-24">
        <Reveal>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Under the guidance of
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FACULTY.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.06}>
              <article className="ring-border/60 hover:ring-orange/40 flex h-full flex-col overflow-hidden rounded-2xl ring-1 transition-colors duration-300">
                {/* Portrait slot — swaps to a real photo once we have them. */}
                <div className="bg-muted/40 relative aspect-[4/5] w-full">
                  {f.photo ? (
                    <Image
                      src={f.photo}
                      alt={f.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground/50 font-display absolute inset-0 grid place-items-center text-5xl font-bold">
                      {initialsOf(f.name)}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl leading-snug font-semibold text-balance">
                    {f.name}
                  </h3>
                  <p className="text-orange mt-2 font-mono text-xs tracking-wide">
                    {f.designation}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {f.department}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </Container>
  );
}

/* -------------------------------- captain -------------------------------- */

function Captain() {
  const team = TEAM_BY_KEY[CAPTAIN.team];

  return (
    <section className="relative min-h-[680px] overflow-hidden border-b py-14 lg:min-h-[760px] lg:py-20">
      <CaptainLanyard />
      {/* Sits above the canvas but stays transparent to pointers, so a drag
          that starts over the copy still grabs the badge. */}
      <Container className="pointer-events-none relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[36%_1fr] lg:gap-8">
          <div className="lg:min-h-[600px]" aria-hidden />

          <div>
            <Reveal delay={0.1}>
              <p
                className="font-mono text-xs tracking-[0.2em] uppercase"
                style={{ color: team.color }}
              >
                Group leader
              </p>
              <h2 className="font-display mt-4 text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] font-bold tracking-[-0.03em]">
                {CAPTAIN.name}
              </h2>
              <p className="text-muted-foreground mt-3 font-mono text-sm">
                {CAPTAIN.branch} · {CAPTAIN.year}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <blockquote className="border-orange/60 mt-9 border-l-2 pl-6">
                <Quote className="text-orange/50 mb-3 size-5" aria-hidden />
                <p className="font-display text-xl leading-relaxed text-balance md:text-2xl">
                  {CAPTAIN.quote}
                </p>
              </blockquote>
              <p className="text-muted-foreground mt-6 max-w-xl leading-relaxed">
                {CAPTAIN.bio}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="pointer-events-auto mt-8 flex items-center gap-2">
                <CaptainSocial
                  href={CAPTAIN.socials.linkedin}
                  label="LinkedIn"
                  Icon={Linkedin}
                />
                <CaptainSocial
                  href={CAPTAIN.socials.github}
                  label="GitHub"
                  Icon={Github}
                />
                <CaptainSocial
                  href={CAPTAIN.socials.instagram}
                  label="Instagram"
                  Icon={Instagram}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

function CaptainSocial({
  href,
  label,
  Icon,
}: {
  href: string | null;
  label: string;
  Icon: typeof Github;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} profile`}
      className="border-border/70 text-muted-foreground hover:border-orange hover:text-orange focus-visible:ring-ring grid size-11 place-items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <Icon className="size-4" />
    </a>
  );
}

/* --------------------------------- leads --------------------------------- */

function Leads() {
  return (
    <section className="border-b py-16 lg:py-24">
      {/* Wider than the page column so five cards can breathe. */}
      <div className="mx-auto w-full px-6 md:w-[90%] md:px-0">
        <Reveal>
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            Team leads
          </p>
          <h2 className="font-display mt-4 max-w-2xl text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
            Five teams. Each one owns a piece of every event.
          </h2>
        </Reveal>

        <div className="mt-12">
          <LeadsGrid />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- recruiting ------------------------------ */

function Recruiting() {
  return (
    <Container>
      <section className="py-20 text-center lg:py-28">
        <Reveal>
          <h2 className="font-display mx-auto max-w-2xl text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            Want a seat on this page?
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg leading-relaxed">
            Core team applications are announced whenever recruitment is open.
            Join the community first — that&apos;s where the call goes out.
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
              <Link href={routes.events}>See what we run</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </Container>
  );
}
