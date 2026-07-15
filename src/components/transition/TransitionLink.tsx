"use client";

import * as React from "react";
import Link from "next/link";

import { useCloudTransition } from "./CloudTransitionProvider";

/**
 * Drop-in replacement for next/link that routes internal navigations through
 * the cloud transition. Modifier/middle/new-tab clicks and external hrefs fall
 * through to a normal link (no animation), and prefetch is preserved.
 */
export const TransitionLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof Link>
>(function TransitionLink({ href, onClick, children, ...props }, ref) {
  const { navigate } = useCloudTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Let the browser handle new-tab / modified / non-primary clicks.
    if (
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      props.target === "_blank"
    ) {
      return;
    }
    const url = typeof href === "string" ? href : (href?.toString() ?? "");
    if (!url.startsWith("/")) return; // external → normal navigation
    e.preventDefault();
    navigate(url);
  };

  return (
    <Link href={href} onClick={handleClick} ref={ref} {...props}>
      {children}
    </Link>
  );
});
