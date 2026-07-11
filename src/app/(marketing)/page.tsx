import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { PILLARS } from "@/lib/constants/services";
import { safe } from "@/lib/utils/safe";
import { getFeaturedEvent } from "@/lib/firestore/events";
import { getFeaturedProjects } from "@/lib/firestore/projects.server";
import {
  getRandomPublicMembers,
  getMemberById,
} from "@/lib/firestore/members.server";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { FadeUp } from "@/components/motion/FadeUp";
import { BrandIcon, type BrandIconName } from "@/components/brand/BrandIcon";
import { EventCard } from "@/components/cards/EventCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { MemberCard } from "@/components/cards/MemberCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export const metadata: Metadata = {
  title: "Build the cloud, on campus",
  description:
    "AWS Student Builder Group at VJIT. A student community learning, building, and shipping on AWS. Join us to build in the cloud with people who ship.",
};

// Reads live Firestore data at request time; never prerendered at build.
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [featuredEvent, rawFeaturedProjects, members] = await Promise.all([
    safe(getFeaturedEvent(), null, "landing:featuredEvent"),
    safe(getFeaturedProjects(3), [], "landing:featuredProjects"),
    safe(getRandomPublicMembers(8), [], "landing:members"),
  ]);

  const featuredProjects = await Promise.all(
    rawFeaturedProjects.map(async (p) => {
      const contributors = await Promise.all(
        p.contributors.map(async (uid) => {
          const member = await safe(
            getMemberById(uid),
            null,
            "landing:projects:contributor",
          );
          return member
            ? {
                id: member.id,
                displayName: member.displayName,
                photoURL: member.photoURL,
                github: member.socials?.github,
              }
            : null;
        }),
      );

      return {
        ...p,
        createdAt: p.createdAt?.toDate().toISOString() ?? "",
        updatedAt: p.updatedAt?.toDate().toISOString() ?? "",
        populatedContributors: contributors.filter((c) => c !== null),
      };
    }),
  );

  return (
    <>
      <Hero />

      <Section className="!pt-8">
        <FadeUp>
          <p className="font-display max-w-3xl text-2xl leading-snug font-medium tracking-tight md:text-3xl">
            AWS SBG VJIT is a student builder group at Vidya Jyothi Institute of
            Technology. We meet to learn cloud fundamentals, build real projects
            together, and help each other ship. No gatekeeping, no fluff. If you
            want to build in the cloud, you belong here.
          </p>
        </FadeUp>
      </Section>

      <Section className="!pt-0">
        <SectionHeader
          eyebrow="What we do"
          title="Five ways to get better"
          description="Every session, project, and competition ladders up to one of these."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <FadeUp key={pillar.key} index={i}>
              <article className="bg-card hover:border-orange flex h-full flex-col gap-3 rounded-sm border p-6 transition-colors">
                <BrandIcon
                  name={pillar.key as BrandIconName}
                  className="text-orange"
                />
                <h3 className="font-display text-lg font-semibold">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHeader eyebrow="Next up" title="Featured event" />
        <div className="mt-10">
          {featuredEvent ? (
            <EventCard event={featuredEvent} featured />
          ) : (
            <EmptyState
              title="New events dropping soon"
              description="We are lining up the next workshop. Check back shortly or sign in to get notified."
              action={
                <Button asChild variant="outline">
                  <Link href={routes.events}>See all events</Link>
                </Button>
              }
            />
          )}
        </div>
      </Section>

      {featuredProjects.length > 0 ? (
        <Section className="!pt-0">
          <SectionHeader
            eyebrow="Shipped"
            title="Projects from the group"
            description="Built by students, running on AWS."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <FadeUp key={project.id} index={i}>
                <ProjectCard project={project} className="h-full" />
              </FadeUp>
            ))}
          </div>
        </Section>
      ) : null}

      {members.length > 0 ? (
        <Section className="!pt-0">
          <SectionHeader eyebrow="The people" title="Built by students" />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href={routes.members}>
                Meet everyone
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Section>
      ) : null}

      <ClosingCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-60"
        aria-hidden
      />
      <Container>
        <p className="eyebrow mb-6">AWS Student Builder Group, VJIT</p>
        <h1 className="font-display max-w-4xl text-[clamp(3rem,6vw+1rem,6rem)] leading-[0.95] font-bold tracking-[-0.03em]">
          Build the <span className="font-duo text-orange">cloud</span>, on
          campus.
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
          Learn AWS, build projects that ship, and grow with a community of
          student builders at VJIT, Hyderabad.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={routes.join}>Join AWS SBG VJIT</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={routes.events}>Explore events</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="bg-ink text-paper">
      <Container>
        <div className="flex flex-col items-start gap-8 py-24 md:flex-row md:items-center md:justify-between md:py-32">
          <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
            Your cloud journey starts with one account.
          </h2>
          <Button asChild size="lg" className="shrink-0">
            <Link href={routes.join}>Provision your account</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
