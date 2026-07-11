"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { deleteRoadmapItem } from "@/lib/firestore/roadmap.client";
import { Button } from "@/components/ui/button";
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
import type { RoadmapItem } from "@/lib/types";

export function RoadmapTable({ items }: { items: RoadmapItem[] }) {
  const [rows, setRows] = React.useState(items);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.quarter.toLowerCase().includes(q),
    );
  }, [query, rows]);

  async function handleDelete(id: string, title: string) {
    try {
      await deleteRoadmapItem(id);
      setRows((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Deleted ${title}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete item",
      );
    }
  }

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search roadmap items"
        className="border-input bg-background ring-offset-background focus-visible:ring-ring block w-full rounded-sm border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label="Search roadmap items"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? "No roadmap items yet" : "No matches"}
          description={
            rows.length === 0
              ? "Add your first roadmap item to get started."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quarter</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-muted-foreground text-sm">
                        {item.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{item.status}</TableCell>
                  <TableCell>{item.quarter}</TableCell>
                  <TableCell>{item.voteCount}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Link href={routes.adminRoadmapEdit(item.id)}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${item.title}`}
                          >
                            <Trash2 className="text-danger size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete roadmap item</DialogTitle>
                            <DialogDescription>
                              This removes {item.title}. This cannot be undone.
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
                                  handleDelete(item.id, item.title).catch(
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
