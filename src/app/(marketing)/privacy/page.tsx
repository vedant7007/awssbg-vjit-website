import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { LegalBody, LegalSection } from "@/components/legal/LegalBody";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How AWS SBG VJIT collects, uses, and stores your data.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy"
      description="What we collect, why, and how to have it removed. Last reviewed 2026."
    >
      <LegalBody>
        <LegalSection title="The short version">
          <p>
            We collect the minimum needed to run the community: who you are,
            your member profile, and which events you register for. We do not
            sell your data or use it for advertising. You can ask us to delete
            it at any time.
          </p>
        </LegalSection>

        <LegalSection title="What we collect">
          <ul>
            <li>
              <strong>Account details from Google.</strong> When you sign in
              with Google we receive your name, email address, and profile
              photo.
            </li>
            <li>
              <strong>Your member profile.</strong> The username, bio, branch,
              batch year, skills, and social links you choose to add.
            </li>
            <li>
              <strong>Event registrations.</strong> Which events you register
              for and whether you attended, so we can issue tickets and check
              you in.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="How we use it">
          <ul>
            <li>To sign you in and keep your session secure.</li>
            <li>
              To show your public profile at your chosen username, if you set it
              to public.
            </li>
            <li>
              To send you an event ticket by email when you register, using
              Resend.
            </li>
            <li>To check you in at events using your ticket QR code.</li>
          </ul>
        </LegalSection>

        <LegalSection title="Where it is stored">
          <p>
            Your data is stored in Google Firebase (Authentication and
            Firestore) and event emails are sent through Resend. Access to
            member data is restricted to the club core team through server-side
            security rules.
          </p>
        </LegalSection>

        <LegalSection title="Your choices">
          <ul>
            <li>
              <strong>Visibility.</strong> You control whether your profile is
              public from your console settings.
            </li>
            <li>
              <strong>Deletion.</strong> Ask a core member to remove your
              account and we will delete your member profile and registrations.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Questions about your data can go to any core member of AWS SBG VJIT.
            We will help you access, correct, or delete it.
          </p>
        </LegalSection>
      </LegalBody>
    </PageShell>
  );
}
