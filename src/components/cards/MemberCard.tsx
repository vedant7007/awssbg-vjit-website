import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";
import { routes } from "@/lib/constants/routes";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/lib/types";

/** Compact member card linking to the public profile. */
export function MemberCard({
  member,
  className,
}: {
  member: Pick<
    Member,
    "username" | "displayName" | "photoURL" | "role" | "team"
  >;
  className?: string;
}) {
  return (
    <Link
      href={routes.member(member.username)}
      className={cn(
        "group bg-card hover:border-orange focus-visible:ring-ring flex items-center gap-3 rounded-sm border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      <span className="bg-muted relative size-11 shrink-0 overflow-hidden rounded-full">
        {member.photoURL ? (
          <Image
            src={member.photoURL}
            alt=""
            fill
            unoptimized
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <span className="text-muted-foreground flex size-full items-center justify-center font-mono text-xs">
            {initials(member.displayName)}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{member.displayName}</span>
        <span className="font-duo text-muted-foreground block truncate text-xs">
          @{member.username}
        </span>
      </span>
      <Badge variant="secondary" className="ml-auto shrink-0 capitalize">
        {member.role}
      </Badge>
    </Link>
  );
}
