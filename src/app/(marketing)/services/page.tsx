/*
 * Owner: Rishikesh
 * Status: skeleton
 * Acceptance criteria:
 *   - Expand the five pillars (lib/constants/services.ts) into full sections.
 *   - Each pillar: what we run, who it is for, and a real example.
 *   - Keep copy honest; no fabricated outcomes or counts.
 * Reference: lib/constants/services.ts and the landing "What we do" section.
 */
import type { Metadata } from "next";

import { PILLARS } from "@/lib/constants/services";
import { RouteSkeleton } from "@/components/feedback/RouteSkeleton";
import { BrandIcon, type BrandIconName } from "@/components/brand/BrandIcon";

export const metadata: Metadata = {
  title: "Services",
  description:
    "The five pillars of AWS SBG VJIT: learn, build, compete, ship, speak.",
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesPage() {
  return (
    <div className="pt-16">
      <RouteSkeleton
        eyebrow="What we do"
        title="Services"
        description="The five pillars, ready to be expanded into full sections."
        owner="Rishikesh"
        reference="lib/constants/services.ts"
        criteria={[
          "Turn each pillar below into a detailed section.",
          "Add a real example or format for each (workshop, hackathon, etc).",
          "No fabricated numbers or outcomes.",
        ]}
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <li
              key={pillar.key}
              className="flex items-start gap-3 rounded-sm border p-4"
            >
              <BrandIcon
                name={pillar.key as BrandIconName}
                className="text-orange mt-0.5"
              />
              <div>
                <p className="font-medium">{pillar.title}</p>
                <p className="text-muted-foreground text-sm">
                  {pillar.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </RouteSkeleton>
    </div>
  );
}
