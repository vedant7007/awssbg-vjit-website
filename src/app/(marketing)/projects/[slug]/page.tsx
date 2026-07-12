import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Github, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import { routes } from "@/lib/constants/routes";
import { safe } from "@/lib/utils/safe";
import { getProjectBySlug } from "@/lib/firestore/projects.server";
import { getMemberById } from "@/lib/firestore/members.server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await safe(
    getProjectBySlug(slug),
    null,
    "marketing:project:meta",
  );
  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Projects`,
    description: project.tagline,
  };
}

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await safe(
    getProjectBySlug(slug),
    null,
    "marketing:project:read",
  );

  if (!project) notFound();

  // Fetch all contributors
  const contributors = await Promise.all(
    project.contributors.map(async (uid) => {
      const member = await safe(
        getMemberById(uid),
        null,
        "marketing:project:contributor",
      );
      return member;
    }),
  );
  const validContributors = contributors.filter((c) => c !== null);

  return (
    <div className="pt-12 pb-24 md:pt-20">
      {/* Hero Section */}
      <div className="container mx-auto max-w-4xl space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="text-muted-foreground text-xl">{project.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-y py-4">
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="secondary" className="font-mono">
                {tech}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            {project.repoUrl && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  Code
                </a>
              </Button>
            )}
            {project.liveUrl && (
              <Button asChild size="sm" className="gap-2">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="size-4" />
                  Live Site
                </a>
              </Button>
            )}
          </div>
        </div>

        {project.coverImage && (
          <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden rounded-md border">
            <Image
              src={project.coverImage}
              alt={`${project.title} cover`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Content & Sidebar Layout */}
        <div className="grid gap-12 pt-4 md:grid-cols-3">
          <div className="prose prose-zinc dark:prose-invert max-w-none md:col-span-2">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {project.description}
            </ReactMarkdown>
          </div>

          <aside className="space-y-8">
            {validContributors.length > 0 && (
              <div className="bg-card space-y-4 rounded-md border p-6">
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  Contributors
                </h3>
                <ul className="space-y-3">
                  {validContributors.map((member) => (
                    <li key={member.id}>
                      {member.isPublic ? (
                        <Link
                          href={routes.member(member.username)}
                          className="group flex items-center gap-3"
                        >
                          <span className="bg-muted relative size-8 shrink-0 overflow-hidden rounded-full border">
                            {member.photoURL ? (
                              <Image
                                src={member.photoURL}
                                alt=""
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : null}
                          </span>
                          <span className="font-medium group-hover:underline">
                            {member.displayName}
                          </span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="bg-muted relative size-8 shrink-0 overflow-hidden rounded-full border">
                            {member.photoURL ? (
                              <Image
                                src={member.photoURL}
                                alt=""
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : null}
                          </span>
                          <span className="text-muted-foreground font-medium">
                            {member.displayName}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Architecture Diagram - Full width when present */}
      {project.architectureDiagram && (
        <div className="bg-muted/30 mt-20 border-t py-20">
          <div className="container mx-auto space-y-12 px-4 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Architecture
            </h2>
            <div className="bg-background relative mx-auto max-w-6xl overflow-hidden rounded-xl border shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.architectureDiagram}
                alt="Architecture Diagram"
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
