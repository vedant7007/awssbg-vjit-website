import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { LegalBody, LegalSection } from "@/components/legal/LegalBody";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "How members of AWS SBG VJIT treat each other, what is not tolerated, and how to report a problem.",
};

export default function CodeOfConductPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Code of Conduct"
      description="The standard we hold each other to, in every space we share."
    >
      <LegalBody>
        <LegalSection title="Our commitment">
          <p>
            AWS SBG VJIT is a place to learn and build. We want every member to
            feel welcome and safe, whatever their branch, year, gender,
            background, or skill level. This code applies to all of our spaces:
            events, workshops, project teams, and online channels.
          </p>
        </LegalSection>

        <LegalSection title="What we expect">
          <ul>
            <li>Be respectful. Assume good intent and disagree kindly.</li>
            <li>
              Be generous with help. Everyone was a beginner once; teach without
              condescension.
            </li>
            <li>
              Give credit. Acknowledge the work and ideas of others in projects
              and talks.
            </li>
            <li>
              Keep it collaborative. Share knowledge rather than hoarding it.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="What is not tolerated">
          <ul>
            <li>
              Harassment, discrimination, or demeaning comments of any kind.
            </li>
            <li>Unwelcome attention, intimidation, or personal attacks.</li>
            <li>
              Sharing someone&apos;s private information without their consent.
            </li>
            <li>
              Plagiarism, or passing off others&apos; work as your own in club
              projects.
            </li>
            <li>
              Disrupting sessions or deliberately wasting the group&apos;s time.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="Reporting a problem">
          <p>
            If you experience or witness behaviour that breaks this code, tell
            any core member of AWS SBG VJIT. Reports are taken seriously and
            handled discreetly. You will not be penalised for reporting in good
            faith.
          </p>
        </LegalSection>

        <LegalSection title="Consequences">
          <p>
            The core team may warn, remove from a session, or remove from the
            group anyone who breaks this code, depending on the severity. Our
            goal is always to keep the community safe and welcoming.
          </p>
        </LegalSection>
      </LegalBody>
    </PageShell>
  );
}
