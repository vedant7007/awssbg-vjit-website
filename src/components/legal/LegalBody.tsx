import * as React from "react";

/**
 * Simple prose wrapper for legal/content pages. Styles headings, paragraphs,
 * and lists through the design tokens so we do not need a typography plugin.
 */
export function LegalBody({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl space-y-10">{children}</div>;
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="text-muted-foreground [&_a]:text-orange [&_strong]:text-foreground space-y-3 leading-relaxed [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:pl-1 [&_strong]:font-medium [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
