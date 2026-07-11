import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, CheckCircle } from "lucide-react";

import { safe } from "@/lib/utils/safe";
import { getEventBySlug } from "@/lib/firestore/events";
import { getExistingRegistration } from "@/lib/firestore/registrations";
import { getCurrentUser } from "@/lib/auth/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { formatDateTime } from "@/lib/utils/format";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { RegistrationButton } from "@/components/events/RegistrationButton";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await safe(getEventBySlug(slug), null, "event:meta");
  if (!event) return { title: "Event" };
  return { title: event.title, description: event.tagline };
}

function parseMarkdown(text: string) {
  if (!text) return "";
  return text
    .replace(
      /^### (.*$)/gim,
      '<h4 class="text-lg font-bold mt-6 mb-2 text-foreground">$1</h4>',
    )
    .replace(
      /^## (.*$)/gim,
      '<h3 class="text-xl font-bold mt-8 mb-3 text-foreground">$1</h3>',
    )
    .replace(
      /^# (.*$)/gim,
      '<h2 class="text-2xl font-bold mt-10 mb-4 text-foreground">$1</h2>',
    )
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /^\s*-\s+(.*$)/gim,
      '<li class="ml-4 list-disc mb-1 text-muted-foreground">$1</li>',
    )
    .replace(/\n/g, "<br />");
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const event = await safe(getEventBySlug(slug), null, "event:detail");
  if (!event) notFound();

  const user = await getCurrentUser();
  const existingRegistration = user
    ? await safe(
        getExistingRegistration(event.id, user.uid),
        null,
        "event:registration",
      )
    : null;

  const serializedRegistration = existingRegistration
    ? {
        ...existingRegistration,
        registeredAt: existingRegistration.registeredAt.toDate().toISOString(),
        attendedAt: existingRegistration.attendedAt
          ? existingRegistration.attendedAt.toDate().toISOString()
          : null,
      }
    : null;

  // Fetch current registrations count
  const countSnap = await getAdminDb()
    .collection("registrations")
    .where("eventId", "==", event.id)
    .where("status", "in", ["registered", "attended"])
    .get();
  const currentCount = countSnap.size;

  const parsedDescription = parseMarkdown(event.description || "");

  return (
    <div className="pt-16">
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
                registrationDeadline={
                  event.registrationDeadline
                    ? event.registrationDeadline.toDate()
                    : null
                }
                endAt={event.endAt.toDate()}
                capacity={event.capacity}
                currentCount={currentCount}
                existingRegistration={serializedRegistration}
              />
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="max-w-3xl py-14">
          <div className="space-y-6">
            {event.coverImage && (
              <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden rounded-sm border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="size-full object-cover"
                />
              </div>
            )}

            <div
              className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parsedDescription }}
            />

            {event.outcomes && event.outcomes.length > 0 && (
              <div className="mt-10 border-t pt-8">
                <h3 className="font-display mb-4 text-xl font-bold">
                  What you will learn
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {event.outcomes.map((outcome, idx) => (
                    <li
                      key={idx}
                      className="text-muted-foreground flex items-start gap-2.5 text-sm"
                    >
                      <CheckCircle
                        className="text-orange mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.gallery && event.gallery.length > 0 && (
              <div className="mt-10 border-t pt-8">
                <h3 className="font-display mb-4 text-xl font-bold">Gallery</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {event.gallery.map((url, idx) => (
                    <div
                      key={idx}
                      className="bg-muted relative aspect-[4/3] overflow-hidden rounded-sm border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
