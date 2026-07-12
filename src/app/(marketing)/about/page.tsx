import type { Metadata } from "next";
import Link from "next/link";
import { Compass, HandHeart, Sparkles, Users } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section, SectionHeader } from "@/components/layout/Section";
import { FadeUp } from "@/components/motion/FadeUp";

export const metadata: Metadata = {
  title: "About",
  description:
    "AWS SBG VJIT is a student builder community at Vidya Jyothi Institute of Technology, learning cloud fundamentals and shipping real projects on AWS.",
};

const VALUES = [
  {
    icon: HandHeart,
    title: "Everyone starts somewhere",
    body: "No prior cloud experience needed. We meet people where they are and give them a path forward, together.",
  },
  {
    icon: Sparkles,
    title: "Build in the open",
    body: "We learn by shipping. Real projects, real deployments, real feedback, not slideware.",
  },
  {
    icon: Users,
    title: "Lift as you climb",
    body: "The person a step ahead teaches the person a step behind. Knowledge compounds when it is shared.",
  },
  {
    icon: Compass,
    title: "Honest by default",
    body: "We do not inflate numbers or overpromise. We show what we actually built and what we learned doing it.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      <section className="relative overflow-hidden pt-20 pb-4 md:pt-28">
        <div
          className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-50"
          aria-hidden
        />
        <Container>
          <FadeUp>
            <p className="eyebrow mb-6">About</p>
            <h1 className="font-display max-w-3xl text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[0.98] font-bold tracking-[-0.03em]">
              A student community learning to build on the cloud.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
              AWS SBG VJIT is the AWS Student Builder Group at Vidya Jyothi
              Institute of Technology, Hyderabad. We are students who want to go
              beyond the syllabus, learn how the cloud actually works, and build
              things that run in production.
            </p>
          </FadeUp>
        </Container>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <FadeUp>
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                Why we exist
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cloud skills are in demand everywhere, but they are rarely
                taught hands-on in a classroom. AWS SBG VJIT closes that gap. We
                run workshops, build projects in teams, enter hackathons, and
                help each other ship. Membership is open to anyone on campus who
                is willing to learn and build, regardless of branch or year.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We are part of the global AWS Student Builder Group program, but
                everything here is student-led. The sessions, the projects, and
                the direction come from members.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="border-orange/30 bg-orange/5 rounded-sm border-l-2 p-6 md:p-8">
              <p className="eyebrow mb-3">Our mission</p>
              <p className="font-display text-xl leading-snug font-medium md:text-2xl">
                Give every student at VJIT a place to learn the cloud by
                building, and a community that helps them ship.
              </p>
            </div>
          </FadeUp>
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHeader
          eyebrow="What we value"
          title="How we work"
          description="Four principles that shape every session, project, and decision."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {VALUES.map((value, i) => (
            <FadeUp key={value.title} index={i}>
              <article className="bg-card flex h-full flex-col gap-3 rounded-sm border p-6">
                <value.icon className="text-orange size-6" aria-hidden />
                <h3 className="font-display text-lg font-semibold">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.body}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </Section>

      <section className="bg-ink text-paper">
        <Container>
          <div className="flex flex-col items-start gap-8 py-20 md:flex-row md:items-center md:justify-between md:py-28">
            <div>
              <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                Come build with us.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed opacity-80">
                Meet the people behind the group, or jump straight in and create
                your account.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={routes.join}>Join AWS SBG VJIT</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-paper/10 text-paper hover:bg-paper/20"
              >
                <Link href={routes.team}>Meet the team</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
