import Image from "next/image";
import { Github, Linkedin, Instagram } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  TEAM_BY_KEY,
  initialsOf,
  type RosterMember,
} from "@/lib/constants/team";

/**
 * One member's public profile. Shared verbatim by the on-page dialog and the
 * `/m/[username]` page that the QR code on the physical badges points at, so
 * scanning a badge and tapping a card land on exactly the same thing.
 */
export function MemberProfile({
  member,
  className,
}: {
  member: RosterMember;
  className?: string;
}) {
  const team = TEAM_BY_KEY[member.team];

  return (
    <div
      style={{ "--accent": team.color } as React.CSSProperties}
      className={cn("grid gap-7 sm:grid-cols-[160px_1fr] sm:gap-8", className)}
    >
      <div
        className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]"
        style={{
          boxShadow:
            "inset 0 0 0 1px color-mix(in oklab, var(--accent) 40%, transparent)",
          background: "color-mix(in oklab, var(--accent) 10%, transparent)",
        }}
      >
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="160px"
            className="object-cover"
          />
        ) : (
          <span
            className="font-display absolute inset-0 grid place-items-center text-4xl font-bold"
            style={{ color: team.color }}
          >
            {initialsOf(member.name)}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p
          className="font-mono text-[0.7rem] tracking-[0.18em] uppercase"
          style={{ color: team.color }}
        >
          {team.wrap[0]}
          {team.label}
          {team.wrap[1]} · {member.role}
        </p>

        <h3 className="font-display mt-2 text-3xl leading-tight font-bold tracking-[-0.02em]">
          {member.name}
        </h3>

        <p className="text-muted-foreground mt-2 font-mono text-sm">
          {[member.branch, member.year].filter(Boolean).join(" · ")}
        </p>

        <p className="mt-5 leading-relaxed">
          {member.about ??
            `${member.name.split(" ")[0]} is on the ${team.label.toLowerCase()} team — ${team.charter.charAt(0).toLowerCase()}${team.charter.slice(1, -1)}.`}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Social
            href={member.socials.linkedin}
            label="LinkedIn"
            Icon={Linkedin}
          />
          <Social href={member.socials.github} label="GitHub" Icon={Github} />
          <Social
            href={member.socials.instagram}
            label="Instagram"
            Icon={Instagram}
          />
          {!member.socials.linkedin &&
          !member.socials.github &&
          !member.socials.instagram ? (
            <p className="text-muted-foreground text-sm">
              No links shared yet.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Social({
  href,
  label,
  Icon,
}: {
  href: string | null;
  label: string;
  Icon: typeof Github;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border/70 text-muted-foreground hover:border-foreground/50 hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <Icon className="size-4" />
      {label}
    </a>
  );
}
