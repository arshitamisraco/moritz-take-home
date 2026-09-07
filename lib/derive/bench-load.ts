import { clockTime, dayLabel } from "@/lib/format";
import type { EffectiveFixture, EffectiveLawyer, EffectiveMatter } from "./apply-overlay";
import { isMovable } from "./actions";
import { headroom, overCommitted } from "./bench";
import { atRiskRows, isOverdue } from "./matters";

/**
 * bench-load — capacity and deadline as one object.
 *
 * The old Workload card kept lawyer capacity and matter deadlines in
 * columns that never touched, so the admin had to join four statistics in
 * their head. A BenchRow is that join done once: an over-committed lawyer,
 * the matters they hold ranked by how soon they are due, and one derived
 * sentence. Everything here is composed from existing rules
 * (overCommitted / atRiskRows / isOverdue / headroom) — no new facts.
 */

export type DeadlinePressure = "overdue" | "today" | "later" | "none";

const PRESSURE_RANK: Record<DeadlinePressure, number> = {
  overdue: 3,
  today: 2,
  later: 1,
  none: 0,
};

export interface BenchMatter {
  matter: EffectiveMatter;
  pressure: DeadlinePressure;
  /** Can still be handed over for less than the handover costs — drives
   * Reassign vs. a static "locked" label in the expanded panel. */
  movable: boolean;
}

export interface BenchRow {
  lawyer: EffectiveLawyer;
  committed: number;
  declared: number;
  /** committed − declared, always ≥ 1 for a bench row. */
  over: number;
  /** The lawyer's open matters, soonest deadline first. */
  matters: BenchMatter[];
  /** One entry per committed matter for the meter — a `cannotExtend`
   * matter renders as `overdue` (the accent), the rest by their real
   * bucket, then padded with `none` up to the committed count. */
  segments: DeadlinePressure[];
  worst: DeadlinePressure;
  /** Carries a `cannotExtend` matter — kept for the row to surface, no
   * longer a sort key ("can't be fixed here" ≠ "most urgent"). */
  irreversible: boolean;
  /** How many of `matters` still offer a Reassign, and how many are locked. */
  movable: number;
  locked: number;
  /** A sticky row for a lawyer who dropped back inside capacity mid-session
   * — held in place so their panel doesn't vanish under an open reassign. */
  resolved: boolean;
  /** "Overloaded by 1 matter · 83(b) filing · due 17:00 · statutory" —
   * composed, never typed per row. Gains " · nothing movable" only when
   * every held matter is locked. */
  headline: string;
}

function pressureOf(m: EffectiveMatter): DeadlinePressure {
  if (m.deadlineOffsetMs === null) return "none";
  if (isOverdue(m)) return "overdue";
  // Past due but halted — paused work carries no live pressure.
  if (m.deadlineOffsetMs < 0) return "none";
  return dayLabel(m.deadlineOffsetMs) === "today" ? "today" : "later";
}

function bySoonest(a: BenchMatter, b: BenchMatter): number {
  const ao = a.matter.deadlineOffsetMs;
  const bo = b.matter.deadlineOffsetMs;
  if (ao === null && bo === null) return 0;
  if (ao === null) return 1;
  if (bo === null) return -1;
  return ao - bo;
}

function segmentsFor(matters: BenchMatter[], committed: number): DeadlinePressure[] {
  const seg: DeadlinePressure[] = matters
    .slice(0, Math.max(committed, 0))
    .map((x) => (x.matter.cannotExtend ? "overdue" : x.pressure));
  while (seg.length < committed) seg.push("none");
  return seg;
}

function headlineFor(over: number, matters: BenchMatter[]): string {
  const base = `Overloaded by ${over} matter${over === 1 ? "" : "s"}`;
  // Only when opening the row is a dead end — on a normal row this is the
  // expected case and saying it is noise.
  const tail =
    matters.length > 0 && matters.every((x) => !x.movable) ? " · nothing movable" : "";
  const soonest = matters[0]?.matter;
  if (!soonest || soonest.deadlineOffsetMs === null) return base + tail;
  const day = dayLabel(soonest.deadlineOffsetMs);
  const time = clockTime(soonest.deadlineOffsetMs);
  const when =
    soonest.deadlineOffsetMs < 0
      ? `overdue since ${day} ${time}`
      : day === "today"
        ? `due ${time}`
        : `due ${day} ${time}`;
  const kind =
    soonest.deadlineKind === "statutory" || soonest.deadlineKind === "closing"
      ? ` · ${soonest.deadlineKind}`
      : "";
  return `${base} · ${soonest.name} · ${when}${kind}${tail}`;
}

/** Over-committed lawyers only, ranked by deadline primacy so the card
 * still answers "looming deadlines at a glance": worst bucket → overage →
 * movable count → name. No cap — the bench is bounded by the 38-person
 * roster, and percent-ranking with a slice is exactly the truncation bug
 * this replaces.
 *
 * `sticky` (owned by the caller) keeps a lawyer's row on the card after a
 * reassign from their open panel drops them back inside capacity: they
 * re-emit as a `resolved` row that sorts last, rather than vanishing with
 * the panel open. */
export function benchRows(fx: EffectiveFixture, sticky?: ReadonlySet<string>): BenchRow[] {
  const held = new Map<string, EffectiveMatter[]>();
  for (const m of fx.matters) {
    if (m.status !== "open" || !m.effectiveLawyerId) continue;
    const list = held.get(m.effectiveLawyerId);
    if (list) list.push(m);
    else held.set(m.effectiveLawyerId, [m]);
  }

  const build = (lawyer: EffectiveLawyer, resolved: boolean): BenchRow => {
    const committed = lawyer.committedMatters;
    const declared = lawyer.declaredAvailability as number;
    const matters: BenchMatter[] = (held.get(lawyer.id) ?? [])
      .map((matter) => ({ matter, pressure: pressureOf(matter), movable: isMovable(matter) }))
      .sort(bySoonest);
    const worst = matters.reduce<DeadlinePressure>(
      (w, x) => (PRESSURE_RANK[x.pressure] > PRESSURE_RANK[w] ? x.pressure : w),
      "none"
    );
    const movable = matters.filter((x) => x.movable).length;
    const over = committed - declared;
    return {
      lawyer,
      committed,
      declared,
      over,
      matters,
      segments: segmentsFor(matters, committed),
      worst,
      irreversible: matters.some((x) => x.matter.cannotExtend === true),
      movable,
      locked: matters.length - movable,
      resolved,
      headline: resolved ? "Now within declared capacity" : headlineFor(over, matters),
    };
  };

  const over = overCommitted(fx);
  const overIds = new Set(over.map((o) => o.lawyer.id));
  const rows = over.map(({ lawyer }) => build(lawyer, false));

  if (sticky) {
    for (const id of sticky) {
      if (overIds.has(id)) continue;
      const lawyer = fx.lawyers.find((l) => l.id === id);
      if (lawyer) rows.push(build(lawyer, true));
    }
  }

  return rows.sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    if (PRESSURE_RANK[a.worst] !== PRESSURE_RANK[b.worst]) {
      return PRESSURE_RANK[b.worst] - PRESSURE_RANK[a.worst];
    }
    if (a.over !== b.over) return b.over - a.over;
    if (a.movable !== b.movable) return b.movable - a.movable;
    return a.lawyer.name.localeCompare(b.lawyer.name);
  });
}

/** The one derived sentence the card leads with — capacity and deadline
 * stated as a single fact. Carries the whole card on a quiet day. Split
 * into a `lead` clause (the verdict itself) and a `room` clause (spare
 * capacity elsewhere) so the two can render at different type weights. */
export function workloadVerdictParts(fx: EffectiveFixture): { lead: string; room: string | null } {
  const over = overCommitted(fx);
  const room = headroom(fx);
  const roomSum = room.reduce((s, r) => s + r.spare, 0);

  const sameDay = atRiskRows(fx).filter(
    (r) => r.bucket === "overdue" || r.bucket === "next4h" || r.bucket === "today"
  );
  const overIds = new Set(over.map((o) => o.lawyer.id));
  const n = sameDay.length;
  const m = sameDay.filter(
    (r) => r.matter.effectiveLawyerId && overIds.has(r.matter.effectiveLawyerId)
  ).length;

  const roomClause =
    room.length > 0
      ? `${room.length}${over.length > 0 ? " others" : ""} ${
          room.length === 1 ? "has" : "have"
        } room for ${roomSum} more.`
      : null;

  if (n === 0) {
    const lead =
      over.length === 0
        ? "Every lawyer is inside their declared capacity."
        : `No deadlines are due today or overdue. ${over.length} ${
            over.length === 1 ? "lawyer is" : "lawyers are"
          } over declared capacity.`;
    return { lead, room: roomClause };
  }

  let lead: string;
  if (m === n) {
    lead =
      n === 1
        ? "The one deadline due today or overdue sits with a lawyer already over capacity."
        : `All ${n} deadlines due today or overdue sit with lawyers already over capacity.`;
  } else if (m > 0) {
    lead = `${m} of ${n} deadlines due today or overdue sit with lawyers already over capacity.`;
  } else {
    lead = `${n} deadline${n === 1 ? " is" : "s are"} due today or overdue.`;
  }
  return { lead, room: roomClause };
}
