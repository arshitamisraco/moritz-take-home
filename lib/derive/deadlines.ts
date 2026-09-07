import type { EffectiveFixture } from "./apply-overlay";
import { atRiskRows } from "./matters";

export interface DeadlineHorizon {
  label: string;
  count: number;
}

/**
 * Three horizons, not a full calendar: overdue (already broken its
 * promise), today (includes the next-4h bucket — both are same-day
 * pressure), this week. Matches the granularity of atRiskRows' own
 * buckets so the count here can never drift from the detail list below it.
 */
export function deadlineHorizons(fx: EffectiveFixture): DeadlineHorizon[] {
  const rows = atRiskRows(fx).filter((r) => r.bucket !== "compliance");
  const overdue = rows.filter((r) => r.bucket === "overdue").length;
  const today = rows.filter((r) => r.bucket === "next4h" || r.bucket === "today").length;
  const thisWeek = rows.filter((r) => r.bucket === "thisWeek").length;

  const horizons: DeadlineHorizon[] = [];
  if (overdue > 0) horizons.push({ label: "Overdue", count: overdue });
  horizons.push({ label: "Today", count: today });
  horizons.push({ label: "This week", count: thisWeek });
  return horizons;
}
