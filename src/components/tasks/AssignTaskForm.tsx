"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { createTaskAction } from "@/app/console/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type AssignableMember = {
  uid: string;
  name: string;
  team: string | null;
};

/** Lead/admin form to assign a task. `members` is already scoped by the caller
 * (a lead's own team, or everyone for an admin). */
export function AssignTaskForm({ members }: { members: AssignableMember[] }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [assigneeUid, setAssigneeUid] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");

  // Group by team so a long roster stays scannable in the dropdown.
  const groups = React.useMemo(() => {
    const byTeam = new Map<string, AssignableMember[]>();
    for (const m of members) {
      const key = m.team ?? "No team";
      byTeam.set(key, [...(byTeam.get(key) ?? []), m]);
    }
    return [...byTeam.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [members]);
  const multiTeam = groups.length > 1;

  if (members.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No members to assign to yet. Members appear here once they&apos;ve
        signed in and been added to your team.
      </p>
    );
  }

  const submit = () =>
    start(async () => {
      setError(null);
      const res = await createTaskAction({
        title,
        description,
        assigneeUid,
        dueDate,
      });
      if (!res.ok) {
        setError(res.error ?? "Couldn't assign the task.");
        return;
      }
      setTitle("");
      setDescription("");
      setAssigneeUid("");
      setDueDate("");
      router.refresh();
    });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="task-title">Task</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          maxLength={140}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-assignee">Assign to</Label>
          <select
            id="task-assignee"
            value={assigneeUid}
            onChange={(e) => setAssigneeUid(e.target.value)}
            required
            className="glass-well focus-visible:ring-orange/40 h-9 w-full rounded-lg px-3 text-sm outline-none focus-visible:ring-2"
          >
            <option value="">Select a member…</option>
            {multiTeam
              ? groups.map(([team, list]) => (
                  <optgroup key={team} label={team}>
                    {list.map((m) => (
                      <option key={m.uid} value={m.uid}>
                        {m.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              : members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.name}
                  </option>
                ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-due">Due date (optional)</Label>
          <Input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-desc">Details (optional)</Label>
        <Textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Context, links, acceptance criteria…"
        />
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "Assigning…" : "Assign task"}
      </Button>
    </form>
  );
}
