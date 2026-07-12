"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

import { useUser } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { ROADMAP_STATUSES, type RoadmapItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Server passes plain objects only; Firestore Timestamps (createdAt/updatedAt)
 * are class instances and cannot cross the client boundary, so the board works
 * with a serialized shape that omits them.
 */
export type RoadmapBoardItem = Omit<RoadmapItem, "createdAt" | "updatedAt">;

type RoadmapBoardGroup = Record<
  (typeof ROADMAP_STATUSES)[number],
  Record<string, RoadmapBoardItem[]>
>;

function groupItemsByStatusAndQuarter(): RoadmapBoardGroup {
  return ROADMAP_STATUSES.reduce<RoadmapBoardGroup>((groups, status) => {
    groups[status] = {};
    return groups;
  }, {} as RoadmapBoardGroup);
}

export function RoadmapBoard({ items }: { items: RoadmapBoardItem[] }) {
  const { user, loading: authLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [voteCounts, setVoteCounts] = React.useState<Record<string, number>>(
    () => Object.fromEntries(items.map((item) => [item.id, item.voteCount])),
  );
  const [voted, setVoted] = React.useState<Record<string, boolean>>({});
  const [loadingVotes, setLoadingVotes] = React.useState<
    Record<string, boolean>
  >({});

  const votingDisabled = React.useCallback((status: RoadmapItem["status"]) => {
    return status === "shipped" || status === "cancelled";
  }, []);
  const [loadingUserVotes, setLoadingUserVotes] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    async function loadUserVotes() {
      if (!user) {
        setVoted({});
        return;
      }

      setLoadingUserVotes(true);
      try {
        const response = await fetch("/api/roadmap/vote", {
          credentials: "same-origin",
        });
        if (!response.ok) {
          if (response.status === 401) {
            router.push(routes.signinNext(pathname));
            return;
          }
          setVoted({});
          return;
        }

        const payload = await response.json();
        if (!active) return;

        setVoted(
          Object.fromEntries(
            (payload.votedItemIds ?? []).map((itemId: string) => [
              itemId,
              true,
            ]),
          ),
        );
      } catch {
        if (active) setVoted({});
      } finally {
        if (active) setLoadingUserVotes(false);
      }
    }

    loadUserVotes();
    return () => {
      active = false;
    };
  }, [user, pathname, router]);

  const grouped = React.useMemo(() => {
    const groups = groupItemsByStatusAndQuarter();
    items.forEach((item) => {
      const statusGroup = groups[item.status] ?? (groups[item.status] = {});
      const quarterList = statusGroup[item.quarter] ?? [];
      quarterList.push(item);
      statusGroup[item.quarter] = quarterList;
    });
    return groups;
  }, [items]);

  async function handleVote(itemId: string) {
    if (!user) {
      router.push(routes.signinNext(pathname));
      return;
    }

    const isAlreadyVoted = Boolean(voted[itemId]);
    const method = isAlreadyVoted ? "DELETE" : "POST";

    setLoadingVotes((prev) => ({ ...prev, [itemId]: true }));

    try {
      const response = await fetch("/api/roadmap/vote", {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Vote failed");
      }

      setVoteCounts((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] ?? 0) + (isAlreadyVoted ? -1 : 1),
      }));
      setVoted((prev) => ({ ...prev, [itemId]: !isAlreadyVoted }));
      toast.success(isAlreadyVoted ? "Vote removed" : "Vote recorded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit vote.",
      );
    } finally {
      setLoadingVotes((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  return (
    <div className="space-y-10">
      {ROADMAP_STATUSES.map((status) => {
        const statusQuarters = grouped[status];
        const quarterKeys = Object.keys(statusQuarters);

        if (quarterKeys.length === 0) {
          return null;
        }

        return (
          <section
            key={status}
            className="border-muted/40 bg-muted/50 space-y-6 rounded-sm border p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge variant="secondary" className="capitalize">
                  {status}
                </Badge>
                <p className="text-muted-foreground mt-3 text-sm">
                  {quarterKeys.reduce(
                    (total, quarter) =>
                      total + (statusQuarters[quarter]?.length ?? 0),
                    0,
                  )}{" "}
                  roadmap item(s)
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                Grouped by quarter to help members compare upcoming work.
              </p>
            </div>

            <div className="space-y-6">
              {quarterKeys.map((quarter) => {
                const quarterItems = statusQuarters[quarter] ?? [];
                return (
                  <div
                    key={quarter}
                    className="bg-background space-y-4 rounded-sm border p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">{quarter}</p>
                        <p className="text-muted-foreground text-sm">
                          {quarterItems.length} item(s)
                        </p>
                      </div>
                      <Badge variant="outline">{quarter}</Badge>
                    </div>

                    <div className="grid gap-4">
                      {quarterItems.map((item) => {
                        const isVoted = Boolean(voted[item.id]);
                        const isLoading = Boolean(loadingVotes[item.id]);
                        const isVotingAllowed = !votingDisabled(item.status);
                        const label = !isVotingAllowed
                          ? "Voting closed"
                          : authLoading || loadingUserVotes
                            ? "Checking..."
                            : user
                              ? isVoted
                                ? "Unvote"
                                : "Vote"
                              : "Sign in to vote";

                        return (
                          <article
                            key={item.id}
                            className="rounded-sm border p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg leading-tight font-semibold">
                                    {item.title}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    {item.category}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                                  {item.description}
                                </p>
                              </div>

                              <div className="flex flex-col items-start gap-3 sm:items-end">
                                <div className="border-muted/60 rounded-full border px-3 py-1 text-sm font-medium">
                                  {voteCounts[item.id] ?? item.voteCount} votes
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => handleVote(item.id)}
                                  disabled={isLoading || !isVotingAllowed}
                                  size="sm"
                                  className="transition-transform duration-150 hover:-translate-y-0.5"
                                  aria-pressed={isVoted}
                                >
                                  {label}
                                </Button>
                                {!isVotingAllowed ? (
                                  <p className="text-muted-foreground text-xs">
                                    Voting is closed for shipped or cancelled
                                    items.
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
