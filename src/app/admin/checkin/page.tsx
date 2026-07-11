"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, UserCheck, AlertTriangle } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { QRScanner } from "@/components/qr/QRScanner";
import { Label } from "@/components/ui/label";
import { listEventsSerialized } from "@/lib/firestore/events";
import type { Event, Serialized } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

type ScanResult = {
  success: boolean;
  message?: string;
  member?: {
    displayName: string;
    username: string;
    photoURL: string | null;
  };
  event?: {
    title: string;
  };
};

export default function CheckinPage() {
  const [eventId, setEventId] = React.useState("");
  const [events, setEvents] = React.useState<Serialized<Event>[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [scanning, setScanning] = React.useState(false);
  const [checkingIn, setCheckingIn] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);

  React.useEffect(() => {
    async function loadEvents() {
      try {
        const data = await listEventsSerialized();
        // Show live and upcoming first, then past
        const sorted = [...data].sort((a, b) => {
          const statusOrder = { live: 0, upcoming: 1, past: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
        setEvents(sorted);
      } catch {
        toast.error("Could not load events list");
      } finally {
        setLoadingEvents(false);
      }
    }
    loadEvents();
  }, []);

  async function handleScan(decoded: string) {
    if (!eventId) {
      toast.error("Pick an event before scanning.");
      return;
    }

    setCheckingIn(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: decoded, eventId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setScanResult({
          success: false,
          message: data.error || "Check-in failed",
        });
        toast.error(data.error || "Check-in failed");
      } else {
        setScanResult({
          success: true,
          member: data.member,
          event: data.event,
        });
        toast.success(`Checked in ${data.member.displayName}!`);
      }
    } catch {
      setScanResult({
        success: false,
        message: "Network or server error during check-in",
      });
      toast.error("Network or server error during check-in");
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Check-in"
      description="Scan attendee tickets to mark attendance."
    >
      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="event-id">Select Event</Label>
          {loadingEvents ? (
            <div className="text-muted-foreground flex items-center gap-2 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading events...</span>
            </div>
          ) : (
            <select
              id="event-id"
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-sm border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                setScanResult(null);
              }}
            >
              <option value="">Select an event to check into...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({event.status})
                </option>
              ))}
            </select>
          )}
        </div>

        {eventId && (
          <div>
            <button
              type="button"
              onClick={() => setScanning((s) => !s)}
              className="text-orange text-sm font-medium underline-offset-4 hover:underline"
            >
              {scanning ? "Stop camera" : "Start camera"}
            </button>
          </div>
        )}

        {eventId && (
          <div
            className={cn(
              "overflow-hidden rounded-sm border",
              !scanning && "hidden",
            )}
          >
            <QRScanner
              scanning={scanning}
              onScan={(decoded) => {
                setScanning(false);
                handleScan(decoded);
              }}
              onError={(message) => toast.error(message)}
            />
          </div>
        )}

        {checkingIn && (
          <div className="text-muted-foreground bg-muted/20 flex items-center justify-center gap-2 rounded border border-dashed py-4">
            <Loader2 className="text-orange h-5 w-5 animate-spin" />
            <span className="text-sm">Processing check-in...</span>
          </div>
        )}

        {scanResult && (
          <div
            className={cn(
              "space-y-3 rounded-sm border p-4",
              scanResult.success
                ? "border-green-500/30 bg-green-50/50 text-green-900"
                : "border-red-500/30 bg-red-50/50 text-red-900",
            )}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {scanResult.success ? (
                <>
                  <UserCheck className="size-5 text-green-600" />
                  <span>Successfully Checked In!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-5 text-red-600" />
                  <span>Check-in Failed</span>
                </>
              )}
            </div>

            {scanResult.success ? (
              <div className="flex items-center gap-3">
                {scanResult.member?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={scanResult.member.photoURL}
                    alt=""
                    className="size-12 rounded-full border border-green-200 object-cover"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full border border-green-200 bg-green-200/50 font-bold text-green-700">
                    {scanResult.member?.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold">
                    {scanResult.member?.displayName}
                  </div>
                  <div className="text-xs text-green-800">
                    @{scanResult.member?.username}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Event: {scanResult.event?.title}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-red-800">
                {scanResult.message}
              </p>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
