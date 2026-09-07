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

/**
 * A verb has been spent on this matter, so it is no longer an open
 * exception: it leaves the attention queue and stops feeding the pillar
 * rules. Before this existed, every action was cosmetic — `expedite` set
 * an overlay flag that nothing downstream read, so the alert it cleared
 * stayed on screen, the health pillar stayed Breaking, and the only
 * visible result was a button turning into the word "expedited".
 *
 * The rule is deliberately blunt: one action per matter is the decision.
 * Chasing an overdue matter does not make it un-overdue in the world, but
 * it does move it off the admin's desk, which is what this queue tracks.
 * Generalizes the `!m.halted` gate the deadline predicates already ran.
 */
export function isHandled(m: EffectiveMatter): boolean {
  return (
    m.chased ||
    m.halted ||
    m.escalated ||
    m.conflictsExpedited ||
    m.effectiveLawyerId !== m.lawyerId
  );
}

export function isComplianceBreach(m: EffectiveMatter): boolean {
  return !m.conflictsCleared && m.workStarted && !m.conflictsExpedited;
}

/** A handled matter's deadline pressure is struck through — paused,
 * chased or reassigned work doesn't accrue as overdue or stalled. */
export function isOverdue(m: EffectiveMatter): boolean {
  return (
    m.status === "open" &&
    !isHandled(m) &&
    m.deadlineOffsetMs !== null &&
    m.deadlineOffsetMs < 0
  );
}

export function isStalled(m: EffectiveMatter, stallThresholdMs: number): boolean {
  return m.status === "open" && !isHandled(m) && m.lastActivityOffsetMs < -stallThresholdMs;
}

export function isInFinalWindow(m: EffectiveMatter): boolean {
  return (
    m.status === "open" &&
    !isHandled(m) &&
    m.deadlineOffsetMs !== null &&
    m.deadlineOffsetMs >= 0 &&
    m.deadlineOffsetMs <= NEXT_WINDOW_MS
  );
}

export function bucketFor(m: EffectiveMatter): TimeBucket | null {
  if (isHandled(m)) return null;
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

/**
 * The threshold that decides what "needs attention" actually means.
 *
 * At risk is not the same as act now: on the demo, 11 of 20 matters carry
 * some risk flag, and a list of 11 reads as a backlog, not an exception
 * queue. Act-now is the subset that can still become irreversible before
 * the end of the day — a compliance breach (work running without cleared
 * conflicts is a live exposure, not a deadline), anything already overdue,
 * anything inside the final window, and a same-day deadline only when it
 * is statutory and so cannot be extended. An ordinary same-day promise is
 * not yet irreversible, so it waits below the line.
 *
 * Everything else is the watch tier: real, but nothing breaks today.
 */
export function isActNow(row: AtRiskRow): boolean {
  return (
    row.bucket === "compliance" ||
    row.bucket === "overdue" ||
    row.bucket === "next4h" ||
    (row.bucket === "today" && row.matter.cannotExtend === true)
  );
}

/** The act-now tier, in atRiskRows order. The alert always spotlights the
 * first row — the single most urgent matter, not a page through the set. */
export function actNowRows(rows: AtRiskRow[]): AtRiskRow[] {
  return rows.filter(isActNow);
}

/** How many rows sit in each bucket — passed to a truncated list so its
 * group headers state the tier's real totals, not the slice's. */
export function bucketCounts(rows: AtRiskRow[]): Partial<Record<TimeBucket, number>> {
  return rows.reduce<Partial<Record<TimeBucket, number>>>((acc, row) => {
    acc[row.bucket] = (acc[row.bucket] ?? 0) + 1;
    return acc;
  }, {});
}

const BUCKET_ORDER: TimeBucket[] = ["compliance", "overdue", "next4h", "today", "thisWeek"];
const BUCKET_SUMMARY_LABEL: Record<TimeBucket, string> = {
  compliance: "compliance",
  overdue: "overdue",
  next4h: "next 4h",
  today: "today",
  thisWeek: "this week",
};

/** The line above the at-risk table — every bucket that's holding
 * something, in table order, so desktop and mobile print identical
 * numbers. */
export function atRiskSummary(rows: AtRiskRow[]): string {
  const counts = bucketCounts(rows);
  return BUCKET_ORDER.filter((b) => (counts[b] ?? 0) > 0)
    .map((b) => `${counts[b]} ${BUCKET_SUMMARY_LABEL[b]}`)
    .join(" · ");
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

/**
 * Elapsed against the promised window, as a percentage — 100 means the SLA
 * is spent, >100 means it's blown. null for non-promise matters or ones
 * without a recorded promise time. The single source for both the "72h
 * against 48h promised" copy and any visual severity keyed off it.
 */
export function promiseClockPct(m: EffectiveMatter): number | null {
  if (m.deadlineKind !== "promise" || m.promisedAtOffsetMs === null || m.deadlineOffsetMs === null) {
    return null;
  }
  const elapsed = -m.promisedAtOffsetMs;
  const total = m.deadlineOffsetMs - m.promisedAtOffsetMs;
  return Math.round((elapsed / total) * 100);
}

export function onTimeRatePct(fx: EffectiveFixture): number {
  const { deliveredLast30Days, lateLast30Days } = fx.deliveryStats;
  if (deliveredLast30Days === 0) return 100;
  return Math.round(((deliveredLast30Days - lateLast30Days) / deliveredLast30Days) * 100);
}
