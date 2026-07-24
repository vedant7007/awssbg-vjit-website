"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { MemberProfileCard } from "@/components/team/MemberProfileCard";
import { MemberProfile } from "@/components/team/MemberProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CORE,
  TEAMS,
  type RosterMember,
  type TeamKey,
} from "@/lib/constants/team";

type Filter = TeamKey | "all";

/**
 * Every member gets the same ID card the leads have — same holo shine, same
 * per-team glyph. Clicking one opens the profile the QR codes also point at.
 */
export function CoreRoster({
  members = CORE,
  showFilters = true,
}: {
  members?: RosterMember[];
  showFilters?: boolean;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [open, setOpen] = React.useState<RosterMember | null>(null);

  const visible = React.useMemo(
    () =>
      filter === "all" ? members : members.filter((m) => m.team === filter),
    [filter, members],
  );

  return (
    <div>
      {/* Filters double as the team legend — each chip carries its own count.
          A single-team page is already filtered, so they'd be noise there. */}
      {showFilters ? (
        <div
          role="group"
          aria-label="Filter by team"
          className="flex flex-wrap items-center gap-2"
        >
          <Chip
            active={filter === "all"}
            color="var(--foreground)"
            onClick={() => setFilter("all")}
            label="Everyone"
            count={members.length}
          />
          {TEAMS.map((t) => (
            <Chip
              key={t.key}
              active={filter === t.key}
              color={t.color}
              onClick={() => setFilter(t.key)}
              label={t.label}
              count={members.filter((m) => m.team === t.key).length}
            />
          ))}
        </div>
      ) : null}

      <ul
        className={cn(
          "grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          showFilters && "mt-10",
        )}
      >
        {visible.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => setOpen(m)}
              aria-label={`View ${m.name}'s profile`}
              className="focus-visible:ring-ring w-full cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
            >
              <MemberProfileCard member={m} showContactButton={false} />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={open !== null}
        onOpenChange={(next) => {
          if (!next) setOpen(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{open?.name ?? "Member profile"}</DialogTitle>
          </DialogHeader>
          {open ? <MemberProfile member={open} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chip({
  active,
  color,
  label,
  count,
  onClick,
}: {
  active: boolean;
  color: string;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={
        active
          ? ({
              borderColor: color,
              boxShadow: `0 0 22px -6px ${color}`,
              color,
            } as React.CSSProperties)
          : undefined
      }
      className={cn(
        "focus-visible:ring-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs tracking-wide transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "bg-foreground/[0.04]"
          : "border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
      <span className="tabular-nums opacity-50">{count}</span>
    </button>
  );
}
