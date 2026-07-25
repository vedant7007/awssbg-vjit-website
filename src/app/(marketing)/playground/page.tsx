import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { GAMES } from "@/components/playground/games";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { RollingText } from "@/components/motion/RollingText";
import { Button } from "@/components/ui/button";
import { PlaygroundHub } from "@/components/playground/PlaygroundHub";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "A small AWS arcade: six browser games that drill core services, cloud myths, service categories, recall and cloud vocabulary. No account, no setup — scores stay on your device.",
};

const SPEC = [
  { value: String(GAMES.length).padStart(2, "0"), label: "Games" },
  { value: "00", label: "Accounts" },
  { value: "100%", label: "On device" },
] as const;

/**
 * The playground is the arcade. Six self-contained games run entirely in the
 * browser and high scores live in localStorage — nothing here talks to a
 * server, so there is no free-tier bill to fear.
 */
export default function PlaygroundPage() {
  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <div className="grid gap-12 border-b pb-16 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16 lg:pb-24">
          <Reveal>
            <p className="font-pixel text-orange mb-7 text-[0.55rem] tracking-[0.25em] sm:text-[0.65rem]">
              PLAY · TO · LEARN
            </p>
            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] font-bold tracking-[-0.035em] text-balance">
              <RollingText as="span" className="block" text="Nobody learns" />
              <RollingText
                as="span"
                className="block"
                text="AWS from a slide."
              />
            </h1>
            <p className="text-muted-foreground mt-7 max-w-xl text-lg leading-relaxed">
              Short browser games that put one cloud concept in your hands at a
              time. No account, no setup, no free-tier bill. Six are live — pick
              one and see how much actually stuck.
            </p>
          </Reveal>

          {/* The cabinet spec sheet: fills the column and states the rules of
              the arcade up front, in the same ledger language as /team. */}
          <Reveal delay={0.15}>
            <div className="ring-border/60 relative overflow-hidden rounded-2xl p-7 ring-1">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 100% at 100% 0%, color-mix(in oklab, var(--orange) 10%, transparent), transparent 65%)",
                }}
              />
              <div className="relative">
                <p className="font-pixel text-[0.6rem] tracking-[0.2em]">
                  HOW IT WORKS
                </p>

                <dl className="border-border/60 mt-7 grid grid-cols-3 gap-4 border-y py-6">
                  {SPEC.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col-reverse gap-1"
                    >
                      <dt className="text-muted-foreground font-mono text-[0.6rem] tracking-[0.14em] uppercase">
                        {row.label}
                      </dt>
                      <dd className="font-display text-3xl leading-none font-bold tabular-nums">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
                  Everything runs in your browser. Scores are saved to this
                  device only — no login, no leaderboard to game. Every AWS fact
                  in here is checked against how the service actually works.
                </p>

                <ul className="mt-7 flex flex-wrap gap-2">
                  {GAMES.map((game) => (
                    <li
                      key={game.id}
                      className="border-border/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.08em] uppercase"
                    >
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: game.accent }}
                      />
                      {game.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      <Container>
        <section className="py-16 lg:py-24">
          <PlaygroundHub />
        </section>
      </Container>

      <Container>
        <section className="border-t py-20 text-center lg:py-28">
          <Reveal>
            <h2 className="font-display mx-auto max-w-2xl text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
              Got a game idea?
            </h2>
            <p className="text-muted-foreground mx-auto mt-5 max-w-lg leading-relaxed">
              If you can explain a cloud concept in sixty seconds of play, the
              technical team will help you ship it here.
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
                <Link href={routes.team}>Meet the technical team</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </Container>
    </div>
  );
}
