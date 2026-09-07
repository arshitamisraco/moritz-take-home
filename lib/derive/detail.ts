import { MARGIN_FLOOR_PCT } from "./thresholds";
import { isComplianceBreach, promiseClockPct, type TimeBucket } from "./matters";
import { clockTime, dayLabel, formatPct, hoursSince, unplacedReasonLabel } from "@/lib/format";
import type { EffectiveMatter } from "./apply-overlay";

/**
 * Consequence, not sentiment — every fragment here is computed from the
 * matter's own offsets and flags, never typed in per row.
 */
export function attentionDetail(m: EffectiveMatter, bucket: TimeBucket): string {
  const parts: string[] = [];

  if (bucket === "compliance" || isComplianceBreach(m)) {
    // No "expedited" suffix: expediting clears the breach outright, so a
    // matter can never reach this branch already carrying that flag.
    parts.push("Conflicts not cleared, work started");
  } else if (m.deadlineOffsetMs !== null) {
    const off = m.deadlineOffsetMs;
    if (off < 0) {
      if (m.deadlineKind === "promise" && m.promisedAtOffsetMs !== null) {
        const elapsed = hoursSince(m.promisedAtOffsetMs);
        const sla = Math.round((m.deadlineOffsetMs - m.promisedAtOffsetMs) / 3_600_000);
        const pct = promiseClockPct(m);
        parts.push(`${elapsed}h against ${sla}h promised${pct !== null && pct > 100 ? ` (${pct}%)` : ""}`);
      } else {
        parts.push(`Closed ${dayLabel(off)}, undelivered`);
      }
    } else {
      const label = dayLabel(off);
      parts.push(label === "today" ? `Due ${clockTime(off)}` : `Due ${label} ${clockTime(off)}`);
      if (m.cannotExtend) parts.push("cannot be extended");
    }
  }

  if (m.marginPct < MARGIN_FLOOR_PCT) {
    parts.push(`margin ${formatPct(m.marginPct)}, below floor`);
  }

  if (m.unplacedReason) {
    parts.push(`unplaced: ${unplacedReasonLabel(m.unplacedReason)}`);
  }

  return parts.join(" · ");
}
