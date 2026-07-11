import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  TerminalSquare,
  Presentation,
  Trophy,
  Cloud,
  Hammer,
  HeartHandshake,
  Target,
  ArrowRight,
  Eye,
} from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { FadeUp } from "@/components/motion/FadeUp";
import { BorderGlow } from "@/components/ui/BorderGlow";
import { NetworkVisualizer } from "@/components/ui/NetworkVisualizer";

export const metadata: Metadata = {
  title: "About",
  description: "What AWS SBG VJIT is and who it is for.",
  alternates: {
    canonical: "/about",
  },
};

const WHAT_WE_DO = [
  {
    title: "Workshops",
    description:
      "Deep dives into specific AWS services and deployment strategies.",
    icon: TerminalSquare,
  },
  {
    title: "Hackathons",
    description:
      "Time-bound challenges to build and ship solutions collaboratively.",
    icon: Trophy,
  },
  {
    title: "Technical Sessions",
    description:
      "Weekly meetups focusing on cloud architecture and best practices.",
    icon: Presentation,
  },
  {
    title: "Cloud Learning",
    description: "Structured pathways to master cloud fundamentals.",
    icon: Cloud,
  },
  {
    title: "Projects",
    description: "Long-term group projects solving real-world problems on AWS.",
    icon: Hammer,
  },
  {
    title: "Community Events",
    description:
      "Networking meetups, cloud panels, and collaborative gatherings.",
    icon: HeartHandshake,
  },
];

const BENEFITS = [
  {
    title: "Learning AWS",
    description:
      "Master cloud architecture, deployment strategies, and core AWS services.",
    icon: Cloud,
  },
  {
    title: "Building Projects",
    description:
      "Collaborate on real-world projects, deploying actual software on the cloud.",
    icon: Hammer,
  },
  {
    title: "Networking",
    description:
      "Connect with industry professionals, mentors, and fellow student builders.",
    icon: Users,
  },
  {
    title: "Hackathons",
    description:
      "Participate in intense building sprints and test your system designs.",
    icon: Trophy,
  },
  {
    title: "Leadership Opportunities",
    description:
      "Take ownership of initiatives, lead sessions, and guide peer projects.",
    icon: Target,
  },
  {
    title: "Community",
    description:
      "Join a supportive, developer-first culture where help is always available.",
    icon: HeartHandshake,
  },
];

const MILESTONES = [
  {
    date: "August 2024",
    title: "Group Founded",
    description:
      "AWS Student Builder Group at VJIT was established to create a hub for cloud builders and engineers on campus.",
  },
  {
    date: "October 2024",
    title: "First Cloud Practitioner Workshop",
    description:
      "Hosted our inaugural cloud workshop introducing 150+ students to global infrastructure basics.",
  },
  {
    date: "December 2024",
    title: "National Hackathon Finalists",
    description:
      "Multiple teams composed of our active members entered the national finals of SIH 24 with cloud-powered prototypes.",
  },
  {
    date: "April 2025",
    title: "Peer Certification Initiative",
    description:
      "Launched structured peer-led mentorship groups helping students prepare for AWS certifications.",
  },
];

const ACHIEVEMENTS = [
  {
    metric: "300+",
    label: "Active Members",
    title: "Official Club Onboarding",
    description:
      "Formally recognized as the official cloud engineering student group by VJIT administration, scaling to hundreds of builders.",
  },
  {
    metric: "50+",
    label: "Certifications",
    title: "AWS Certification Milestone",
    description:
      "Over 50 members cleared their AWS Cloud Practitioner or Solutions Architect certificates through our structured peer cohorts.",
  },
  {
    metric: "12+",
    label: "Live Deployed Apps",
    title: "Cloud Hackathon Success",
    description:
      "Organized intense overnight building sprints yielding serverless and cloud-native prototypes taken forward as active club projects.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Hero />

      {/* 1. Who We Are */}
      <Section className="!pt-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <SectionHeader
              eyebrow="Who We Are"
              title="AWS Student Builder Group VJIT"
              description="A student-led AWS learning community dedicated to cloud engineering excellence."
              className="max-w-none"
            />
            <FadeUp>
              <p className="font-display mt-4 text-xl leading-relaxed font-medium tracking-tight md:text-2xl">
                AWS Student Builder Group at VJIT is a community-driven
                initiative dedicated to bridging the gap between academic
                learning and industry-standard cloud engineering. We are a
                collective of developers, designers, and cloud enthusiasts
                building real-world software together.
              </p>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                We believe the best way to master the cloud is by getting our
                hands dirty—provisioning instances, deploying serverless APIs,
                setting up CDN edge caches, and launching production-ready
                software.
              </p>
            </FadeUp>
          </div>

          <div className="col-span-1 block w-full lg:col-span-5">
            <FadeUp delay={0.2}>
              <NetworkVisualizer />
            </FadeUp>
          </div>
        </div>
      </Section>

      {/* 2. Our Journey */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Our Journey"
          title="Milestones"
          description="A timeline of our foundation, growth, and community achievements."
        />
        <div className="border-border/80 relative mt-16 ml-4 max-w-4xl space-y-12 border-l-2 pl-6 md:ml-6 md:pl-8">
          {MILESTONES.map((milestone, i) => (
            <FadeUp key={milestone.title} index={i}>
              <div className="relative">
                {/* Stepper Dot */}
                <span className="border-orange bg-card absolute top-1.5 -left-[31px] flex size-5 items-center justify-center rounded-full border shadow-[0_0_10px_rgba(255,153,0,0.3)] md:-left-[39px]">
                  <span className="bg-orange size-2 animate-pulse rounded-full" />
                </span>

                <div className="bg-card border-border/60 hover:border-orange/40 group relative overflow-hidden rounded-sm border p-6 transition-all hover:shadow-[0_4px_20px_-10px_rgba(255,153,0,0.1)] md:p-8">
                  <div className="from-orange/5 pointer-events-none absolute top-0 right-0 size-24 bg-gradient-to-bl to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <p className="text-orange mb-2 font-mono text-xs font-bold tracking-wider uppercase">
                    {milestone.date}
                  </p>
                  <h3 className="font-display text-foreground mb-3 text-xl font-bold">
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                    {milestone.description}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* 3. Vision & Mission */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Vision & Mission"
          title="Our guiding light"
          description="The goals that direct our learning and long-term ecosystem."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <FadeUp delay={0.1}>
            <BorderGlow className="h-full">
              <div className="bg-card group relative flex h-full flex-col gap-4 overflow-hidden p-8">
                <div className="from-orange/5 pointer-events-none absolute top-0 right-0 size-32 bg-gradient-to-bl to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="bg-orange/10 text-orange flex size-12 shrink-0 items-center justify-center rounded-full">
                  <Target className="size-6" />
                </div>
                <h3 className="font-display text-foreground mt-2 text-2xl font-bold tracking-tight">
                  Our Mission
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  To democratize cloud computing education on campus by
                  providing the resources, mentorship, and environment needed
                  for students to build and deploy robust applications.
                </p>
              </div>
            </BorderGlow>
          </FadeUp>
          <FadeUp delay={0.2}>
            <BorderGlow className="h-full">
              <div className="bg-card group relative flex h-full flex-col gap-4 overflow-hidden p-8">
                <div className="from-blue/5 pointer-events-none absolute top-0 right-0 size-32 bg-gradient-to-bl to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="bg-blue/10 text-blue flex size-12 shrink-0 items-center justify-center rounded-full">
                  <Eye className="size-6" />
                </div>
                <h3 className="font-display text-foreground mt-2 text-2xl font-bold tracking-tight">
                  Our Vision
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  A campus where every student has the confidence and capability
                  to architect cloud-native solutions, transforming ideas into
                  shipped products.
                </p>
              </div>
            </BorderGlow>
          </FadeUp>
        </div>
      </Section>

      {/* 4. What We Do */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="What We Do"
          title="How we operate"
          description="We run various initiatives to keep our community engaged and learning."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_WE_DO.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeUp key={item.title} index={i}>
                <BorderGlow className="h-full">
                  <article className="bg-card group relative flex h-full flex-col gap-3 overflow-hidden p-6.5 transition-all">
                    <div className="bg-orange/10 text-orange mb-1 flex size-11 items-center justify-center rounded-sm transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-foreground text-lg font-bold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </article>
                </BorderGlow>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      {/* 5. Achievements */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Achievements"
          title="Our track record"
          description="Real milestones and recognitions earned by our community."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((ach, i) => (
            <FadeUp key={ach.title} index={i}>
              <BorderGlow className="h-full">
                <article className="bg-card hover:bg-card/85 flex h-full flex-col gap-4 p-8 transition-all">
                  <div className="flex items-baseline gap-2">
                    <span className="font-duo text-orange text-5xl font-black tracking-tight">
                      {ach.metric}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                      {ach.label}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <h3 className="font-display text-foreground text-lg font-bold">
                      {ach.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </article>
              </BorderGlow>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* 6. Leadership */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Leadership"
          title="Driven by students"
          description="Meet the core team orchestrating workshops, hackathons, and operations."
        />
        <FadeUp>
          <div className="bg-card border-border/80 group relative mt-12 flex flex-col gap-8 overflow-hidden rounded-sm border p-8 md:flex-row md:items-center md:justify-between md:p-10">
            {/* Subtle glow border hover */}
            <div className="from-orange/5 to-purple/5 absolute inset-0 -z-10 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="max-w-2xl space-y-3">
              <h3 className="font-display text-foreground text-xl font-bold">
                Want to meet the people behind the cloud on campus?
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Our leadership team consists of passionate student cloud
                builders dedicated to creating a thriving AWS developer
                ecosystem at VJIT. They lead our technical direction, coordinate
                logistics, manage design, and organize community outreach.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                asChild
                size="lg"
                className="group relative w-full overflow-hidden md:w-auto"
              >
                <Link href={routes.team} className="flex items-center gap-2">
                  View Our Team
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* 7. Why Join Us? */}
      <Section className="!pt-0">
        <SectionHeader
          eyebrow="Why Join Us?"
          title="Grow as a builder"
          description="The benefits of becoming a member of the AWS SBG VJIT community."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <FadeUp key={benefit.title} index={i}>
                <BorderGlow className="h-full">
                  <article className="bg-card group relative flex h-full flex-col gap-3 overflow-hidden p-6.5 transition-all">
                    <div className="bg-orange/10 text-orange mb-1 flex size-11 items-center justify-center rounded-sm transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-foreground text-lg font-bold">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </article>
                </BorderGlow>
              </FadeUp>
            );
          })}
        </div>
      </Section>

      {/* 8. Join the Community */}
      <ClosingCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
      {/* Background glow overlay */}
      <div className="from-orange/15 to-blue/5 pointer-events-none absolute top-1/3 left-1/4 -z-20 size-96 rounded-full bg-gradient-to-tr opacity-70 blur-[100px] filter" />
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-45"
        aria-hidden
      />
      <Container>
        <FadeUp>
          <p className="eyebrow mb-6">About Us</p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="font-display max-w-4xl text-[clamp(3rem,6vw+1rem,6rem)] leading-[0.95] font-bold tracking-[-0.03em]">
            Empowering the{" "}
            <span className="font-duo text-orange">next generation</span> of
            cloud builders.
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
            We are more than just a club. We are a community of students who
            believe in learning by doing, helping each other debug, and
            launching real products on AWS.
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="group">
              <Link href={routes.join} className="flex items-center gap-2">
                Join the Community
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.team}>Meet the Team</Link>
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="bg-ink text-paper relative overflow-hidden py-24 md:py-36">
      {/* Background visual graphics */}
      <div className="from-orange/20 via-orange/5 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial to-transparent opacity-75 blur-[120px] filter" />
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 -z-20 opacity-30"
        aria-hidden
      />

      <Container>
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <FadeUp>
            <p className="text-orange font-mono text-xs font-bold tracking-widest uppercase">
              Join AWS SBG VJIT
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display text-foreground text-4xl font-extrabold tracking-tight md:text-6xl">
              Ready to start building in the{" "}
              <span className="font-duo text-orange">cloud</span>?
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-muted-foreground mx-auto max-w-xl text-lg leading-relaxed">
              Get access to AWS learning pathways, peer-led debug sessions,
              hackathons, and a community that ships real software.
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group relative w-full overflow-hidden sm:w-auto"
              >
                <Link href={routes.join} className="flex items-center gap-2">
                  Become a Member
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5 sm:w-auto"
              >
                <Link href={routes.team}>Meet the Builders</Link>
              </Button>
            </div>
          </FadeUp>
        </div>
      </Container>
    </section>
  );
}
