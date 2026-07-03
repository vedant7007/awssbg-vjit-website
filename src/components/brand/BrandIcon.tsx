import * as React from "react";
import {
  BookOpen,
  Hammer,
  Trophy,
  Rocket,
  Mic,
  Cloud,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

/*
 * Named brand icons. Backed by lucide today; TODO(Vedant): replace with the
 * AWS SBG icon set from /brand-assets/icons once exported as React components.
 */
const ICONS = {
  learn: BookOpen,
  build: Hammer,
  compete: Trophy,
  ship: Rocket,
  speak: Mic,
  cloud: Cloud,
} satisfies Record<string, LucideIcon>;

export type BrandIconName = keyof typeof ICONS;

export function BrandIcon({
  name,
  className,
  "aria-hidden": ariaHidden = true,
}: {
  name: BrandIconName;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  const Icon = ICONS[name];
  return <Icon className={cn("size-6", className)} aria-hidden={ariaHidden} />;
}
