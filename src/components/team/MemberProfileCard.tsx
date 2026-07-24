"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import {
  TEAM_BY_KEY,
  initialsOf,
  type RosterMember,
} from "@/lib/constants/team";

/**
 * A member's ID card. Shows their real photo when we have one, a team-coloured
 * initials plate otherwise. Tilts toward the pointer in 3D on hover, with a
 * moving sheen and the team's accent glow — the depth the placeholder version
 * only faked. Pure pointer maths, no engine.
 */
export function MemberProfileCard({
  member,
  variant = "lead",
}: {
  member: RosterMember;
  /** Kept for call-site compatibility; the captain gets a taller card. */
  variant?: "lead" | "captain";
  /** Accepted for compatibility with older call sites; unused here. */
  showContactButton?: boolean;
}) {
  const team = TEAM_BY_KEY[member.team];
  const ref = React.useRef<HTMLDivElement>(null);

  const onMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
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
      className="group"
      style={{ perspective: "900px" }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div
        ref={ref}
        style={
          {
            "--accent": team.color,
            transform:
              "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)",
          } as React.CSSProperties
        }
        className={cn(
          "relative w-full overflow-hidden bg-[#0a0d14] shadow-lg shadow-black/30 transition-[transform,box-shadow] duration-200 ease-out will-change-transform group-hover:shadow-[0_18px_50px_-12px_var(--accent)]",
          variant === "captain" ? "aspect-[0.72]" : "aspect-[0.78]",
        )}
      >
        {/* photo / initials */}
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 18vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 22%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%), #0a0d14",
            }}
          >
            <span
              className="font-display text-6xl font-bold"
              style={{ color: team.color }}
            >
              {initialsOf(member.name)}
            </span>
          </div>
        )}

        {/* bottom fade so the name always reads */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5"
          style={{
            background:
              "linear-gradient(to top, #05070c 4%, rgba(5,7,12,0.72) 42%, transparent)",
          }}
        />

        {/* pointer sheen, only on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mx,50%) var(--my,0%), rgba(255,255,255,0.55), transparent 60%)",
          }}
        />

        {/* accent border on hover */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            boxShadow:
              "inset 0 0 0 1px color-mix(in oklab, var(--accent) 45%, transparent)",
          }}
        />

        {/* team tag */}
        <span
          className="absolute top-3 left-3 font-mono text-[0.62rem] tracking-[0.16em] uppercase"
          style={{ color: team.color, textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
        >
          {team.wrap[0]}
          {team.label}
          {team.wrap[1]}
        </span>

        {/* name + role */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="font-display text-lg leading-tight font-bold text-white">
            {member.name}
          </h3>
          <p
            className="mt-0.5 font-mono text-[0.65rem] tracking-[0.12em] uppercase"
            style={{ color: "color-mix(in oklab, var(--accent) 85%, white)" }}
          >
            {member.role}
          </p>
        </div>
      </div>
    </div>
  );
}
