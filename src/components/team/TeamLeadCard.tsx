"use client";

import * as React from "react";

import { TEAM_BY_KEY, type RosterMember } from "@/lib/constants/team";
import { MemberProfileCard } from "@/components/team/MemberProfileCard";
import { MemberProfile } from "@/components/team/MemberProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The lead on their own team page: same card as the /team row, but larger and
 * paired with their blurb, since it isn't competing with four siblings here.
 */
export function TeamLeadCard({ member }: { member: RosterMember }) {
  const [open, setOpen] = React.useState(false);
  const team = TEAM_BY_KEY[member.team];

  return (
    <>
      <div className="grid items-center gap-10 sm:grid-cols-[minmax(0,340px)_1fr] lg:gap-14">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View ${member.name}'s profile`}
          className="focus-visible:ring-ring cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
        >
          <MemberProfileCard member={member} showContactButton={false} />
        </button>

        <div>
          <p
            className="font-mono text-xs tracking-[0.18em] uppercase"
            style={{ color: team.color }}
          >
            {member.role}
          </p>
          <h3 className="font-display mt-3 text-[clamp(1.75rem,4vw,3rem)] leading-[0.95] font-bold tracking-[-0.03em]">
            {member.name}
          </h3>
          <p className="text-muted-foreground mt-3 font-mono text-sm">
            {[member.branch, member.year].filter(Boolean).join(" · ")}
          </p>
          {member.about ? (
            <p className="text-muted-foreground mt-6 max-w-xl leading-relaxed">
              {member.about}
            </p>
          ) : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{member.name}</DialogTitle>
          </DialogHeader>
          <MemberProfile member={member} />
        </DialogContent>
      </Dialog>
    </>
  );
}
