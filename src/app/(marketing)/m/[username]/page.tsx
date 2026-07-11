import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Github, Linkedin, Twitter, Globe, Lock } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { initials } from "@/lib/utils/format";
import { safe } from "@/lib/utils/safe";
import { getMemberByUsername } from "@/lib/firestore/members.server";
import { getAttendedEventIds } from "@/lib/firestore/registrations";
import { getEventsByIds } from "@/lib/firestore/events";
import { getProjectsByContributor } from "@/lib/firestore/projects";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { QRDisplay } from "@/components/qr/QRDisplay";
import { EventCard } from "@/components/cards/EventCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Params = { username: string };

async function loadMember(username: string): Promise<Member | null> {
  return safe(getMemberByUsername(username), null, "profile:member");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  const member = await loadMember(username.toLowerCase());
  if (!member || !member.isPublic) {
    return { title: "Member", robots: { index: false } };
  }
  const title = `${member.displayName} (@${member.username})`;
  const description =
    member.bio || `${member.displayName} is a member of AWS SBG VJIT.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/m/${member.username}`,
    },
    openGraph: {
      title,
      description,
      url: `/m/${member.username}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;

  // Usernames are strictly lowercase; redirect any uppercase variants.
  if (username !== username.toLowerCase()) {
    redirect(routes.member(username));
  }

  const member = await loadMember(username);
  if (!member) notFound();

  if (!member.isPublic) {
    return <PrivateProfile member={member} />;
  }

  const [attendedIds, projects] = await Promise.all([
    safe(getAttendedEventIds(member.id), [], "profile:attendedIds"),
    safe(getProjectsByContributor(member.id), [], "profile:projects"),
  ]);
  const events = await safe(
    getEventsByIds(attendedIds),
    [],
    "profile:attendedEvents",
  );

  const profileUrl = `${SITE_URL}${routes.member(member.username)}`;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.displayName,
    jobTitle:
      member.role === "lead" ? `${member.team || "Team"} Lead` : member.role,
    worksFor: {
      "@type": "Organization",
      name: "AWS Student Builder Group VJIT",
      url: SITE_URL,
    },
    image: member.photoURL || undefined,
    description: member.bio || undefined,
    url: profileUrl,
  };

  return (
    <div className="pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <section className="bg-paper-warm border-b">
        <Container>
          <div className="flex flex-col gap-8 py-14 md:flex-row md:items-end">
            <div className="bg-muted relative size-40 shrink-0 overflow-hidden rounded-sm md:size-48">
              {member.photoURL ? (
                <Image
                  src={member.photoURL}
                  alt={member.displayName}
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="font-display text-muted-foreground flex size-full items-center justify-center text-4xl">
                  {initials(member.displayName)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                {member.displayName}
              </h1>
              <p className="font-duo text-orange mt-2 text-lg">
                @{member.username}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="capitalize">{member.role}</Badge>
                {member.team ? (
                  <Badge variant="secondary">{member.team}</Badge>
                ) : null}
                <Badge variant="outline" className="font-mono">
                  Cohort {member.cohortYear}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {member.branch} &apos;{String(member.batchYear).slice(-2)}
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="grid gap-12 py-14 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {member.bio ? (
              <p className="max-w-2xl text-lg leading-relaxed">{member.bio}</p>
            ) : null}

            {member.skills.length > 0 ? (
              <div>
                <h2 className="eyebrow mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <Socials socials={member.socials} />

            {events.length > 0 ? (
              <div>
                <h2 className="eyebrow mb-4">Events attended</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ) : null}

            {projects.length > 0 ? (
              <div>
                <h2 className="eyebrow mb-4">Projects</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card flex flex-col items-center rounded-sm border p-6">
              <QRDisplay
                value={profileUrl}
                caption="This is what your ID card links to."
              />
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Socials({ socials }: { socials: Member["socials"] }) {
  const items = [
    { key: "github", href: socials.github, Icon: Github, label: "GitHub" },
    {
      key: "linkedin",
      href: socials.linkedin,
      Icon: Linkedin,
      label: "LinkedIn",
    },
    { key: "twitter", href: socials.twitter, Icon: Twitter, label: "Twitter" },
    { key: "website", href: socials.website, Icon: Globe, label: "Website" },
  ].filter((item) => Boolean(item.href));

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, href, Icon, label }) => (
        <Link
          key={key}
          href={href as string}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:border-orange inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-sm transition-colors"
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </Link>
      ))}
    </div>
  );
}

function PrivateProfile({ member }: { member: Member }) {
  return (
    <div className="flex min-h-[70vh] items-center pt-16">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <div className="bg-muted relative size-28 overflow-hidden rounded-sm">
            {member.photoURL ? (
              <Image
                src={member.photoURL}
                alt={member.displayName}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              <span className="font-display text-muted-foreground flex size-full items-center justify-center text-2xl">
                {initials(member.displayName)}
              </span>
            )}
          </div>
          <Badge variant="secondary" className="gap-1 capitalize">
            <Lock className="size-3" />
            {member.role}
          </Badge>
          <h1 className="font-display text-2xl font-semibold">
            This profile is private.
          </h1>
          <p className="text-muted-foreground">
            This member has chosen not to make their profile public.
          </p>
        </div>
      </Container>
    </div>
  );
}
