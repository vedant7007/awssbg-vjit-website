"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Globe } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type {
  Project,
  Serialized,
  SerializedProjectWithContributors,
} from "@/lib/types";

interface Metric {
  label: string;
  value: string;
}

const getProjectMetrics = (slug: string): Metric[] => {
  switch (slug) {
    case "sbg-ticketing":
      return [
        { label: "SYS_UPTIME", value: "99.99%" },
        { label: "CHECKINS_PROC", value: "14,802" },
        { label: "AVG_LATENCY", value: "24ms" },
      ];
    default:
      return [
        { label: "SYS_UPTIME", value: "99.95%" },
        { label: "REQ_PROCESSED", value: "348.2K" },
        { label: "AVG_LATENCY", value: "48ms" },
      ];
  }
};

const getTagColor = (tech: string): string => {
  const t = tech.toLowerCase();
  if (
    /react|next|html|css|tailwind|vue|angular|js|ts|javascript|typescript/i.test(
      t,
    )
  ) {
    return "bg-blue-500";
  }
  if (
    /aws|firebase|dynamo|lambda|ses|gcp|azure|s3|cloudfront|docker|kubernetes/i.test(
      t,
    )
  ) {
    return "bg-purple-500";
  }
  if (/postgres|sql|mongo|prisma|graphql|redis|database|db|storage/i.test(t)) {
    return "bg-teal-500";
  }
  return "bg-pink-500";
};

/** Project card with flat, AWS-themed hero motif and 3D flip metrics readout. */
export function ProjectCard({
  project,
  className,
}: {
  project: SerializedProjectWithContributors | Project | Serialized<Project>;
  className?: string;
}) {
  const p = project as SerializedProjectWithContributors;
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleFlip = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    setIsFlipped(!isFlipped);
  };

  const metrics = getProjectMetrics(project.slug);

  return (
    <div
      className={cn(
        "group mx-auto h-[450px] w-full max-w-[400px] [perspective:1000px]",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-full w-full rounded-xl border border-white/10 bg-[#130720] text-white transition-all duration-700 [transform-style:preserve-3d] hover:border-purple-500/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.2)]",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Decorative Sci-Fi Corner Brackets on the card container */}
        <div className="pointer-events-none absolute top-2 left-2 z-30 size-2 border-t-2 border-l-2 border-white/20 transition-colors group-hover:border-purple-500/60" />
        <div className="pointer-events-none absolute top-2 right-2 z-30 size-2 border-t-2 border-r-2 border-white/20 transition-colors group-hover:border-purple-500/60" />
        <div className="pointer-events-none absolute bottom-2 left-2 z-30 size-2 border-b-2 border-l-2 border-white/20 transition-colors group-hover:border-purple-500/60" />
        <div className="pointer-events-none absolute right-2 bottom-2 z-30 size-2 border-r-2 border-b-2 border-white/20 transition-colors group-hover:border-purple-500/60" />

        {/* === FRONT FACE === */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-[#130720] p-3 text-white [backface-visibility:hidden]">
          {/* Main card viewport wrapper */}
          <div className="relative flex size-full flex-col overflow-hidden rounded-lg border border-white/5 bg-[#130720]/50">
            {/* Hero Area (Top ~52% of Card) */}
            <div className="relative flex h-[52%] w-full items-center justify-center overflow-hidden border-b border-white/5 bg-[#130720]">
              {project.coverImage ? (
                <Image
                  src={project.coverImage}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <>
                  <style>{`
                    @keyframes grid-move {
                      0% { background-position: 0 0; }
                      100% { background-position: 24px 24px; }
                    }
                  `}</style>

                  {/* Purple Center Glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_60%)]" />

                  {/* Animated Grid Texture */}
                  <div
                    className="pointer-events-none absolute inset-[-24px] opacity-25"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(168, 85, 247, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.3) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                      animation: "grid-move 4s linear infinite",
                    }}
                  />

                  {/* Fade out bottom edge to blend with border */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#130720] via-transparent to-transparent opacity-80" />
                </>
              )}

              {/* Blinking Status Indicator */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded border border-white/10 bg-[#130720]/90 px-1.5 py-0.5">
                <span className="absolute size-1.5 animate-ping rounded-full bg-green-500" />
                <span className="size-1.5 rounded-full bg-green-500" />
                <span className="font-mono text-[7px] font-bold tracking-widest text-white/80 uppercase">
                  ACTIVE
                </span>
              </div>

              {/* Project Github and Live Site icons floating on top right */}
              <div className="absolute top-3 right-3 z-20 flex gap-1.5">
                {project.repoUrl && (
                  <div className="group/tooltip relative">
                    <Link
                      href={project.repoUrl}
                      target="_blank"
                      className="flex size-7 items-center justify-center rounded border border-white/10 bg-[#130720]/90 text-white/70 transition-all duration-200 hover:scale-105 hover:border-purple-500 hover:bg-purple-500 hover:text-white focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:outline-none"
                      aria-label="View Code on GitHub"
                    >
                      <Github className="size-3.5" />
                    </Link>
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded border border-white/10 bg-[#130720] px-1.5 py-0.5 font-mono text-[8px] whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100">
                      CODE
                    </span>
                  </div>
                )}
                {project.liveUrl && (
                  <div className="group/tooltip relative">
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      className="flex size-7 items-center justify-center rounded border border-white/10 bg-[#130720]/90 text-white/70 transition-all duration-200 hover:scale-105 hover:border-purple-500 hover:bg-purple-500 hover:text-white focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:outline-none"
                      aria-label="Live Demo"
                    >
                      <Globe className="size-3.5" />
                    </Link>
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded border border-white/10 bg-[#130720] px-1.5 py-0.5 font-mono text-[8px] whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100">
                      DEMO
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Body Area (Bottom ~48% of Card) */}
            <div className="flex flex-1 flex-col bg-[#1a0b2e]/30 p-5">
              <span className="mb-1 font-mono text-[8px] tracking-widest text-purple-400/60 select-none">
                PROJECT_READOUT // 01
              </span>

              <h3 className="font-display mb-1.5 text-lg leading-snug font-bold tracking-tight text-white">
                {project.title}
              </h3>

              <p className="line-clamp-2 text-xs leading-normal text-white/60">
                {project.tagline}
              </p>

              {/* Hairline Divider & Tech Tags / Control footer */}
              <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/5 pt-3.5">
                {project.stack.length > 0 ? (
                  <div className="flex flex-1 flex-wrap gap-x-3.5 gap-y-1.5">
                    {project.stack.slice(0, 3).map((tech) => {
                      const dotColor = getTagColor(tech);
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-white/50 uppercase"
                        >
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              dotColor,
                            )}
                          />
                          {tech}
                        </span>
                      );
                    })}
                    {project.stack.length > 3 && (
                      <span className="font-mono text-[10px] text-white/30">
                        +{project.stack.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex-1" />
                )}

                <button
                  onClick={handleFlip}
                  className="shrink-0 cursor-pointer rounded border border-white/5 bg-white/5 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-purple-400/80 uppercase transition-colors select-none hover:bg-purple-500/20 hover:text-white focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:outline-none"
                  aria-label="Flip card for system stats"
                >
                  SYS.DIAG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === BACK FACE === */}
        <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col overflow-hidden rounded-xl border border-white/5 bg-[#130720] p-3 text-white [backface-visibility:hidden]">
          <div className="relative flex size-full flex-col overflow-hidden rounded-lg border border-white/5 bg-[#1a0b2e]/20 p-5">
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-purple-400/80 uppercase">
                <span className="size-1 animate-pulse bg-purple-500" />
                CONSOLE_LOG //{" "}
                {project.title.toLowerCase().replace(/\s+/g, "_")}
              </span>
              <span className="font-mono text-[8px] text-white/30">STABLE</span>
            </div>

            {/* Console Diagnostics Readout */}
            <div className="my-4 flex flex-1 flex-col justify-center gap-3.5">
              {p.populatedContributors && p.populatedContributors.length > 0 ? (
                <>
                  <div className="mb-1 font-mono text-[9px] tracking-widest text-white/40 uppercase">
                    [ SYSTEM_ARCHITECTS ]
                  </div>
                  {p.populatedContributors.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between border-b border-dashed border-white/5 pb-2.5"
                    >
                      <span className="truncate pr-2 font-mono text-[10px] tracking-wider text-white/50">
                        &gt; {member.displayName}
                      </span>
                      <span className="shrink-0 rounded border border-purple-500/10 bg-purple-500/5 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-purple-400 uppercase">
                        ENGINEER
                      </span>
                    </div>
                  ))}
                  {p.populatedContributors.length > 4 && (
                    <div className="text-center font-mono text-[9px] text-white/30 italic">
                      + {p.populatedContributors.length - 4} MORE
                    </div>
                  )}
                </>
              ) : (
                metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between border-b border-dashed border-white/5 pb-2.5"
                  >
                    <span className="font-mono text-[10px] tracking-wider text-white/50">
                      &gt; {metric.label}
                    </span>
                    <span className="rounded border border-purple-500/10 bg-purple-500/5 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-purple-400">
                      {metric.value}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Console Footer Control */}
            <div className="mt-auto flex justify-end border-t border-white/5 pt-3">
              <button
                onClick={handleFlip}
                className="cursor-pointer rounded border border-white/5 bg-white/5 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-white/60 transition-colors select-none hover:bg-white/10 hover:text-purple-400 focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:outline-none"
                aria-label="Flip card to front face"
              >
                RETURN_SYS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
