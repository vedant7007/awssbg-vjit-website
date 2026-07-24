"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { LEADS, TEAM_BY_KEY, type RosterMember } from "@/lib/constants/team";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { MemberProfileCard } from "@/components/team/MemberProfileCard";
import { MemberProfile } from "@/components/team/MemberProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The five leads. Any card opens that member's profile — the same profile the
 * QR code on their physical badge resolves to, so both routes show one thing.
 */
export function LeadsGrid() {
  const [open, setOpen] = React.useState<RosterMember | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
        {LEADS.map((lead, i) => {
          const team = TEAM_BY_KEY[lead.team];
          return (
            <Reveal key={lead.id} delay={i * 0.06}>
              <div className="flex h-full flex-col">
                {/* The card's own layers are pointer-events:none, so the click
                    target is this wrapper rather than anything inside it. */}
                <button
                  type="button"
                  onClick={() => setOpen(lead)}
                  aria-label={`View ${lead.name}'s profile`}
                  className="focus-visible:ring-ring group relative cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
                  style={{ "--accent": team.color } as React.CSSProperties}
                >
                  <MemberProfileCard member={lead} showContactButton={false} />
                </button>

                <p className="text-muted-foreground mt-5 text-sm leading-relaxed">
                  <span
                    className="font-mono text-xs tracking-wide"
                    style={{ color: team.color }}
                  >
                    {team.wrap[0]}
                    {team.label}
                    {team.wrap[1]}{" "}
                  </span>
                  {team.charter}
                </p>

                <Link
                  href={routes.teamPage(team.key)}
                  style={{ "--accent": team.color } as React.CSSProperties}
                  className="border-border/70 hover:border-accent hover:text-accent focus-visible:ring-ring group/link mt-4 inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Full {team.label} team
                  <ArrowRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>

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
          {open ? (
            <>
              <MemberProfile member={open} />
              <div className="border-border/60 mt-2 flex justify-end border-t pt-4">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Link href={routes.member(open.handle)}>
                    Open full profile
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
