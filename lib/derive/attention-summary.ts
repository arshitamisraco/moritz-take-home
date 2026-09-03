import type { EffectiveFixture } from "./apply-overlay";
import { atRiskRows, exceptionQueue, type AtRiskRow } from "./matters";
import { overCommitted, undeclared } from "./bench";
import {
  WORKLOAD_STEADY_MAX_OVER_COMMITTED,
  WORKLOAD_STRAINING_MAX_OVER_COMMITTED,
  type PillarState,
} from "./thresholds";

/**
 * The hero's three numbers. Each is a re-read of an existing rule (the
 * same ones that drive the Workload zone and the pillar states below) —
 * nothing here is a fact of its own, so the hero can never say "3" while
 * the detail section it points at says something else.
 */
export interface AttentionSummary {
  /** At-risk matters with a live clock: everything except the pinned
   * compliance breach, which has no deadline to count down. */
  deadlines: number;
  overloaded: number;
  /** Needs a human decision before it can move: unplaced matters plus
   * lawyers who haven't declared capacity this week. */
  awaitingAction: number;
  compliance: number;
}

export function attentionSummary(fx: EffectiveFixture): AttentionSummary {
  const rows = atRiskRows(fx);
  return {
    deadlines: rows.filter((r) => r.bucket !== "compliance").length,
    compliance: rows.filter((r) => r.bucket === "compliance").length,
    overloaded: overCommitted(fx).length,
    awaitingAction: exceptionQueue(fx).length + undeclared(fx).length,
  };
}

export interface AttentionSeverity {
  deadlines: PillarState;
  overloaded: PillarState;
  awaitingAction: PillarState;
}

/** Shared by the desktop and mobile hero — one severity rule per stat, so
 * the two surfaces can never disagree on how red a number is. */
export function attentionSeverity(summary: AttentionSummary, rows: AtRiskRow[]): AttentionSeverity {
  const hasOverdue = rows.some((r) => r.bucket === "overdue");
  return {
    deadlines: hasOverdue ? "breaking" : summary.deadlines > 0 ? "straining" : "steady",
    overloaded:
      summary.overloaded > WORKLOAD_STRAINING_MAX_OVER_COMMITTED
        ? "breaking"
        : summary.overloaded > WORKLOAD_STEADY_MAX_OVER_COMMITTED
          ? "straining"
          : "steady",
    awaitingAction: summary.awaitingAction > 0 ? "straining" : "steady",
  };
}
