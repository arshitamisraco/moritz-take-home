import type { EffectiveFixture } from "./apply-overlay";
import { belowFloorOpenMatters, deliveredNegativeMatters } from "./financial";
import {
  hasUnplaceableMatterPastDeadline,
  isComplianceBreach,
  isInFinalWindow,
  isOverdue,
  isStalled,
  onTimeRatePct,
} from "./matters";
import { overCommitted, undeclared } from "./bench";
import {
  MARGIN_FLOOR_PCT,
  STALL_HOURS,
  WORKLOAD_STEADY_MAX_OVER_COMMITTED,
  WORKLOAD_STRAINING_MAX_OVER_COMMITTED,
  type PillarState,
} from "./thresholds";

export interface PillarResult {
  state: PillarState;
  /** The count the rule fired on — the same number drives the headline
   * figure and the state, so the two can never contradict each other. */
  count: number;
  headline: string;
  baseline: string;
  evidence: string;
}

/**
 * Health leads with the breach that makes it Breaking, not the on-time
 * rate — on-time is lagging context and lives in the baseline line.
 */
export function healthPillar(fx: EffectiveFixture): PillarResult {
  const breaches = fx.matters.filter(isComplianceBreach);
  const overdue = fx.matters.filter(isOverdue);
  const finalWindow = fx.matters.filter(isInFinalWindow);
  const stalled = fx.matters.filter((m) => isStalled(m, STALL_HOURS * 3_600_000));

  const breakingCount = breaches.length + overdue.length;
  const strainingCount = finalWindow.length + stalled.length;
  const onTime = onTimeRatePct(fx);

  let state: PillarState = "steady";
  let count = 0;
  if (breakingCount > 0) {
    state = "breaking";
    count = breakingCount;
  } else if (strainingCount > 0) {
    state = "straining";
    count = strainingCount;
  }

  const evidence =
    breaches.length > 0 && overdue.length > 0
      ? `${overdue.length} overdue · ${breaches.length} conflicts breach`
      : breaches.length > 0
        ? `${breaches.length} conflicts breach · work started`
        : overdue.length > 0
          ? `${overdue.length} overdue`
          : strainingCount > 0
            ? `${finalWindow.length} in final window · ${stalled.length} stalled`
            : "Nothing overdue · conflicts clear";

  return {
    state,
    count,
    headline: String(count),
    baseline: `${onTime}% on-time · target ${fx.onTimeTargetPct}%`,
    evidence,
  };
}

export function workloadPillar(fx: EffectiveFixture): PillarResult {
  const over = overCommitted(fx);
  const undecl = undeclared(fx);
  const unplaceableBreach = hasUnplaceableMatterPastDeadline(fx);

  let state: PillarState = "steady";
  if (over.length > WORKLOAD_STRAINING_MAX_OVER_COMMITTED || unplaceableBreach) {
    state = "breaking";
  } else if (over.length > WORKLOAD_STEADY_MAX_OVER_COMMITTED || undecl.length > 0) {
    state = "straining";
  }

  return {
    state,
    count: over.length,
    headline: String(over.length),
    baseline: `${over.length} of ${fx.lawyers.length} over committed`,
    evidence:
      undecl.length > 0
        ? `${undecl.length} undeclared · reassign to clear`
        : `all availability declared`,
  };
}

export function financialPillar(fx: EffectiveFixture): PillarResult {
  const belowFloor = belowFloorOpenMatters(fx);
  const deliveredNegative = deliveredNegativeMatters(fx);

  let state: PillarState = "steady";
  if (deliveredNegative.length > 0) {
    state = "breaking";
  } else if (belowFloor.length > 0) {
    state = "straining";
  }

  const worst = belowFloor[0];

  return {
    state,
    count: belowFloor.length,
    headline: String(belowFloor.length),
    baseline: `realized ${fx.realizedMarginPct}% · quoted ${fx.quotedMarginPct}% · target ${fx.marginTargetPct}%`,
    evidence:
      belowFloor.length === 0
        ? `All open matters above ${MARGIN_FLOOR_PCT}% floor`
        : worst.marginPct < 0
          ? `${worst.client} at ${worst.marginPct}% margin`
          : `${belowFloor.length} below ${MARGIN_FLOOR_PCT}% floor`,
  };
}
