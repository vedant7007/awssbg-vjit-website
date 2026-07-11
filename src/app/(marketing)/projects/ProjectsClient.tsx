"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

import type { SerializedProjectWithContributors } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export function ProjectsClient({
  projects,
}: {
  projects: SerializedProjectWithContributors[];
}) {
  const searchParams = useSearchParams();

  // Parse initial state from URL
  const [selectedStacks, setSelectedStacks] = React.useState<string[]>(
    searchParams.getAll("stack"),
  );
  const [featuredOnly, setFeaturedOnly] = React.useState(
    searchParams.get("featured") === "true",
  );

  // Derive unique stacks from all projects for the filter options
  const allStacks = React.useMemo(() => {
    const stacks = new Set<string>();
    for (const p of projects) {
      for (const s of p.stack) stacks.add(s);
    }
    return Array.from(stacks).sort();
  }, [projects]);

  // Update URL when state changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    for (const stack of selectedStacks) {
      params.append("stack", stack);
    }
    if (featuredOnly) {
      params.set("featured", "true");
    }
    const query = params.toString();
    const newUrl = query ? `/projects?${query}` : "/projects";

    window.history.replaceState(null, "", newUrl);
  }, [selectedStacks, featuredOnly]);

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack],
    );
  };

  // Filter projects (AND logic for stacks)
  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      if (featuredOnly && !p.featured) return false;
      if (selectedStacks.length > 0) {
        const hasAllStacks = selectedStacks.every((s) => p.stack.includes(s));
        if (!hasAllStacks) return false;
      }
      return true;
    });
  }, [projects, selectedStacks, featuredOnly]);

  const hasActiveFilters = selectedStacks.length > 0 || featuredOnly;

  const clearFilters = () => {
    setSelectedStacks([]);
    setFeaturedOnly(false);
  };

  // 3D Carousel active state
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Reset activeIndex when filter output changes
  React.useEffect(() => {
    setActiveIndex(0);
  }, [filteredProjects]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev < filteredProjects.length - 1 ? prev + 1 : prev,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Horizontal Filters - Premium Pill Design */}
      <div className="bg-card/40 relative flex flex-col gap-4 rounded-2xl border border-white/10 p-2 shadow-xl shadow-black/5 backdrop-blur-2xl md:flex-row md:items-center md:justify-between dark:shadow-black/20">
        {/* Left Section: Featured Toggle & Clear */}
        <div className="flex items-center gap-2 pl-2">
          <div className="mr-2 flex items-center gap-1.5">
            <Filter className="text-orange size-4" />
            <span className="font-display text-foreground text-sm font-semibold tracking-wide">
              Filter
            </span>
          </div>

          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={cn(
              "group relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-500",
              featuredOnly
                ? "bg-orange border-orange/50 border text-white shadow-[0_0_20px_rgba(255,153,0,0.3)]"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
            )}
          >
            {featuredOnly && (
              <span className="absolute inset-0 z-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
            <Sparkles
              className={cn(
                "relative z-10 size-4 transition-transform duration-500",
                featuredOnly && "scale-110 fill-current",
              )}
            />
            <span className="relative z-10">Featured</span>
          </button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:bg-danger/10 hover:text-danger ml-2 h-8 rounded-full px-3 text-xs transition-all"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Right Section: Tech Stacks */}
        {allStacks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pr-2 md:justify-end">
            <span className="font-display text-muted-foreground mr-2 hidden text-xs font-semibold tracking-wider uppercase md:inline">
              Tech Stack
            </span>
            {allStacks.map((stack) => {
              const isActive = selectedStacks.includes(stack);
              return (
                <button
                  key={stack}
                  onClick={() => toggleStack(stack)}
                  className={cn(
                    "relative overflow-hidden rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-300",
                    isActive
                      ? "border-orange/40 bg-orange/10 text-orange scale-105 border shadow-[0_0_15px_rgba(255,153,0,0.15)]"
                      : "border-border/50 bg-background/50 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground border hover:scale-105",
                  )}
                >
                  {stack}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main View Area */}
      <div className="min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {filteredProjects.length} project
            {filteredProjects.length !== 1 && "s"}
          </p>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="flex flex-col items-center gap-8">
            {/* 3D Carousel container */}
            <div
              onKeyDown={handleKeyDown}
              tabIndex={0}
              className="relative flex h-[480px] w-full items-center justify-center overflow-hidden [perspective:1200px] [transform-style:preserve-3d] focus-visible:outline-none"
              aria-label="Projects 3D Coverflow slider. Use left and right arrow keys to navigate."
            >
              <div className="relative flex size-full items-center justify-center [transform-style:preserve-3d]">
                {filteredProjects.map((project, index) => {
                  const offset = index - activeIndex;
                  const isCenter = index === activeIndex;

                  // Hide cards far away from active view to look neat and optimize rendering
                  if (Math.abs(offset) > 2) return null;

                  // 3D parameters matching the Coverflow screenshot layout
                  const scale = isCenter ? 1 : 0.82;
                  const rotateY = offset * -28;
                  const zIndex = 100 - Math.abs(offset);
                  const opacity = isCenter ? 1 : 0.45;

                  // Responsively calculate translation offset (tighter on small displays)
                  const translateX = offset * 190;

                  return (
                    <div
                      key={project.id}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "absolute w-full max-w-[360px] origin-center cursor-pointer transition-all duration-500 ease-out select-none [transform-style:preserve-3d] md:max-w-[380px]",
                        !isCenter && "pointer-events-auto",
                      )}
                      style={{
                        transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                        zIndex,
                        opacity,
                        filter: isCenter ? "none" : "blur(1px)",
                      }}
                    >
                      <ProjectCard project={project} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slider Navigation & Pagination */}
            {filteredProjects.length > 1 && (
              <div className="flex flex-col items-center gap-4 select-none">
                {/* Chevrons control panel */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                    className="bg-card text-foreground hover:bg-orange disabled:hover:bg-card disabled:hover:text-foreground focus-visible:ring-orange flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 transition-all hover:text-white focus-visible:ring-2 focus-visible:outline-none disabled:opacity-30"
                    aria-label="Previous Project"
                  >
                    <ChevronLeft className="size-5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {filteredProjects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "size-2 cursor-pointer rounded-full transition-all duration-300",
                          index === activeIndex
                            ? "bg-orange w-4 shadow-[0_0_8px_rgba(255,153,0,0.5)]"
                            : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={activeIndex === filteredProjects.length - 1}
                    className="bg-card text-foreground hover:bg-orange disabled:hover:bg-card disabled:hover:text-foreground focus-visible:ring-orange flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 transition-all hover:text-white focus-visible:ring-2 focus-visible:outline-none disabled:opacity-30"
                    aria-label="Next Project"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>

                <span className="text-muted-foreground/60 font-mono text-[10px] tracking-wider">
                  PAGE: {activeIndex + 1} / {filteredProjects.length}
                </span>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            description="Try adjusting your filters to see more results."
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
