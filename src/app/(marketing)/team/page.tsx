import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { FadeUp } from "@/components/motion/FadeUp";
import { listMembers } from "@/lib/firestore/members.server";
import { safe } from "@/lib/utils/safe";

export const metadata: Metadata = {
  title: "Team",
  description: "The core and leads running AWS SBG VJIT.",
  alternates: {
    canonical: "/team",
  },
};

export const dynamic = "force-dynamic";

// Exactly 6 high-quality temporary placeholder profiles for Team Leads (fallback)
const PLACEHOLDER_LEADS = [
  {
    id: "lead-1",
    name: "Alex Carter",
    role: "President",
    handle: "alexcarter",
    status: "Online",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80",
  },
  {
    id: "lead-2",
    name: "Jordan Smith",
    role: "Vice President",
    handle: "jordansmith",
    status: "Offline",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80",
  },
  {
    id: "lead-3",
    name: "Taylor Reed",
    role: "Tech Lead",
    handle: "taylorreed",
    status: "Online",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&q=80",
  },
  {
    id: "lead-4",
    name: "Morgan Hayes",
    role: "Design Lead",
    handle: "morganhayes",
    status: "Online",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80",
  },
  {
    id: "lead-5",
    name: "Casey Brooks",
    role: "Events Lead",
    handle: "caseybrooks",
    status: "Offline",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&q=80",
  },
  {
    id: "lead-6",
    name: "Riley Green",
    role: "Marketing Lead",
    handle: "rileygreen",
    status: "Online",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&q=80",
  },
];

export default async function TeamPage() {
  const allMembers = await safe(listMembers(), []);

  // Filter core and lead members
  const dbLeads = allMembers.filter(
    (m) => (m.role === "lead" || m.role === "core") && m.isPublic,
  );

  // Sort: core first, then leads
  const sortedDbLeads = [...dbLeads].sort((a, b) => {
    if (a.role === "core" && b.role !== "core") return -1;
    if (a.role !== "core" && b.role === "core") return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  const team =
    sortedDbLeads.length > 0
      ? sortedDbLeads.map((m) => ({
          id: m.id,
          name: m.displayName,
          role:
            m.role === "core" ? "Core Committee" : `${m.team || "Team"} Lead`,
          handle: m.username,
          status: "Online", // default status
          avatarUrl:
            m.photoURL ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${m.username}`,
        }))
      : PLACEHOLDER_LEADS;

  return (
    <>
      <Hero />

      <Section className="!pt-8 pb-32">
        <Container>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {team.map((member, i) => (
              <FadeUp key={member.id} index={i}>
                <div className="group relative">
                  {/* Subtle blur background element that triggers on hover */}
                  <div className="from-orange/10 via-purple/5 to-blue/10 absolute inset-0 -z-10 rounded-sm bg-gradient-to-tr opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                  <ProfileCard
                    name={member.name}
                    title={member.role}
                    handle={member.handle}
                    status={member.status}
                    avatarUrl={member.avatarUrl}
                    contactText="Contact Me"
                    behindGlowEnabled={true}
                    enableTilt={true}
                  />
                </div>
              </FadeUp>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
      {/* Glow graphics that complement the ProfileCard aesthetic */}
      <div className="from-orange/15 to-purple/5 pointer-events-none absolute top-1/4 left-1/2 -z-20 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr opacity-70 blur-[100px] filter" />
      <div
        className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-40"
        aria-hidden
      />
      <Container>
        <p className="eyebrow mb-6">Our Team</p>
        <h1 className="font-display max-w-4xl text-[clamp(3rem,6vw+1rem,6rem)] leading-[0.95] font-bold tracking-[-0.03em]">
          Meet the <span className="font-duo text-orange">builders</span>.
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
          The core team and leads dedicated to running the AWS Student Builder
          Group, orchestrating events, and empowering our community.
        </p>
      </Container>
    </section>
  );
}
