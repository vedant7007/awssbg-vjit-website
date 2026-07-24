"use client";

import * as React from "react";
import Image from "next/image";

import { initialsOf, type Faculty } from "@/lib/constants/team";

/**
 * Faculty card with a pointer-tracked 3D tilt and moving sheen — the same
 * depth the member cards use, so the whole team page reads as one system.
 */
export function FacultyCard({ faculty }: { faculty: Faculty }) {
  const ref = React.useRef<HTMLDivElement>(null);

  const onMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }, []);

  const onLeave = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <div
      className="group h-full"
      style={{ perspective: "1000px" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <article
        ref={ref}
        style={{
          transform:
            "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)",
        }}
        className="ring-border/60 group-hover:ring-orange/40 relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#0a0d14] ring-1 transition-[transform,box-shadow] duration-200 ease-out will-change-transform group-hover:shadow-[0_18px_50px_-14px_rgba(255,153,0,0.5)]"
      >
        <div className="bg-muted/40 relative aspect-[4/5] w-full">
          {faculty.photo ? (
            <Image
              src={faculty.photo}
              alt={faculty.name}
              fill
              sizes="(max-width: 640px) 100vw, 25vw"
              className="object-cover"
            />
          ) : (
            <span className="text-muted-foreground/50 font-display absolute inset-0 grid place-items-center text-5xl font-bold">
              {initialsOf(faculty.name)}
            </span>
          )}
          {/* pointer sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(200px circle at var(--mx,50%) var(--my,0%), rgba(255,255,255,0.5), transparent 60%)",
            }}
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl leading-snug font-semibold text-balance text-white">
            {faculty.name}
          </h3>
          <p className="text-orange mt-2 font-mono text-xs tracking-wide">
            {faculty.designation}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/55">
            {faculty.department}
          </p>
        </div>
      </article>
    </div>
  );
}
