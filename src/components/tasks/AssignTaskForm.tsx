"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Search, Users, X } from "lucide-react";

import { createTaskAction } from "@/app/console/tasks/actions";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type AssignableMember = {
  uid: string;
  name: string;
  team: string | null;
};

/**
 * Lead/admin form to assign work. Pick any number of people and write any
 * number of tasks (one per line) — every combination becomes its own task, so
 * each person tracks their own progress. `members` is already scoped by the
 * caller (a lead's own team, or everyone for an admin).
 */
export function AssignTaskForm({ members }: { members: AssignableMember[] }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [titles, setTitles] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [picked, setPicked] = React.useState<string[]>([]);
  const [dueDate, setDueDate] = React.useState("");
  const [query, setQuery] = React.useState("");

  const groups = React.useMemo(() => {
    const byTeam = new Map<string, AssignableMember[]>();
    const q = query.trim().toLowerCase();
    for (const m of members) {
      if (q && !m.name.toLowerCase().includes(q)) continue;
      const key = m.team ?? "No team";
      byTeam.set(key, [...(byTeam.get(key) ?? []), m]);
    }
    return [...byTeam.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [members, query]);

  const titleList = titles
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
  const total = titleList.length * picked.length;

  const toggle = (uid: string) =>
    setPicked((cur) =>
      cur.includes(uid) ? cur.filter((u) => u !== uid) : [...cur, uid],
    );

  const toggleTeam = (list: AssignableMember[]) => {
    const uids = list.map((m) => m.uid);
    const allOn = uids.every((u) => picked.includes(u));
    setPicked((cur) =>
      allOn
        ? cur.filter((u) => !uids.includes(u))
        : [...new Set([...cur, ...uids])],
    );
  };

  if (members.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No members to assign to yet. People appear here once they&apos;ve been
        added to your team.
      </p>
    );
  }

  const submit = () =>
    start(async () => {
      setError(null);
      const res = await createTaskAction({
        titles: titleList,
        description,
        assigneeUids: picked,
        dueDate,
      });
      if (!res.ok) {
        setError(res.error ?? "Couldn't assign the tasks.");
        return;
      }
      const n = res.created ?? 0;
      toast.success(n === 1 ? "Task assigned." : `${n} tasks assigned.`);
      setTitles("");
      setDescription("");
      setPicked([]);
      setDueDate("");
      router.refresh();
    });

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="task-titles">Tasks</Label>
        <Textarea
          id="task-titles"
          value={titles}
          onChange={(e) => setTitles(e.target.value)}
          rows={3}
          placeholder={
            "What needs doing?\nOne task per line to assign several at once."
          }
          required
        />
        {titleList.length > 1 ? (
          <p className="text-muted-foreground text-xs">
            {titleList.length} tasks — one per line.
          </p>
        ) : null}
      </div>

      {/* People picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label>Assign to</Label>
          {picked.length > 0 ? (
            <button
              type="button"
              onClick={() => setPicked([])}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
            >
              <X className="size-3" /> Clear {picked.length}
            </button>
          ) : null}
        </div>

        {members.length > 8 ? (
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find someone…"
              aria-label="Filter people"
              className="glass-well focus-visible:ring-orange/40 h-9 w-full rounded-full pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
            />
          </div>
        ) : null}

        <div className="glass-well max-h-64 space-y-3 overflow-y-auto rounded-xl p-3">
          {groups.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs">
              Nobody matches that.
            </p>
          ) : null}
          {groups.map(([team, list]) => {
            const allOn = list.every((m) => picked.includes(m.uid));
            return (
              <div key={team}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.12em] uppercase">
                    {team}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleTeam(list)}
                    className="text-orange text-[0.68rem] hover:underline"
                  >
                    {allOn ? "none" : "all"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((m) => {
                    const on = picked.includes(m.uid);
                    return (
                      <button
                        key={m.uid}
                        type="button"
                        onClick={() => toggle(m.uid)}
                        aria-pressed={on}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                          on
                            ? "border-orange bg-orange/15 text-orange font-medium"
                            : "border-border/70 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {on ? <Check className="size-3" /> : null}
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-due">Due date (optional)</Label>
          <Input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-desc">Details (optional)</Label>
          <Textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Context, links, what done looks like…"
          />
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={pending || total === 0}
          className="rounded-full"
        >
          {pending
            ? "Assigning…"
            : total > 1
              ? `Assign ${total} tasks`
              : "Assign task"}
        </Button>
        {total > 1 ? (
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Users className="size-3.5" />
            {titleList.length} task{titleList.length === 1 ? "" : "s"} ×{" "}
            {picked.length} {picked.length === 1 ? "person" : "people"}
          </span>
        ) : null}
      </div>
    </form>
  );
}
