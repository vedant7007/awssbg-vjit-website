import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, UserRoundPen, Rocket } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section, SectionHeader } from "@/components/layout/Section";
import { FadeUp } from "@/components/motion/FadeUp";

export const metadata: Metadata = {
  title: "Join",
  description:
    "Join AWS SBG VJIT. Anyone at VJIT who wants to learn the cloud and build is welcome. Sign in, complete your profile, and start building.",
};

const STEPS = [
  {
    icon: LogIn,
    title: "Sign in with Google",
    body: "Use your Google account to create your member account. It takes a few seconds and no forms to fill out first.",
  },
  {
    icon: UserRoundPen,
    title: "Complete your profile",
    body: "Pick a username, add your branch, skills, and a short bio. Your public profile lives at /m/your-username.",
  },
  {
    icon: Rocket,
    title: "Start building",
    body: "Register for the next workshop, join a project team, and show up. That is all it takes to be part of the group.",
  },
];

export default function JoinPage() {
  return (
    <div className="pt-16">
      <section className="relative overflow-hidden pt-20 pb-4 md:pt-28">
        <div
          className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-50"
          aria-hidden
        />
        <Container>
          <FadeUp>
            <p className="eyebrow mb-6">Get started</p>
            <h1 className="font-display max-w-3xl text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[0.98] font-bold tracking-[-0.03em]">
              Join AWS SBG VJIT.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
              Membership is open to any student at VJIT who wants to build in
              the cloud. No experience required, no branch or year restriction.
              If you are willing to learn and show up, you belong here.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={routes.signin}>Sign in to get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.events}>See upcoming events</Link>
              </Button>
            </div>
          </FadeUp>
        </Container>
      </section>

      <Section>
        <SectionHeader
          eyebrow="How it works"
          title="Three steps to get in"
          description="From zero to member in a few minutes."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeUp key={step.title} index={i}>
              <article className="bg-card flex h-full flex-col gap-3 rounded-sm border p-6">
                <div className="flex items-center gap-3">
                  <span className="bg-orange/10 flex size-9 items-center justify-center rounded-sm">
                    <step.icon className="text-orange size-5" aria-hidden />
                  </span>
                  <span className="text-muted-foreground font-mono text-xs">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.body}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="bg-paper-warm rounded-sm border p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Ready when you are.
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md leading-relaxed">
            Create your account today and complete your profile before the next
            session.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href={routes.signin}>Create your account</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}
