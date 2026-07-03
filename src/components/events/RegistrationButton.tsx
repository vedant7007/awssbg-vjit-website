"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/*
 * Owner: Mohiuddin
 * Status: stub. Wire the real flow described below.
 *
 * TODO(Mohiuddin):
 *   1. If the user is not signed in, redirect to /signin?next=/events/[slug].
 *   2. If already registered, show "You're in. Ticket in your email." and
 *      reveal the QR ticket inline (GET /api/registration/[id]/qr).
 *   3. Otherwise POST { eventId } to /api/registration.
 *   4. On success, toast and reveal the QR ticket inline.
 *   5. Disable the button and show reason when registration is closed, the
 *      deadline passed, capacity is full, or the event already ended.
 */
export function RegistrationButton({
  eventId,
  slug,
  registrationOpen,
}: {
  eventId: string;
  slug: string;
  registrationOpen: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleRegister() {
    setPending(true);
    // Placeholder until the real flow lands.
    void eventId;
    void slug;
    toast.info("Registration flow is not wired yet (owner: Mohiuddin).");
    setPending(false);
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={pending || !registrationOpen}
      size="lg"
    >
      {registrationOpen ? "Register" : "Registration closed"}
    </Button>
  );
}
