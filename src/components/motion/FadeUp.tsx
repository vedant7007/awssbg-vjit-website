"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type FadeUpProps = HTMLMotionProps<"div"> & {
  /** Stagger index; multiplies the base delay for sequenced reveals. */
  index?: number;
  delay?: number;
};

/**
 * Framer Motion fade-and-rise primitive. Animates once on scroll into view.
 * MotionConfig reducedMotion="user" (set in the root layout) neutralizes this
 * for users who prefer reduced motion.
 */
export function FadeUp({
  index = 0,
  delay = 0,
  children,
  ...props
}: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: delay + index * 0.08,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
