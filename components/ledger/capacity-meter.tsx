"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { DeadlinePressure } from "@/lib/derive/bench-load";
import { cn } from "@/lib/utils";

/**
 * CapacityMeter — the shared encoding.
 *
 * One segment per committed matter on the bg-accent track, with a 1px
 * bg-ink-3 hairline at the declared-capacity mark. Load is carried by
 * segment count against the hairline, so the colour channel is free to
 * encode deadline proximity instead. Discrete marks because committed /
 * declared are small integers — a continuous bar makes 133% and 125% look
 * identical.
 *
 * Reuses the exact token mapping the old CapacityBar used; only the key
 * changed. No new colour tokens. The row's text label is the accessible
 * content — this is aria-hidden. DOM pattern follows the pulse.tsx
 * sparkline: N siblings on a shared ground, the hairline a flex child
 * rather than absolute-position math.
 */

const SEGMENT_TOKEN: Record<DeadlinePressure, string> = {
  overdue: "bg-breaking", // the one accent — true alerts only
  today: "bg-chart-2",
  later: "bg-chart-4",
  none: "bg-chart-5",
};

const LEGEND: { key: DeadlinePressure; label: string }[] = [
  { key: "overdue", label: "overdue" },
  { key: "today", label: "due today" },
  { key: "later", label: "later" },
  { key: "none", label: "no deadline" },
];

/**
 * The meter's key, rendered once per surface above the bench — the visible
 * text that decodes the colour channel and the hairline for a first-time
 * reader, since the meter itself is aria-hidden.
 */
export function CapacityLegend({ className }: { className?: string }) {
  return (
    <p className={cn("t-detail flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground", className)}>
      {LEGEND.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className={cn("inline-block h-1.5 w-3", SEGMENT_TOKEN[key])} />
          {label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="inline-block h-3 w-px bg-ink-3" />
        declared capacity
      </span>
    </p>
  );
}

export function CapacityMeter({
  segments,
  declared,
  className,
}: {
  segments: DeadlinePressure[];
  declared: number;
  className?: string;
}) {
  const empties = Math.max(0, declared - segments.length);
  const total = segments.length + empties;
  const mark = Math.min(Math.max(declared, 0), total);

  // Committed segments grow out of the track left to right, one after the
  // next, so a lawyer's load is seen accumulating past the hairline rather
  // than arriving already full.
  const cells: ReactNode[] = [
    ...segments.map((p, i) => (
      <motion.span
        key={`s${i}`}
        className={cn("h-full flex-1 origin-left", SEGMENT_TOKEN[p])}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-24px 0px" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.03 }}
      />
    )),
    ...Array.from({ length: empties }, (_, i) => (
      <span key={`e${i}`} className="h-full flex-1 bg-accent" />
    )),
  ];

  const hairline = <span key="hairline" aria-hidden="true" className="w-px shrink-0 bg-ink-3" />;
  if (mark < total) cells.splice(mark, 0, hairline);

  return (
    <div aria-hidden="true" className={cn("flex h-1.5 items-stretch gap-px bg-accent", className)}>
      {cells}
      {mark >= total && hairline}
    </div>
  );
}
