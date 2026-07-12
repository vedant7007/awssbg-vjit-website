import type { Metadata } from "next";
import Link from "next/link";
import {
  UserRoundPen,
  Ticket,
  Settings,
  ArrowUpRight,
  CircleAlert,
  CalendarDays,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/server";
import { getMemberById } from "@/lib/firestore/members.server";
import { getRegistrationsForUser } from "@/lib/firestore/registrations";
import { getEventsByIds } from "@/lib/firestore/events";
import { routes } from "@/lib/constants/routes";
import { firstName, formatDate } from "@/lib/utils/format";
import { safe } from "@/lib/utils/safe";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";

export const metadata: Metadata = { title: "Console" };
export const dynamic = "force-dynamic";

const TILES = [
  {
    href: routes.consoleProfile,
    title: "Profile",
    description: "Edit your public profile, skills, and socials.",
    icon: UserRoundPen,
  },
  {
    href: routes.consoleMyEvents,
    title: "My events",
    description: "Your registrations and QR tickets.",
    icon: Ticket,
  },
  {
    href: routes.consoleSettings,
    title: "Settings",
    description: "Visibility, account, and sign out.",
    icon: Settings,
  },
];

export default async function ConsolePage() {
  const user = await getCurrentUser();
  const name = user?.name ? firstName(user.name) : "there";
  const uid = user?.uid;

  const member = uid
    ? await safe(getMemberById(uid), null, "console:member")
    : null;

  const registrations = uid
    ? await safe(getRegistrationsForUser(uid), [], "console:registrations")
    : [];
  const upcomingIds = registrations
    .filter((r) => r.status === "registered")
    .map((r) => r.eventId);
  const events = await safe(getEventsByIds(upcomingIds), [], "console:events");
  const upcoming = events
    .filter((e) => e.status !== "past")
    .sort(
      (a, b) => (a.startAt?.toMillis?.() ?? 0) - (b.startAt?.toMillis?.() ?? 0),
    );

  return (
    <PageShell
      eyebrow="Your space"
      title={`Welcome, ${name}`}
      description="Manage your profile, tickets, and account from here."
    >
      <div className="space-y-10">
        {!member ? (
          <div className="border-orange/30 bg-orange/5 flex flex-col gap-4 rounded-sm border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CircleAlert className="text-orange mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-display font-semibold">
                  Finish setting up your account
                </p>
                <p className="text-muted-foreground text-sm">
                  You have not created your member profile yet. It only takes a
                  minute.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0">
              <Link href={routes.consoleProfile}>Complete profile</Link>
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group bg-card hover:border-orange flex flex-col gap-3 rounded-sm border p-6 transition-colors"
            >
              <div className="flex items-center justify-between">
                <tile.icon className="text-orange size-6" />
                <ArrowUpRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <h2 className="font-display text-lg font-semibold">
                {tile.title}
              </h2>
              <p className="text-muted-foreground text-sm">
                {tile.description}
              </p>
            </Link>
          ))}
        </div>

        <section>
          <h2 className="eyebrow mb-4">
            Upcoming events you are registered for
          </h2>
          {upcoming.length > 0 ? (
            <ul className="divide-y rounded-sm border">
              {upcoming.map((event: Event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{event.title}</p>
                    <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {formatDate(event.startAt)} &middot; {event.venue}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={routes.event(event.slug)}>Details</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground rounded-sm border border-dashed p-6 text-sm">
              You are not registered for any upcoming events yet.{" "}
              <Link
                href={routes.events}
                className="text-orange hover:underline"
              >
                Browse events
              </Link>
              .
            </p>
          )}
        </section>
      </div>
    </PageShell>
  );
}
