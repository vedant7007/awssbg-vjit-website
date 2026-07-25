import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { CLUB, ABOUT, CLOSING_CTA } from "@/lib/constants/club";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { HeroGrid } from "@/components/home/HeroGrid";
import { CtaBackdrop } from "@/components/motion/CtaBackdrop";
import { WhatWeDoScroller } from "@/components/home/WhatWeDoScroller";
import { ImpactStars } from "@/components/home/ImpactStars";
import { MomentsSection } from "@/components/home/MomentsSection";

export const metadata: Metadata = {
  title: "Learn cloud. Build projects. Grow together.",
  description: CLUB.intro,
};

export default function LandingPage() {
  return (
    <>
      <HeroGrid />
      <AboutSection />
      <WhatWeDoScroller />
      <ImpactStars />
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

/** Full-screen closer with the interactive PixelBlast backdrop. */
function JoinSection() {
  return (
    <section className="bg-background relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CtaBackdrop />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, transparent 12%, var(--background) 72%)",
        }}
      />

      <Container className="pointer-events-none relative z-10 text-center">
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
          <div className="pointer-events-auto mt-10 flex justify-center">
            <Button
              asChild
              size="lg"
              className="glow-pill rounded-full px-9 hover:shadow-[0_0_28px_-4px_rgba(255,153,0,0.7)]"
            >
              <Link href={routes.join} className="group">
                Join the community
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground/70 mt-6 font-mono text-xs tracking-wide">
            One form. Then you&apos;re in.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
