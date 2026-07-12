import type { Metadata } from "next";

import { safe } from "@/lib/utils/safe";
import { getPublicMembers } from "@/lib/firestore/members.server";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/layout/Section";
import { MemberCard } from "@/components/cards/MemberCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { Member } from "@/lib/types";

export const metadata: Metadata = {
  title: "Team",
  description: "The core members and leads running AWS SBG VJIT.",
};

export const dynamic = "force-dynamic";

const ROLE_ORDER: Record<string, number> = { core: 0, lead: 1 };

export default async function TeamPage() {
  const members = await safe(getPublicMembers(200), [], "team:list");
  const team = members
    .filter((m) => m.role === "core" || m.role === "lead")
    .sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9));

  // Group by team, preserving a stable order and putting "no team" last.
  const groups = new Map<string, Member[]>();
  for (const m of team) {
    const key = m.team ?? "Core";
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden pt-20 pb-4 md:pt-28">
        <div
          className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-50"
          aria-hidden
        />
        <Container>
          <p className="eyebrow mb-6">The core</p>
          <h1 className="font-display max-w-3xl text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[0.98] font-bold tracking-[-0.03em]">
            The people running the group.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
            Core members and leads who plan the sessions, mentor new builders,
            and keep AWS SBG VJIT moving. Everyone here started as a member.
          </p>
        </Container>
      </section>

      <Container>
        <div className="space-y-16 py-16">
          {groups.size > 0 ? (
            [...groups.entries()].map(([teamName, list]) => (
              <section key={teamName}>
                <SectionHeader eyebrow="Team" title={teamName} />
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((member) => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <EmptyState
              title="Team coming together"
              description="Core members and leads will appear here as profiles are published."
            />
          )}
        </div>
      </Container>
    </div>
  );
}
