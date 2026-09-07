"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

/**
 * The one entrance the page makes. Every top-level block rises 8px and
 * fades in over 400ms on mount, staggered by `order` so the page settles
 * top-down rather than popping in as a wall. Nothing else animates on
 * load — a dashboard should feel placed, not performed. Honours
 * prefers-reduced-motion by skipping the initial offset entirely.
 */
const EASE = [0.22, 1, 0.36, 1] as const;
const STAGGER_S = 0.06;

export function Reveal({
  order = 0,
  ...props
}: HTMLMotionProps<"div"> & { order?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: order * STAGGER_S }}
      {...props}
    />
  );
}

/** Enter / exit for a keyed item that swaps in place — the act-now card.
 * A short lateral slide says "the queue moved", which a plain crossfade
 * doesn't. */
export const SWAP = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};
