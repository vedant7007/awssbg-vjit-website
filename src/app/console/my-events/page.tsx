import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/server";
import { getRegistrationsForUser } from "@/lib/firestore/registrations";
import { getEventsByIds } from "@/lib/firestore/events";
import { routes } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/format";
import { safe } from "@/lib/utils/safe";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRDisplay } from "@/components/qr/QRDisplay";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { RegistrationStatus } from "@/lib/types";

export const metadata: Metadata = { title: "My events | Console" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<
  RegistrationStatus,
  "default" | "secondary" | "outline"
> = {
  registered: "default",
  attended: "secondary",
  cancelled: "outline",
};

export default async function MyEventsPage() {
  const user = await getCurrentUser();
  const uid = user?.uid;

  const registrations = uid
    ? await safe(getRegistrationsForUser(uid), [], "myevents:registrations")
    : [];
  const events = await safe(
    getEventsByIds(registrations.map((r) => r.eventId)),
    [],
    "myevents:events",
  );
  const eventById = new Map(events.map((e) => [e.id, e]));

  const active = registrations
    .filter((r) => r.status !== "cancelled")
    .sort(
      (a, b) =>
        (b.registeredAt?.toMillis?.() ?? 0) -
        (a.registeredAt?.toMillis?.() ?? 0),
    );

  return (
    <PageShell
      eyebrow="Console"
      title="My events"
      description="Your registrations and check-in tickets."
    >
      {active.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {active.map((reg) => {
            const event = eventById.get(reg.eventId);
            return (
              <div
                key={reg.id}
                className="bg-card flex flex-col gap-4 rounded-sm border p-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant={STATUS_VARIANT[reg.status]}
                      className="capitalize"
                    >
                      {reg.status}
                    </Badge>
                  </div>
                  <h2 className="font-display truncate text-lg font-semibold">
                    {event?.title ?? "Event"}
                  </h2>
                  {event ? (
                    <div className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <p className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {formatDateTime(event.startAt)}
                      </p>
                      <p className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" aria-hidden />
                        {event.venue}
                      </p>
                    </div>
                  ) : null}
                  {event ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Link href={routes.event(event.slug)}>Event details</Link>
                    </Button>
                  ) : null}
                </div>
                {reg.status === "registered" ? (
                  <QRDisplay
                    value={reg.ticketCode}
                    size={128}
                    caption="Show at check-in"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No registrations yet"
          description="When you register for an event, your ticket appears here."
          action={
            <Button asChild variant="outline">
              <Link href={routes.events}>Browse events</Link>
            </Button>
          }
        />
      )}
    </PageShell>
  );
}
