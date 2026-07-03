import * as React from "react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/brand/Logo";
import { FOOTER_EXPLORE, SOCIAL_LINKS, LEGAL_LINKS } from "@/lib/constants/nav";

/** Static site footer. Server component. Fixed year, no runtime clock. */
export function Footer() {
  return (
    <footer className="bg-paper-warm border-t">
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
              A student community at VJIT learning, building, and shipping on
              AWS. Open to anyone on campus who wants to build in the cloud.
            </p>
          </div>

          <FooterColumn title="Explore">
            {FOOTER_EXPLORE.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Connect">
            {SOCIAL_LINKS.map((link) =>
              link.href ? (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ) : (
                <span
                  key={link.label}
                  className="text-muted-foreground/60 text-sm"
                  // TODO(Vedant): add real channel URLs when confirmed.
                >
                  {link.label}
                </span>
              ),
            )}
          </FooterColumn>

          <FooterColumn title="Legal">
            {LEGAL_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="text-muted-foreground flex flex-col gap-2 border-t py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>AWS SBG at VJIT, Hyderabad</p>
          <p className="font-mono text-xs">&copy; 2026 AWS SBG VJIT</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="eyebrow mb-4">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {React.Children.map(children, (child) => (
          <li>{child}</li>
        ))}
      </ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-orange text-sm transition-colors"
    >
      {children}
    </Link>
  );
}
