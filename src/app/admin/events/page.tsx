import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { safe } from "@/lib/utils/safe";
import { listEvents } from "@/lib/firestore/events";
import { formatDateTime } from "@/lib/utils/format";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { EventsTable, type EventRow } from "@/components/admin/EventsTable";

export const metadata: Metadata = { title: "Events | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await safe(listEvents(), [], "admin:events");

  const rows: EventRow[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    status: e.status,
    category: e.category,
    startAt: formatDateTime(e.startAt),
    venue: e.venue,
  }));

  return (
    <PageShell
      eyebrow="Admin"
      title="Events"
      description="Manage community events, workshops, hackathons, and check-ins."
      actions={
        <Button asChild>
          <Link href={routes.adminEventNew}>
            <Plus className="size-4" />
            Add event
          </Link>
        </Button>
      }
    >
      <EventsTable events={rows} />
    </PageShell>
  );
}
