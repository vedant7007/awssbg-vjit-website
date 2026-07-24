import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";
import { PlaygroundHub } from "@/components/playground/PlaygroundHub";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "A small AWS arcade: three browser games that drill core services, cloud myths, and architecture calls. No account, no setup — scores stay on your device.",
};

/**
 * The playground is now playable. Three self-contained games run entirely in
 * the browser; high scores live in localStorage. Nothing here talks to a
 * server, so there is no free-tier bill to fear.
 */
export default function PlaygroundPage() {
  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <div className="grid gap-12 border-b pb-16 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-20 lg:pb-24">
          <Reveal>
            <p className="font-pixel text-orange mb-7 text-[0.55rem] tracking-[0.25em] sm:text-[0.65rem]">
              PLAY · TO · LEARN
            </p>
            <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] font-bold tracking-[-0.035em] text-balance">
              Nobody learns
              <br />
              AWS from a slide.
            </h1>
            <p className="text-muted-foreground mt-7 max-w-xl text-lg leading-relaxed">
              Short browser games that put one cloud concept in your hands at a
              time. No account, no setup, no free-tier bill. Three are live —
              pick one and see how much actually stuck.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="border-border/60 border-l-2 py-2 pl-6">
              <p className="font-pixel text-[0.6rem] tracking-[0.2em]">
                HOW IT WORKS
              </p>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                Everything runs in your browser. Scores are saved to this device
                only — no login, no leaderboard to game. Every AWS fact in here
                is checked against how the service actually works.
              </p>
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
