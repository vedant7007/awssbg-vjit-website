import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { RollingText } from "@/components/motion/RollingText";
import { JoinForm } from "@/components/join/JoinForm";

export const metadata: Metadata = {
  title: "Join the community",
  description:
    "Sign up for AWS Student Builder Group VJIT. Tell us a bit about yourself and get the Discord invite — open to every branch and year, no prior AWS experience needed.",
};

export default function JoinPage() {
  return (
    <div className="pt-28 pb-24 md:pt-36">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-pixel text-orange mb-6 text-[0.6rem] tracking-[0.25em]">
            JOIN · THE · COMMUNITY
          </p>
          <RollingText
            as="h1"
            text={"One form. Then you're in."}
            className="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] text-balance"
          />
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-lg leading-relaxed">
            Open to every branch and year — no prior AWS experience needed. Fill
            this out and we&apos;ll drop you the Discord invite at the end.
          </p>
        </div>

        <JoinForm />
      </Container>
    </div>
  );
}
