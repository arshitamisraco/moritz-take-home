/**
 * Threshold rules — read here, never assigned. Every pillar state in
 * lib/derive/pillars.ts is the output of one of these rules; the tooltip
 * on each pillar renders this same table, so the two can never drift.
 */

export const MARGIN_FLOOR_PCT = 45;
export const WORKLOAD_STEADY_MAX_OVER_COMMITTED = 2;
export const WORKLOAD_STRAINING_MAX_OVER_COMMITTED = 8;
/** No activity in this long reads as stalled, feeding the health rule's
 * "matters stalled" straining condition. */
export const STALL_HOURS = 96;

export const PILLAR_RULES = {
  health: {
    label: "Firm health",
    steady: "No breaches, nothing overdue",
    straining: "Matters in final window, or matters stalled",
    breaking: "Anything overdue, or work started before conflicts cleared",
  },
  workload: {
    label: "Workload",
    steady: `≤${WORKLOAD_STEADY_MAX_OVER_COMMITTED} lawyers over committed`,
    straining: `${WORKLOAD_STEADY_MAX_OVER_COMMITTED + 1}–${WORKLOAD_STRAINING_MAX_OVER_COMMITTED} over committed, or undeclared availability`,
    breaking: `>${WORKLOAD_STRAINING_MAX_OVER_COMMITTED} over committed, or an unplaceable matter past its deadline`,
  },
  financial: {
    label: "Financial",
    steady: "All open matters above margin floor",
    straining: "Any open matter below floor or negative",
    breaking: "A delivered matter closed negative",
  },
} as const;

export type PillarKey = keyof typeof PILLAR_RULES;
export type PillarState = "steady" | "straining" | "breaking";
