import "server-only";

import { getCurrentUser } from "@/lib/auth/server";
import { getMemberById } from "@/lib/firestore/members.server";

/**
 * The signed-in user resolved against their member profile, with the
 * capabilities the task feature gates on:
 *   - isAdmin: the captain / core team (Firebase custom claim) — sees & assigns everything.
 *   - isLead:  a team lead (member role) — assigns within their own team.
 *   - team:    their team string, used to scope a lead's reach.
 */
export type Viewer = {
  uid: string;
  name: string;
  isAdmin: boolean;
  isLead: boolean;
  team: string | null;
  hasProfile: boolean;
};

export async function getViewer(): Promise<Viewer | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const member = await getMemberById(user.uid);
  return {
    uid: user.uid,
    name: member?.displayName ?? user.name ?? user.email ?? "Member",
    isAdmin: user.admin,
    isLead: member?.role === "lead",
    team: member?.team ?? null,
    hasProfile: member !== null,
  };
}

/** Whether `viewer` may assign a task on `team` (admin anywhere; lead in-team). */
export function canAssignToTeam(viewer: Viewer, team: string | null): boolean {
  if (viewer.isAdmin) return true;
  return viewer.isLead && !!team && viewer.team === team;
}
