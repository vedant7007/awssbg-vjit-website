"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { NetworkField } from "@/components/motion/NetworkField";
import { CountUp } from "@/components/motion/CountUp";
import { Countdown } from "@/components/motion/Countdown";

const COMMAND = "aws sbg join --vjit";

const STACK = [
  "EC2",
  "S3",
  "Lambda",
  "DynamoDB",
  "Amplify",
  "Bedrock",
  "CloudFront",
  "IAM",
  "SageMaker",
  "Route 53",
  "API Gateway",
  "Cognito",
];

const rise = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

export function HeroConsole({
  memberCount,
  projectCount,
  eventCount,
  nextEvent,
}: {
  memberCount: number;
  projectCount: number;
  eventCount: number;
  nextEvent: { title: string; href: string; startAtISO: string } | null;
}) {
  const typed = useTyped(COMMAND);

  return (
    <section className="console relative isolate overflow-hidden">
      {/* Signature background: constellation + ambient glow + fine grid. */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div className="aurora" />
        <div className="console-grid absolute inset-0" />
        <NetworkField className="absolute inset-0 h-full w-full opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0b0f17] to-transparent" />
      </div>

      <Container className="relative">
        <div className="flex flex-col items-start pt-36 pb-16 md:pt-44 md:pb-24">
          {/* Terminal chip — the builder vernacular, typing itself in. */}
          <motion.div
            {...rise}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glow-pill inline-flex items-center gap-3 rounded-sm border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/70 backdrop-blur"
          >
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2 rounded-full bg-[#ff5f56]" />
              <span className="size-2 rounded-full bg-[#ffbd2e]" />
              <span className="size-2 rounded-full bg-[#27c93f]" />
            </span>
            <span className="text-white/40">~/aws-sbg-vjit</span>
            <span className="text-orange">
              $ {typed}
              <span className="animate-caret bg-orange ml-0.5 inline-block h-3.5 w-1.5 -translate-y-px align-middle" />
            </span>
          </motion.div>

          {/* Thesis headline. */}
          <motion.h1
            {...rise}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.08,
            }}
            className="font-display mt-7 max-w-5xl text-[clamp(3rem,7vw+1rem,7rem)] leading-[0.92] font-bold tracking-[-0.035em] text-white"
          >
            Build the <span className="text-sheen">cloud</span>,
            <br className="hidden sm:block" /> on campus.
          </motion.h1>

          <motion.p
            {...rise}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.16,
            }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/60"
          >
            The AWS Student Builder Group at VJIT, Hyderabad. We learn the cloud
            hands-on, build projects that actually ship, and level up together —
            no gatekeeping.
          </motion.p>

          <motion.div
            {...rise}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.24,
            }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="glow-pill hover:shadow-[0_0_28px_-4px_rgba(255,153,0,0.7)]"
            >
              <Link href={routes.join}>Join the group</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/0 text-white hover:bg-white/5 hover:text-white"
            >
              <Link href={routes.events} className="group">
                Explore events
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>

          {/* Next-event countdown — real, from the featured event. */}
          {nextEvent ? (
            <motion.div
              {...rise}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
              className="mt-10 w-full max-w-lg"
            >
              <Link
                href={nextEvent.href}
                className="glow-card group flex items-center gap-4 rounded-sm px-4 py-3"
              >
                <span className="animate-glow bg-orange size-2 shrink-0 rounded-full" />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[0.65rem] tracking-widest text-white/40 uppercase">
                    Next up
                  </span>
                  <span className="block truncate text-sm font-medium text-white">
                    {nextEvent.title}
                  </span>
                </span>
                <Countdown
                  targetISO={nextEvent.startAtISO}
                  className="shrink-0 font-mono text-sm text-white/80"
                />
              </Link>
            </motion.div>
          ) : null}

          {/* Live stats — real counts, counting up. */}
          <motion.dl
            {...rise}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.36,
            }}
            className="mt-8 grid w-full max-w-lg grid-cols-3 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 font-mono"
          >
            <Stat label="builders" value={memberCount} />
            <Stat label="projects" value={projectCount} />
            <Stat label="events" value={eventCount} />
          </motion.dl>
        </div>
      </Container>

      {/* Tech ticker — the stack we build on, always moving. */}
      <div className="relative border-y border-white/10 bg-white/[0.02] py-3">
        <div className="marquee-track flex w-max gap-8 pr-8 font-mono text-sm whitespace-nowrap text-white/35">
          {[...STACK, ...STACK].map((svc, i) => (
            <span key={i} className="inline-flex items-center gap-8">
              <span className="text-orange/60">◆</span>
              {svc}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#0b0f17] px-4 py-4">
      <dd className="text-3xl font-semibold text-white tabular-nums">
        <CountUp value={value} />
      </dd>
      <dt className="mt-1 text-xs tracking-wide text-white/40 uppercase">
        {label}
      </dt>
    </div>
  );
}

/** Types out `text` once, respecting reduced motion (renders full text). */
function useTyped(text: string) {
  const [out, setOut] = React.useState("");

  React.useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setOut(text);
      return;
    }

    let i = 0;
    setOut("");
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 55);

    return () => window.clearInterval(id);
  }, [text]);

  return out;
}
