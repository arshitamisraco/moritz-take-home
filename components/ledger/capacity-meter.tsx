import type { ReactNode } from "react";
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

  const cells: ReactNode[] = [
    ...segments.map((p, i) => (
      <span key={`s${i}`} className={cn("h-full flex-1", SEGMENT_TOKEN[p])} />
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
