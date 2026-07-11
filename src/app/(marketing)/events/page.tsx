/*
 * Owner: Mohiuddin
 * Status: skeleton
 * Acceptance criteria:
 *   - List events grouped by status (live, upcoming, past) using EventCard.
 *   - Category filter; empty states per group.
 *   - Data via lib/firestore/events.ts (listEvents already implemented).
 * Reference: src/app/(marketing)/page.tsx featured event section.
 */
import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { listEvents } from "@/lib/firestore/events";
import { RouteSkeleton } from "@/components/feedback/RouteSkeleton";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/feedback/EmptyState";

export const metadata: Metadata = {
  title: "Events",
  description: "Workshops, hackathons, talks, and meetups from AWS SBG VJIT.",
  alternates: {
    canonical: "/events",
  },
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await safe(listEvents(), [], "events:list");

  return (
    <div className="pt-16">
      <RouteSkeleton
        eyebrow="Community"
        title="Events"
        description="Reads are wired; the grouped, filtered layout is yours to build."
        owner="Mohiuddin"
        reference="src/app/(marketing)/page.tsx"
        criteria={[
          "Group events by status: live, upcoming, past.",
          "Add a category filter (workshop, hackathon, talk, meetup, competition).",
          "Empty state per group when there is nothing to show.",
        ]}
      >
        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No events yet"
            description="Once events are seeded or created in admin, they appear here."
          />
        )}
      </RouteSkeleton>
    </div>
  );
}
