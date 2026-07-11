"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Ticket, CheckCircle2 } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { useUser } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { toDate } from "@/lib/utils/format";
import type { Registration, Serialized } from "@/lib/types";

export function RegistrationButton({
  eventId,
  slug,
  registrationOpen,
  registrationDeadline,
  endAt,
  capacity,
  currentCount,
  existingRegistration,
}: {
  eventId: string;
  slug: string;
  registrationOpen: boolean;
  registrationDeadline: string | number | Date | null;
  endAt: string | number | Date | null;
  capacity: number | null;
  currentCount: number;
  existingRegistration: Serialized<Registration> | null;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [pending, setPending] = React.useState(false);
  const [regId, setRegId] = React.useState<string | null>(
    existingRegistration?.id || null,
  );
  const [ticketCode, setTicketCode] = React.useState<string | null>(
    existingRegistration?.ticketCode || null,
  );
  const [fetchingTicket, setFetchingTicket] = React.useState(false);

  // Sync state with existingRegistration prop if it changes
  React.useEffect(() => {
    if (existingRegistration) {
      setRegId(existingRegistration.id);
      setTicketCode(existingRegistration.ticketCode);
    } else {
      setRegId(null);
      setTicketCode(null);
    }
  }, [existingRegistration]);

  // Fetch ticket if we have regId but no ticketCode
  React.useEffect(() => {
    if (regId && !ticketCode) {
      async function fetchTicket() {
        setFetchingTicket(true);
        try {
          const res = await fetch(`/api/registration/${regId}/qr`);
          if (!res.ok) {
            throw new Error("Failed to load ticket code");
          }
          const data = await res.json();
          if (data.ticketCode) {
            setTicketCode(data.ticketCode);
          } else {
            throw new Error("Invalid ticket response");
          }
        } catch {
          toast.error("Could not retrieve ticket QR code. Try reloading.");
        } finally {
          setFetchingTicket(false);
        }
      }
      fetchTicket();
    }
  }, [regId, ticketCode]);

  // Compute disabled states
  const isEnded = React.useMemo(() => {
    const date = toDate(endAt);
    return date ? date.getTime() < Date.now() : false;
  }, [endAt]);

  const isClosed = !registrationOpen;

  const isDeadlinePassed = React.useMemo(() => {
    const date = toDate(registrationDeadline);
    return date ? date.getTime() < Date.now() : false;
  }, [registrationDeadline]);

  const isFull = React.useMemo(() => {
    return (
      capacity !== null && capacity !== undefined && currentCount >= capacity
    );
  }, [capacity, currentCount]);

  async function handleRegister() {
    if (authLoading) return;

    if (!user) {
      const nextPath = routes.event(slug);
      router.push(routes.signinNext(nextPath));
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      toast.success("Successfully registered!");
      setRegId(data.registrationId);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not register",
      );
    } finally {
      setPending(false);
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <Button disabled size="lg">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking status...
      </Button>
    );
  }

  // Already Registered State - show ticket and QR
  if (regId) {
    return (
      <div className="bg-card max-w-sm space-y-4 rounded-sm border p-6 shadow-sm">
        <div className="flex items-center gap-2 font-medium text-green-600">
          <CheckCircle2 className="size-5" />
          <span>You&apos;re registered!</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Your ticket confirmation has been sent to your email.
        </p>

        {fetchingTicket ? (
          <div className="bg-muted/30 flex aspect-square flex-col items-center justify-center rounded border border-dashed p-6">
            <Loader2 className="text-muted-foreground mb-2 h-6 w-6 animate-spin" />
            <p className="text-muted-foreground text-xs">
              Generating ticket QR...
            </p>
          </div>
        ) : ticketCode ? (
          <div className="flex flex-col items-center space-y-3 rounded border bg-white p-4">
            <div className="bg-white p-2">
              <QRCodeSVG value={ticketCode} size={160} level="M" />
            </div>
            <div className="text-center">
              <span className="text-muted-foreground bg-muted rounded px-2 py-0.5 font-mono text-xs select-all">
                {ticketCode}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 flex aspect-square flex-col items-center justify-center rounded border border-dashed p-6">
            <Ticket className="text-muted-foreground mb-2 h-6 w-6" />
            <Button
              variant="link"
              onClick={() => setTicketCode(null) /* trigger reload */}
              className="text-xs"
            >
              Reload Ticket
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Disabled states
  if (isEnded) {
    return (
      <Button disabled size="lg" variant="outline">
        Event already ended
      </Button>
    );
  }

  if (isClosed) {
    return (
      <Button disabled size="lg" variant="outline">
        Registration closed
      </Button>
    );
  }

  if (isDeadlinePassed) {
    return (
      <Button disabled size="lg" variant="outline">
        Registration deadline passed
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button disabled size="lg" variant="outline">
        Event capacity full
      </Button>
    );
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={pending}
      size="lg"
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registering...
        </>
      ) : user ? (
        "Register for Event"
      ) : (
        "Sign in to Register"
      )}
    </Button>
  );
}
