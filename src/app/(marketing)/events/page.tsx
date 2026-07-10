import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { safe } from "@/lib/utils/safe";
import { listEvents } from "@/lib/firestore/events";
import { EVENT_CATEGORIES } from "@/lib/types";
import { Container } from "@/components/layout/Container";
import { Section, SectionHeader } from "@/components/layout/Section";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Events",
  description: "Workshops, hackathons, talks, and meetups from AWS SBG VJIT.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string }>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const activeCategory = category || "all";

  const allEvents = await safe(listEvents(), [], "events:list");

  // Filter in memory to avoid composite index requirements
  const filteredEvents =
    activeCategory && activeCategory !== "all"
      ? allEvents.filter((e) => e.category === activeCategory)
      : allEvents;

  const liveEvents = filteredEvents.filter((e) => e.status === "live");
  const upcomingEvents = filteredEvents.filter((e) => e.status === "upcoming");
  const pastEvents = filteredEvents.filter((e) => e.status === "past");

  const categories = ["all", ...EVENT_CATEGORIES];

  return (
    <div className="pt-24 pb-16">
      <Container>
        <SectionHeader
          eyebrow="Community"
          title="Events"
          description="Join us for hands-on workshops, hackathons, talks, and meetups."
        />

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap gap-2 border-b pb-6">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const href =
              cat === "all"
                ? routes.events
                : `${routes.events}?category=${cat}`;
            return (
              <Link
                key={cat}
                href={href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  isActive
                    ? "bg-orange text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Live Events Section */}
        <Section className="!pt-8">
          <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">
            Live Now
          </h2>
          {liveEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No live events"
              description={
                activeCategory !== "all"
                  ? `There are no live events in the "${activeCategory}" category.`
                  : "We don't have any live events running right now."
              }
            />
          )}
        </Section>

        {/* Upcoming Events Section */}
        <Section className="!pt-8">
          <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">
            Upcoming Events
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming events"
              description={
                activeCategory !== "all"
                  ? `There are no upcoming events in the "${activeCategory}" category.`
                  : "Check back later! We are planning our next session."
              }
            />
          )}
        </Section>

        {/* Past Events Section */}
        <Section className="!pt-8">
          <h2 className="font-display mb-6 text-2xl font-bold tracking-tight">
            Past Events
          </h2>
          {pastEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No past events"
              description={
                activeCategory !== "all"
                  ? `There are no past events in the "${activeCategory}" category.`
                  : "We haven't hosted any events yet."
              }
            />
          )}
        </Section>
      </Container>
    </div>
  );
}
