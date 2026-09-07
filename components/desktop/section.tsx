"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * The shell a top-level dashboard section wears on the paper ground — the
 * structural role <Card> used to play for Workload / Pulse / Financial,
 * minus the ring and the raised fill. Owns the scroll-anchor id, the
 * heading row (serif title + optional right-aligned meta), and the break
 * from the section above: a full-bleed hairline over standing space.
 *
 * <NeedsAttention> keeps its own markup — it's the one block that still
 * earns a card, three of them now, one per urgent count.
 */
export function Section({
  id,
  title,
  meta,
  children,
  className,
  as = "h2",
  first = false,
}: {
  id: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Heading level for the title — Needs attention keeps h1 semantics as
   * the page's first heading; every other section is an h2. */
  as?: "h1" | "h2";
  /** Drops the top rule and reduces the top margin for the first section
   * under the header, where the pillar band already provides the break. */
  first?: boolean;
}) {
  const Heading = as;
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      aria-label={title}
      className={cn(first ? "mt-10" : "mt-16 border-t border-border pt-10", className)}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px 0px -80px 0px" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="flex items-baseline justify-between gap-6">
        <Heading className="t-section">{title}</Heading>
        {meta != null && (
          <div className="t-detail tabular-nums text-muted-foreground">{meta}</div>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}
