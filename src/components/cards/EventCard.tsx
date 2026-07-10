import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { routes } from "@/lib/constants/routes";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";

/** Event card. Pass featured for the larger landing treatment. */
export function EventCard({
  event,
  featured = false,
  className,
}: {
  event: Event;
  featured?: boolean;
  className?: string;
}) {
  const statusVariant =
    event.status === "live"
      ? "default"
      : event.status === "upcoming"
        ? "secondary"
        : "outline";

  return (
    <Link
      href={routes.event(event.slug)}
      className={cn(
        "group bg-card hover:border-orange focus-visible:ring-ring flex flex-col overflow-hidden rounded-sm border transition-colors focus-visible:ring-2 focus-visible:outline-none",
        featured && "md:flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "bg-muted relative aspect-[16/9] w-full overflow-hidden",
          featured && "md:aspect-auto md:w-1/2",
        )}
      >
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt=""
            fill
            sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid-backdrop size-full" aria-hidden />
        )}
        <Badge
          variant={statusVariant}
          className="absolute top-3 left-3 capitalize"
        >
          {event.status}
        </Badge>
      </div>
      <div
        className={cn("flex flex-col gap-3 p-5", featured && "md:w-1/2 md:p-8")}
      >
        <p className="eyebrow">{event.category}</p>
        <h3
          className={cn(
            "font-display font-semibold tracking-tight",
            featured ? "text-2xl md:text-3xl" : "text-lg",
          )}
        >
          {event.title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {event.tagline}
        </p>
        <div className="text-muted-foreground mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {formatDate(event.startAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden />
            {event.venue}
          </span>
        </div>
      </div>
    </Link>
  );
}
