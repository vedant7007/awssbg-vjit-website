"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Pencil, Trash2, Github, Globe } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { deleteProject } from "@/lib/firestore/projects";
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

/** Row shape passed from the server list page. */
export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  coverImage: string | null;
  featured: boolean;
  repoUrl: string | null;
  liveUrl: string | null;
  contributors: {
    id: string;
    displayName: string;
    photoURL: string | null;
    github?: string | undefined;
  }[];
};

export function ProjectsTable({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState(projects);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [rows, query]);

  async function handleDelete(id: string, title: string) {
    try {
      await deleteProject(id);
      setRows((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Removed ${title}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete project",
      );
    }
  }

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title or slug"
        className="max-w-xs"
        aria-label="Search projects"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? "No projects yet" : "No matches"}
          description={
            rows.length === 0
              ? "Add your first project to get started."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Contributors</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-sm">
                        {project.coverImage ? (
                          <Image
                            src={project.coverImage}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <span
                            className="grid-backdrop flex size-full items-center justify-center"
                            aria-hidden
                          />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {project.title}
                        </div>
                        <div className="font-duo text-muted-foreground truncate text-xs">
                          /{project.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {project.repoUrl && (
                        <Link
                          href={project.repoUrl}
                          target="_blank"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Github Repo"
                        >
                          <Github className="size-4" />
                        </Link>
                      )}
                      {project.liveUrl && (
                        <Link
                          href={project.liveUrl}
                          target="_blank"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Live Site"
                        >
                          <Globe className="size-4" />
                        </Link>
                      )}
                      {!project.repoUrl && !project.liveUrl && (
                        <span className="text-muted-foreground text-xs">
                          None
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {project.contributors.length === 0 && (
                        <span className="text-muted-foreground text-xs">
                          None
                        </span>
                      )}
                      {project.contributors.map((c) => (
                        <div
                          key={c.id}
                          className="group bg-muted/50 relative flex items-center gap-1.5 rounded-full border py-1 pr-2 pl-1"
                        >
                          <div className="relative size-5 overflow-hidden rounded-full border">
                            {c.photoURL ? (
                              <Image
                                src={c.photoURL}
                                alt={c.displayName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-background text-foreground flex size-full items-center justify-center text-[9px] font-medium">
                                {c.displayName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-foreground max-w-[80px] truncate text-xs font-medium">
                            {c.displayName.split(" ")[0]}
                          </span>
                          {c.github && (
                            <Link
                              href={c.github}
                              target="_blank"
                              className="text-muted-foreground hover:text-orange"
                            >
                              <Github className="size-3" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.featured ? "default" : "secondary"}>
                      {project.featured ? "Featured" : "Standard"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Link href={routes.adminProjectEdit(project.id)}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${project.title}`}
                          >
                            <Trash2 className="text-danger size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete project</DialogTitle>
                            <DialogDescription>
                              This removes {project.title} permanently. This
                              cannot be undone.
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
                                  handleDelete(project.id, project.title).catch(
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
