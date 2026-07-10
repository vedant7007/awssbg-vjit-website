"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { initials } from "@/lib/utils/format";
import { deleteMember } from "@/lib/firestore/members";
import { deleteEvent } from "@/lib/firestore/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/feedback/EmptyState";

/** Row shape passed from the server list page (no Firestore Timestamps). */
export type MemberRow = {
  id: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  role: string;
  team: string | null;
  isPublic: boolean;
};

export function MembersTable({ members }: { members: MemberRow[] }) {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState(members);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (m) =>
        m.displayName.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q),
    );
  }, [rows, query]);

  async function handleDelete(id: string, name: string) {
    try {
      await deleteMember(id);
      setRows((prev) => prev.filter((m) => m.id !== id));
      toast.success(`Removed ${name}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete member",
      );
    }
  }

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or username"
        className="max-w-xs"
        aria-label="Search members"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? "No members yet" : "No matches"}
          description={
            rows.length === 0
              ? "Add your first member to get started."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Public</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-full">
                        {member.photoURL ? (
                          <Image
                            src={member.photoURL}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-muted-foreground flex size-full items-center justify-center font-mono text-[10px]">
                            {initials(member.displayName)}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {member.displayName}
                        </div>
                        <div className="font-duo text-muted-foreground truncate text-xs">
                          @{member.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>{member.team ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={member.isPublic ? "default" : "secondary"}>
                      {member.isPublic ? "Public" : "Private"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${member.displayName}`}
                      >
                        <Link href={routes.adminMemberEdit(member.id)}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${member.displayName}`}
                          >
                            <Trash2 className="text-danger size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete member</DialogTitle>
                            <DialogDescription>
                              This removes {member.displayName} and frees their
                              username. This cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  handleDelete(
                                    member.id,
                                    member.displayName,
                                  ).catch(() => undefined);
                                }}
                              >
                                Delete
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  startAt: string;
  venue: string;
};

export function EventsTable({ events }: { events: EventRow[] }) {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState(events);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
    );
  }, [rows, query]);

  async function handleDelete(id: string, title: string) {
    try {
      await deleteEvent(id);
      setRows((prev) => prev.filter((e) => e.id !== id));
      toast.success(`Removed ${title}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete event",
      );
    }
  }

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, venue, or category"
        className="max-w-xs"
        aria-label="Search events"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? "No events yet" : "No matches"}
          description={
            rows.length === 0
              ? "Create your first event to get started."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {event.title}
                      </div>
                      <div className="text-muted-foreground font-mono text-xs">
                        /{event.slug}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{event.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.status === "live"
                          ? "default"
                          : event.status === "upcoming"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.startAt}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${event.title}`}
                      >
                        <Link href={routes.adminEventEdit(event.id)}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${event.title}`}
                          >
                            <Trash2 className="text-danger size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete event</DialogTitle>
                            <DialogDescription>
                              This removes &quot;{event.title}&quot; and
                              releases its slug. This cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  handleDelete(event.id, event.title).catch(
                                    () => undefined,
                                  );
                                }}
                              >
                                Delete
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
