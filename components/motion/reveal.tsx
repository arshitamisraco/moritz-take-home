"use client";

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "motion/react";

/**
 * The one entrance the page makes. Every top-level block rises 8px and
 * fades in over 400ms on mount, staggered by `order` so the page settles
 * top-down rather than popping in as a wall. Nothing else animates on
 * load — a dashboard should feel placed, not performed. Honours
 * prefers-reduced-motion by skipping the initial offset entirely.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;
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

/**
 * The scroll entrance. A block below the fold arrives the same way the
 * mount reveal arrives — 10px and a fade — but only once, the first time
 * it crosses into view, and slightly early (`margin`) so the movement is
 * finished by the time the block is properly read.
 */
export function ScrollReveal({
  delay = 0,
  y = 10,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px 0px -64px 0px" }}
      transition={{ duration: 0.45, ease: EASE, delay }}
      {...props}
    />
  );
}

/** Container/child pair for a list that arrives row by row rather than as
 * a block. The container drives the timing so children stay declarative. */
export const staggerContainer: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
};

/** A list whose rows fade up in sequence when the list scrolls into view. */
export function StaggerList(props: HTMLMotionProps<"ul">) {
  return (
    <motion.ul
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-40px 0px" }}
      variants={staggerContainer}
      {...props}
    />
  );
}

/** The same sequencing for a non-list container (a grid of cards). */
export function StaggerGroup(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-40px 0px" }}
      variants={staggerContainer}
      {...props}
    />
  );
}

/** One row inside a <StaggerList>. Also carries its own exit, so a list
 * wrapped in AnimatePresence collapses a removed row instead of snapping. */
export function StaggerRow({ ...props }: HTMLMotionProps<"li">) {
  return (
    <motion.li
      variants={staggerItem}
      exit={{ opacity: 0, x: -8, transition: { duration: 0.16 } }}
      layout="position"
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

/** The press. Every control that can be clicked gives the same 2% dip on
 * pointer-down, so a tap is felt before the state behind it changes. */
export const PRESS = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.4 },
};

/** A card-sized surface that lifts under the pointer and presses on tap. */
export const LIFT = {
  whileHover: { y: -2 },
  whileTap: { y: 0, scale: 0.995 },
  transition: { type: "spring" as const, stiffness: 400, damping: 32, mass: 0.6 },
};
