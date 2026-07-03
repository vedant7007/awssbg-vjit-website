import * as React from "react";
import { Construction } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";

/**
 * Consistent placeholder for skeleton routes. Renders the owner, the acceptance
 * criteria for the polished version, and a link to the reference to copy from.
 * Delete this and build the real page when it is your turn.
 */
export function RouteSkeleton({
  eyebrow,
  title,
  description,
  owner,
  criteria,
  reference,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  owner: string;
  criteria: string[];
  reference?: string;
  children?: React.ReactNode;
}) {
  return (
    <PageShell eyebrow={eyebrow} title={title} description={description}>
      <div className="max-w-2xl space-y-6">
        <div className="bg-muted/40 flex items-center gap-2 rounded-sm border border-dashed px-4 py-3 text-sm">
          <Construction className="text-orange size-4" aria-hidden />
          <span className="font-mono text-xs tracking-wide uppercase">
            Skeleton &middot; owner: {owner}
          </span>
        </div>
        <div>
          <h2 className="eyebrow mb-3">Acceptance criteria</h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            {criteria.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-orange">&bull;</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        {reference ? (
          <p className="text-muted-foreground text-sm">
            Reference:{" "}
            <code className="bg-muted rounded-sm px-1.5 py-0.5 font-mono text-xs">
              {reference}
            </code>
          </p>
        ) : null}
        {children}
      </div>
    </PageShell>
  );
}
