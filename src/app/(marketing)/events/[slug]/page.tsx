/*
 * Owner: Mohiuddin
 * Status: skeleton (real data fetch; presentation and registration flow TODO)
 * Acceptance criteria:
 *   - Render full event detail: description (markdown), gallery, outcomes.
 *   - Wire RegistrationButton to the real flow (see that file's TODOs).
 *   - Handle every edge case: capacity full, registration closed, deadline
 *     passed, duplicate registration, event already ended.
 * Reference: /admin/members CRUD pattern; lib/firestore/events.ts.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";

import { safe } from "@/lib/utils/safe";
import { getEventBySlug } from "@/lib/firestore/events";
import { formatDateTime } from "@/lib/utils/format";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { RegistrationButton } from "@/components/events/RegistrationButton";

export const dynamic = "force-dynamic";

type Params = { slug: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await safe(getEventBySlug(slug), null, "event:meta");
  if (!event) return { title: "Event" };
  const title = `${event.title} | AWS SBG VJIT`;
  const description =
    event.tagline || `Learn and build with us at ${event.title}`;
  return {
    title,
    description,
    alternates: {
      canonical: `/events/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/events/${event.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const event = await safe(getEventBySlug(slug), null, "event:detail");
  if (!event) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.tagline || undefined,
    startDate: event.startAt
      ? typeof event.startAt.toDate === "function"
        ? event.startAt.toDate().toISOString()
        : new Date(event.startAt as unknown as string).toISOString()
      : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "VJIT Campus",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Vidya Jyothi Institute of Technology",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "AWS Student Builder Group VJIT",
      url: SITE_URL,
    },
  };

  return (
    <div className="pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-paper-warm border-b">
        <Container>
          <div className="max-w-3xl py-14">
            <div className="mb-4 flex items-center gap-2">
              <Badge className="capitalize">{event.status}</Badge>
              <Badge variant="secondary" className="capitalize">
                {event.category}
              </Badge>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              {event.title}
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              {event.tagline}
            </p>
            <div className="text-muted-foreground mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden />
                {formatDateTime(event.startAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {event.venue}
              </span>
            </div>
            <div className="mt-8">
              <RegistrationButton
                eventId={event.id}
                slug={event.slug}
                registrationOpen={event.registrationOpen}
              />
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="max-w-3xl py-14">
          {/* TODO(Mohiuddin): render markdown description, gallery, outcomes. */}
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {event.description || "Event details coming soon."}
          </p>
        </div>
      </Container>
    </div>
  );
}
