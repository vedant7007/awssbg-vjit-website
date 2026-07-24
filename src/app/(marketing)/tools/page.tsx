import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { ToolkitHub } from "@/components/tools/ToolkitHub";

export const metadata: Metadata = {
  title: "Toolkit",
  description:
    "A set of small, genuinely useful in-browser utilities for students — image converter and compressor, README generator, AWS cost estimator, JSON formatter, and encode/decode helpers. Everything runs locally; nothing is uploaded.",
};

export default function ToolsPage() {
  return (
    <div className="pt-28 md:pt-36">
      <Container>
        <section className="py-14 lg:py-24">
          <Reveal>
            <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
              Student toolkit
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.92] font-bold tracking-[-0.04em]">
              Small tools that
              <br />
              actually work.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed text-balance">
              The utilities you keep opening a random ad-filled site for —
              gathered in one place, and running entirely in your browser. No
              uploads, no accounts, nothing leaves your machine.
            </p>
          </Reveal>

          <div className="mt-12">
            <ToolkitHub />
          </div>
        </section>
      </Container>
    </div>
  );
}
