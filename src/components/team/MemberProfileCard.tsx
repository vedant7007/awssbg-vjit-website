"use client";

import * as React from "react";

import ProfileCard from "./ProfileCard";
import "./profile-card-theme.css";
import {
  TEAM_BY_KEY,
  initialsOf,
  type RosterMember,
} from "@/lib/constants/team";

/**
 * Holographic mask for `.pc-shine`, which is `mask-mode: luminance`: bright
 * pixels let the rainbow through, dark ones hide it. It therefore has to be
 * mostly black with a few small highlights — a uniform noise field lights the
 * whole card up and the effect turns into a flat rainbow wash.
 */
const SPARKLE_TILE = [
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
] as const;

/**
 * These end up inside an unquoted CSS `url(...)`, where a bare `(` or `)`
 * closes the token early and silently invalidates the whole declaration —
 * which is how the mask resolved to `none` and the card rendered as one flat
 * rainbow. `encodeURIComponent` leaves parens alone, so escape them by hand.
 */
function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")}`;
}

/**
 * Builds the shine mask from a team's own glyph, so hovering a Design card
 * throws diamonds and a Technical card throws chevrons. Same sparse layout in
 * every case — only the shape changes.
 */
function holoMask(glyph: string, stroke: boolean): string {
  const paint = stroke
    ? `fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"`
    : `fill="#fff"`;
  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">` +
      `<rect width="256" height="256" fill="#000"/>` +
      SPARKLE_TILE.map(
        ([x, y, s]) =>
          `<path transform="translate(${x} ${y}) scale(${s})" ${paint} d="${glyph}"/>`,
      ).join("") +
      `</svg>`,
  );
}

/** Fine grain, used by `.pc-shine::before` as a texture rather than a mask. */
const GRAIN = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter><rect width="140" height="140" filter="url(#n)" opacity="0.35"/></svg>`,
);

/**
 * Stand-in portrait until real photos arrive. Deliberately dark: the avatar
 * layer is composited with `mix-blend-mode: luminosity`, so anything bright
 * blows out into a white blob over the holographic layer underneath.
 */
function placeholderPortrait(name: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="580" viewBox="0 0 440 580">` +
    `<defs>` +
    `<linearGradient id="b" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="#2b3244"/><stop offset="100%" stop-color="#0b0e16"/>` +
    `</linearGradient>` +
    `<linearGradient id="r" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${color}" stop-opacity="0.85"/>` +
    `<stop offset="60%" stop-color="${color}" stop-opacity="0"/>` +
    `</linearGradient>` +
    `</defs>` +
    // head + shoulders, bottom-anchored so it reads as a cropped portrait
    `<path d="M220 470 c-92 0-150 40-168 110 h336 c-18-70-76-110-168-110z" fill="url(#b)"/>` +
    `<circle cx="220" cy="380" r="86" fill="url(#b)"/>` +
    `<circle cx="220" cy="380" r="86" fill="none" stroke="url(#r)" stroke-width="3"/>` +
    `<path d="M220 470 c-92 0-150 40-168 110" fill="none" stroke="url(#r)" stroke-width="3"/>` +
    `<text x="220" y="384" fill="#aeb6c6" font-family="ui-monospace, monospace" font-size="62" font-weight="700" letter-spacing="3" text-anchor="middle" dominant-baseline="central">${initialsOf(name)}</text>` +
    `</svg>`;
  return svgDataUri(svg);
}

/** `#RRGGBB` → `rgba(...)`, so team colours can drive the glow at low alpha. */
function alpha(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function MemberProfileCard({
  member,
  variant = "lead",
  showContactButton = true,
}: {
  member: RosterMember;
  variant?: "lead" | "captain";
  showContactButton?: boolean;
}) {
  const team = TEAM_BY_KEY[member.team];
  const avatar = React.useMemo(
    () => placeholderPortrait(member.name, team.color),
    [member.name, team.color],
  );

  const mask = React.useMemo(
    () => holoMask(team.glyph, team.stroke),
    [team.glyph, team.stroke],
  );

  const contact = member.socials.linkedin ?? member.socials.github;

  return (
    <div
      style={{ "--member-accent": team.color } as React.CSSProperties}
      className="w-full"
    >
      <ProfileCard
        className={variant === "captain" ? "pc-captain" : "pc-lead"}
        avatarUrl={avatar}
        miniAvatarUrl={avatar}
        iconUrl={mask}
        grainUrl={GRAIN}
        name={member.name}
        title={member.role}
        handle={member.handle}
        status={team.label}
        contactText="Connect"
        behindGlowColor={alpha(team.color, 0.45)}
        behindGlowSize="45%"
        innerGradient={`linear-gradient(150deg, ${alpha(team.color, 0.16)} 0%, rgba(8,10,16,0.94) 68%)`}
        enableMobileTilt={false}
        showContactButton={showContactButton}
        {...(contact
          ? {
              onContactClick: () => {
                window.open(contact, "_blank", "noopener,noreferrer");
              },
            }
          : {})}
      />
    </div>
  );
}
