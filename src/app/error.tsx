"use client";

import * as React from "react";
import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { logger } from "@/lib/utils/logger";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/button";

/**
 * Route-segment error boundary. Catches render/data errors thrown below the
 * root layout and offers a retry (re-renders the segment) plus a way home,
 * instead of dropping the user on Next's raw error screen.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    logger.error("route error boundary", error);
  }, [error]);

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-6 py-24">
      <ErrorState
        title="This page hit a snag"
        description="Something broke while loading this section. You can retry, or head back home."
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href={routes.home}>Back home</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
