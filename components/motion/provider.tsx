"use client";

import { MotionConfig } from "motion/react";

/** Global motion policy: every transform-based animation in the tree
 * yields to the OS reduce-motion setting; fades stay. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
