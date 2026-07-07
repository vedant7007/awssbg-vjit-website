/*
 * Owner: Rishikesh
 * Status: production-ready
 *
 * Full marketing page for the five AWS SBG VJIT pillars: Learn, Build,
 * Compete, Ship, Speak. Each pillar is a self-contained section with a
 * headline, a paragraph of what it means, a list of concrete activities,
 * and a plain-language statement of what members can expect.
 *
 * Design rules:
 *   - No em dashes anywhere; hyphens and commas only.
 *   - No placeholder stats or fabricated numbers.
 *   - BrandIcon used for all pillar icons.
 *   - FadeUp for scroll-driven animation.
 *   - Fully responsive using the project's Section/Container primitives.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { FadeUp } from "@/components/motion/FadeUp";
import { BrandIcon, type BrandIconName } from "@/components/brand/BrandIcon";

export const metadata: Metadata = {
  title: "Services",
  description:
    "How AWS SBG VJIT operates: five pillars - learn, build, compete, ship, and speak - that shape every workshop, project, and event we run.",
};

/* ---------------------------------------------------------------------------
 * Pillar content - real, production-grade copy for each of the five pillars.
 * Kept here rather than in lib/constants/services.ts because these long
 * descriptions are page-specific and would bloat the shared constants file.
 * --------------------------------------------------------------------------- */

type Activity = {
  label: string;
  description: string;
};

type PillarDetail = {
  key: BrandIconName;
  title: string;
  tagline: string;
  body: string;
  activities: Activity[];
  expectation: string;
};

const PILLAR_DETAILS: PillarDetail[] = [
  {
    key: "learn",
    title: "Learn",
    tagline: "Cloud foundations, built from scratch",
    body: "Every expert was once a beginner. The Learn pillar is where we meet people where they are and give them the tools to go further. Sessions cover the AWS service landscape from the ground up: compute, storage, databases, networking, and serverless. We focus on the concepts that actually show up in real projects, not exam cram sheets.",
    activities: [
      {
        label: "Cloud Foundations workshops",
        description:
          "Instructor-led sessions on core AWS services including EC2, S3, Lambda, and IAM.",
      },
      {
        label: "Pair learning circles",
        description:
          "Small groups that work through AWS Skill Builder modules together and hold each other accountable.",
      },
      {
        label: "Architecture walkthroughs",
        description:
          "Live teardowns of real AWS architectures so members understand how the pieces fit together.",
      },
      {
        label: "Certification study groups",
        description:
          "Structured revision sessions for the AWS Cloud Practitioner and Developer Associate exams.",
      },
    ],
    expectation:
      "You will leave every session with working knowledge you can apply the same day, a reference architecture, and a peer group to learn alongside.",
  },
  {
    key: "build",
    title: "Build",
    tagline: "Turn ideas into deployed, working software",
    body: "Ideas without execution are just plans. The Build pillar turns learning into practice by getting members into the AWS Management Console, writing real code, and deploying to actual infrastructure. Projects are collaborative by design: you will work with people who have complementary skills, ship something you can add to your portfolio, and learn to use the developer tools that AWS engineers use every day.",
    activities: [
      {
        label: "Project sprints",
        description:
          "Time-boxed build sessions where teams scope, build, and demo a working feature over two to four weeks.",
      },
      {
        label: "Open build nights",
        description:
          "Unstructured evenings where members work on personal or club projects and help each other debug.",
      },
      {
        label: "Tool showcases",
        description:
          "Focused demos of AWS developer tools: CDK, Amplify, SAM, CodePipeline, and more.",
      },
      {
        label: "Peer code reviews",
        description:
          "Structured feedback sessions to improve code quality and teach cloud security best practices.",
      },
    ],
    expectation:
      "You will finish each sprint with a deployed project, a pull request you are proud of, and an understanding of what it takes to get software from a laptop to the cloud.",
  },
  {
    key: "compete",
    title: "Compete",
    tagline: "Sharpen skills against a real deadline",
    body: "Competition is the fastest feedback loop. The Compete pillar prepares members for hackathons, AWS Jam events, and national cloud challenges by building the habits and instincts that matter under pressure: scoping fast, making decisions with incomplete information, and shipping something that works when the clock runs out.",
    activities: [
      {
        label: "Internal hackathons",
        description:
          "24-hour to 48-hour club-run competitions with a prompt, a judge panel, and real prizes.",
      },
      {
        label: "AWS GameDay and Jam preparation",
        description:
          "Practice sessions modeled on the AWS Jam format so members arrive ready to compete.",
      },
      {
        label: "National hackathon participation",
        description:
          "Group entry into external competitions including Smart India Hackathon and college circuit events.",
      },
      {
        label: "Post-mortem reviews",
        description:
          "Structured retrospectives after every competition to extract lessons and improve as a team.",
      },
    ],
    expectation:
      "You will get comfortable working fast and failing safely. The experience of competing under pressure translates directly into how you perform in real-world engineering roles.",
  },
  {
    key: "ship",
    title: "Ship",
    tagline: "Put your name on something live",
    body: "Building is not the same as shipping. The Ship pillar is about taking a project from working prototype to a URL that anyone on the internet can visit. That means understanding deployments, environment configurations, monitoring basics, and what happens when something breaks at 2 a.m. Members who ship learn responsibility alongside technical skill.",
    activities: [
      {
        label: "Production deployments",
        description:
          "End-to-end sessions where a club project goes from a local environment to a live AWS deployment.",
      },
      {
        label: "Infrastructure as code walkthroughs",
        description:
          "Hands-on introductions to AWS CloudFormation and CDK so deployments are repeatable and version-controlled.",
      },
      {
        label: "Monitoring and alerting setup",
        description:
          "Practical sessions on CloudWatch, logging, and setting up alerts so live projects do not fail silently.",
      },
      {
        label: "Live project showcase",
        description:
          "A regular club demo day where members present what they shipped, what broke, and what they learned.",
      },
    ],
    expectation:
      "You will know what a real deployment looks like, have at least one live project you own, and understand what it means to be responsible for something in production.",
  },
  {
    key: "speak",
    title: "Speak",
    tagline: "Share what you know, grow as a communicator",
    body: "Teaching something is the deepest form of learning it. The Speak pillar gives members a safe venue to practice presenting technical ideas, running workshops, and writing for a technical audience. The skills you build here transfer directly to job interviews, client calls, conference talks, and every team standup you will ever give.",
    activities: [
      {
        label: "Lightning talks",
        description:
          "Short 10-minute presentations on any AWS topic members have recently explored or built.",
      },
      {
        label: "Member-led workshops",
        description:
          "Club members who have mastered a topic design and run a session for their peers.",
      },
      {
        label: "Community meetups",
        description:
          "Larger-format events open to students from other colleges, with member-led content.",
      },
      {
        label: "Technical writing",
        description:
          "Guides, build logs, and how-to articles published on the club blog to document what the group ships.",
      },
    ],
    expectation:
      "You will get structured practice presenting to a technical audience in a low-stakes environment, and you will leave with recorded demos or written posts you can share with future employers.",
  },
];

/* ---------------------------------------------------------------------------
 * Page component
 * --------------------------------------------------------------------------- */

export default function ServicesPage() {
  return (
    <>
      {/* Page header */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
        <div
          className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-60"
          aria-hidden
        />
        <Container>
          <FadeUp>
            <p className="eyebrow mb-6">What we do</p>
            <h1 className="font-display max-w-3xl text-[clamp(2.5rem,5vw+1rem,5rem)] leading-[0.95] font-bold tracking-[-0.03em]">
              Five pillars. One community.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
              Every event, workshop, and project at AWS SBG VJIT ladders up to
              one of these five pillars. Together they define how we learn,
              create, and grow as cloud builders.
            </p>
          </FadeUp>
        </Container>
      </section>

      {/* Pillar overview grid */}
      <Section className="!pt-0 !pb-12">
        <SectionHeader
          eyebrow="Overview"
          title="The five pillars at a glance"
          description="Each pillar has its own rhythm of activities. You can engage with all five or go deep on the ones that match where you are right now."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PILLAR_DETAILS.map((pillar, i) => (
            <FadeUp key={pillar.key} index={i}>
              <a
                href={`#pillar-${pillar.key}`}
                className="bg-card hover:border-orange group flex h-full flex-col gap-3 rounded-sm border p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Jump to the ${pillar.title} pillar section`}
              >
                <BrandIcon
                  name={pillar.key}
                  className="text-orange"
                  aria-hidden
                />
                <p className="font-display text-base font-semibold">
                  {pillar.title}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pillar.tagline}
                </p>
              </a>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* Individual pillar sections */}
      {PILLAR_DETAILS.map((pillar, i) => (
        <PillarSection key={pillar.key} pillar={pillar} index={i} />
      ))}

      {/* Closing CTA */}
      <section className="bg-ink text-paper">
        <Container>
          <div className="flex flex-col items-start gap-8 py-24 md:flex-row md:items-center md:justify-between md:py-32">
            <div>
              <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                Ready to start building in the cloud?
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed opacity-80">
                Join AWS SBG VJIT and get access to workshops, project
                collaborators, and a community that ships.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href={routes.join}>Join AWS SBG VJIT</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * PillarSection sub-component
 * --------------------------------------------------------------------------- */

function PillarSection({
  pillar,
  index,
}: {
  pillar: PillarDetail;
  index: number;
}) {
  // Alternate layout direction for visual rhythm on desktop.
  const isEven = index % 2 === 0;

  return (
    <Section id={`pillar-${pillar.key}`} className="scroll-mt-20">
      <div
        className={`grid items-start gap-12 lg:grid-cols-2 ${isEven ? "" : "lg:[&>*:first-child]:order-2"}`}
      >
        {/* Left / main content */}
        <FadeUp>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="bg-orange/10 flex h-10 w-10 items-center justify-center rounded-sm">
                <BrandIcon
                  name={pillar.key}
                  className="text-orange size-5"
                  aria-hidden
                />
              </span>
              <p className="eyebrow">{pillar.title}</p>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {pillar.tagline}
            </h2>
            <p className="text-muted-foreground max-w-prose text-base leading-relaxed">
              {pillar.body}
            </p>
            {/* Expectation callout */}
            <div className="border-orange/30 bg-orange/5 rounded-sm border-l-2 px-4 py-3">
              <p className="text-sm font-medium leading-relaxed">
                <span className="text-orange font-semibold">What to expect: </span>
                {pillar.expectation}
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Right / activity list */}
        <FadeUp delay={0.1}>
          <ul className="flex flex-col gap-3" aria-label={`${pillar.title} activities`}>
            {pillar.activities.map((activity, j) => (
              <li
                key={j}
                className="bg-card hover:border-orange flex flex-col gap-1 rounded-sm border p-5 transition-colors"
              >
                <p className="font-display font-semibold">{activity.label}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {activity.description}
                </p>
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </Section>
  );
}
