import { DAY, HOUR } from "@/lib/fixture/clock";
import type { EffectiveFixture, EffectiveMatter } from "./apply-overlay";

export type TimeBucket = "compliance" | "overdue" | "next4h" | "today" | "thisWeek";

export interface AtRiskRow {
  matter: EffectiveMatter;
  bucket: TimeBucket;
}

/** Near-term window boundary — wide enough to hold same-morning promise
 * deadlines a few hours out without pulling in the rest of the day. */
const NEXT_WINDOW_MS = 6 * HOUR;
const THIS_WEEK_MS = 7 * DAY;

export function isComplianceBreach(m: EffectiveMatter): boolean {
  return !m.conflictsCleared && m.workStarted;
}

/** A halted matter's deadline pressure is struck through — paused work
 * doesn't accrue as overdue or stalled. */
export function isOverdue(m: EffectiveMatter): boolean {
  return (
    m.status === "open" &&
    !m.halted &&
    m.deadlineOffsetMs !== null &&
    m.deadlineOffsetMs < 0
  );
}

export function isStalled(m: EffectiveMatter, stallThresholdMs: number): boolean {
  return m.status === "open" && !m.halted && m.lastActivityOffsetMs < -stallThresholdMs;
}

export function isInFinalWindow(m: EffectiveMatter): boolean {
  return (
    m.status === "open" &&
    !m.halted &&
    m.deadlineOffsetMs !== null &&
    m.deadlineOffsetMs >= 0 &&
    m.deadlineOffsetMs <= NEXT_WINDOW_MS
  );
}

function bucketFor(m: EffectiveMatter): TimeBucket | null {
  if (isComplianceBreach(m)) return "compliance";
  if (!m.atRisk) return null;
  if (m.status !== "open" || m.deadlineOffsetMs === null) return null;
  const off = m.deadlineOffsetMs;
  if (off < 0) return "overdue";
  if (off <= NEXT_WINDOW_MS) return "next4h";
  if (off <= THIS_WEEK_MS) {
    // "today": inside the window boundary through the end of the demo day.
    const dayFromNow = Math.floor(off / DAY);
    if (dayFromNow === 0) return "today";
    return "thisWeek";
  }
  return null;
}

/** All at-risk matters, grouped and ordered: compliance pinned first (no
 * time bucket), then overdue, next 4 hours, today, this week. Nothing is
 * truncated — every at-risk matter renders. */
export function atRiskRows(fx: EffectiveFixture): AtRiskRow[] {
  const order: TimeBucket[] = ["compliance", "overdue", "next4h", "today", "thisWeek"];
  const rows: AtRiskRow[] = [];
  for (const m of fx.matters) {
    const bucket = bucketFor(m);
    if (bucket) rows.push({ matter: m, bucket });
  }
  return rows.sort((a, b) => {
    const byBucket = order.indexOf(a.bucket) - order.indexOf(b.bucket);
    if (byBucket !== 0) return byBucket;
    const aOff = a.matter.deadlineOffsetMs ?? 0;
    const bOff = b.matter.deadlineOffsetMs ?? 0;
    return aOff - bOff;
  });
}

export function exceptionQueue(fx: EffectiveFixture): EffectiveMatter[] {
  return fx.matters.filter((m) => m.status === "open" && m.effectiveLawyerId === null);
}

/** An unplaced matter whose deadline has already passed — the workload
 * rule's breaking condition. */
export function hasUnplaceableMatterPastDeadline(fx: EffectiveFixture): boolean {
  return exceptionQueue(fx).some(
    (m) => m.deadlineOffsetMs !== null && m.deadlineOffsetMs < 0
  );
}

/**
 * The soonest upcoming deadline across every open matter, at risk or not —
 * the empty state's "Next due" line derives from this, not a literal.
 */
export function nextDueMatter(fx: EffectiveFixture): EffectiveMatter | null {
  const upcoming = fx.matters
    .filter((m) => m.status === "open" && m.deadlineOffsetMs !== null && m.deadlineOffsetMs >= 0)
    .sort((a, b) => (a.deadlineOffsetMs as number) - (b.deadlineOffsetMs as number));
  return upcoming[0] ?? null;
}

export function onTimeRatePct(fx: EffectiveFixture): number {
  const { deliveredLast30Days, lateLast30Days } = fx.deliveryStats;
  if (deliveredLast30Days === 0) return 100;
  return Math.round(((deliveredLast30Days - lateLast30Days) / deliveredLast30Days) * 100);
}
