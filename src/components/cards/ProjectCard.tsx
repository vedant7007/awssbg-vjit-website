import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/types";

/** Project card for the projects grid and landing "featured" strip. */
export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <Link
      href={routes.project(project.slug)}
      className={cn(
        "group bg-card hover:border-orange focus-visible:ring-ring flex flex-col overflow-hidden rounded-sm border transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid-backdrop size-full" aria-hidden />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          {project.title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {project.tagline}
        </p>
        {project.stack.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline" className="font-mono">
                {tech}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
