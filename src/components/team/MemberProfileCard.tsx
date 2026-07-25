"use client";

import * as React from "react";

import ProfileCard from "./ProfileCard";
import "./profile-card-theme.css";
import { TEAM_BY_KEY, initialsOf, type RosterMember } from "@/lib/constants/team";

/**
 * The member ID card — the ReactBits holographic ProfileCard: 3D tilt toward
 * the pointer, a holographic sheen, and the team's own symbol sparkling across
 * it on hover. Real photos fill the card and pick up the card's holographic
 * tint (the signature look). Per-team colour + glyph make each team distinct.
 */

/* Where the sparkle glyphs sit on the shine mask — sparse, so the effect reads
   as glints, not a wash. The mask is luminance: white = shine shows through. */
const SPARKS: [number, number, number][] = [
  [40, 46, 1.15],
  [148, 30, 0.7],
  [96, 104, 0.55],
  [196, 88, 0.95],
  [26, 150, 0.8],
  [122, 178, 1.05],
  [206, 196, 0.6],
  [70, 216, 0.75],
  [172, 138, 0.5],
  [230, 34, 0.45],
];

/** Bare `(`/`)` end an unquoted CSS url() early, so escape them by hand. */
function svgUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")}`;
}

function glyphMask(glyph: string, stroke: boolean): string {
  const paint = stroke
    ? `fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"`
    : `fill="#fff"`;
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">` +
      `<rect width="256" height="256" fill="#000"/>` +
      SPARKS.map(
        ([x, y, s]) =>
          `<path transform="translate(${x} ${y}) scale(${s})" ${paint} d="${glyph}"/>`,
      ).join("") +
      `</svg>`,
  );
}

const GRAIN = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter><rect width="140" height="140" filter="url(#n)" opacity="0.35"/></svg>`,
);

/** Dark team-tinted plate with initials, when there's no photo yet. */
function placeholder(name: string, color: string): string {
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="580" viewBox="0 0 440 580">` +
      `<rect width="440" height="580" fill="#0b0e16"/>` +
      `<circle cx="220" cy="250" r="150" fill="${color}" fill-opacity="0.28"/>` +
      `<text x="220" y="250" fill="#cfd6e4" font-family="ui-monospace, monospace" font-size="120" font-weight="700" text-anchor="middle" dominant-baseline="central">${initialsOf(name)}</text>` +
      `</svg>`,
  );
}

function alpha(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function MemberProfileCard({
  member,
  variant = "lead",
}: {
  member: RosterMember;
  variant?: "lead" | "captain";
  /** Accepted for call-site compatibility. */
  showContactButton?: boolean;
}) {
  const team = TEAM_BY_KEY[member.team];
  const photo = member.photo ?? placeholder(member.name, team.color);
  const mask = React.useMemo(
    () => glyphMask(team.glyph, team.stroke),
    [team.glyph, team.stroke],
  );

  return (
    <div style={{ "--member-accent": team.color } as React.CSSProperties}>
      <ProfileCard
        className={variant === "captain" ? "pc-captain" : "pc-lead"}
        avatarUrl={photo}
        miniAvatarUrl={photo}
        iconUrl={mask}
        grainUrl={GRAIN}
        name={member.name}
        title={member.role}
        handle={member.handle}
        status={team.label}
        showUserInfo={false}
        behindGlowColor={alpha(team.color, 0.55)}
        behindGlowSize="45%"
        innerGradient={`linear-gradient(150deg, ${alpha(team.color, 0.3)} 0%, rgba(9,11,18,0.96) 72%)`}
        enableMobileTilt={false}
      />
    </div>
  );
}
