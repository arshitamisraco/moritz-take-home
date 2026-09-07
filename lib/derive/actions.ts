import { HOUR } from "@/lib/fixture/clock";
import { unplacedReasonLabel } from "@/lib/format";
import type { EffectiveMatter } from "./apply-overlay";
import type { LawyerLoad } from "./bench";
import { isComplianceBreach, isOverdue, type AtRiskRow } from "./matters";
import type { LedgerAction } from "@/lib/state/types";

/**
 * actions — diagnosis picks the action.
 *
 * A generic "Move" on every row would be wrong five times out of six: on
 * the demo, reassignment is the right call for exactly one over-committed
 * lawyer. These derives resolve the two decision tables in the design doc
 * so the desktop and mobile surfaces render the same verb for the same
 * state. Generalizes the primaryAction() precedent in
 * components/mobile/attention-list.tsx.
 */

/** The activity log reads this exact shape — keep `name · client`. */
export function matterLabel(m: EffectiveMatter): string {
  return `${m.name} · ${m.client}`;
}

/** Too late to hand over: reassignment costs handover time, so a static
 * lock is the honest state once the deadline is this close. Same rule as
 * before — it now scopes a single matter rather than a whole lawyer row. */
const HANDOVER_CUTOFF_MS = 6 * HOUR;

/**
 * Movability is a matter-scoped fact: can this matter still be handed to
 * another lawyer for less than the handover costs? No once it's frozen
 * (`cannotExtend`), already overdue, or inside the 6h cutoff — the bench
 * panel then shows a "locked" label instead of a Reassign that would just
 * trade one fire for another.
 */
export function isMovable(m: EffectiveMatter): boolean {
  if (m.cannotExtend === true) return false;
  if (isOverdue(m)) return false;
  const off = m.deadlineOffsetMs;
  if (off !== null && off >= 0 && off <= HANDOVER_CUTOFF_MS) return false;
  return true;
}

export type UnassignedAction =
  | { kind: "assign"; label: string; suggestion: LawyerLoad | null }
  | { kind: "expedite"; label: string; action: LedgerAction }
  | { kind: "escalate"; label: string; action: LedgerAction };

/** The current card shows the same Reassign on every unplaced row, which
 * silently does nothing for the two that a headroom lawyer can't take.
 * Route by reason instead. */
export function unassignedAction(m: EffectiveMatter, room: LawyerLoad[]): UnassignedAction {
  const label = matterLabel(m);
  if (m.unplacedReason === "conflicts_pending") {
    return {
      kind: "expedite",
      label: "Expedite clearance",
      action: { type: "expedite", matterId: m.id, matterLabel: label },
    };
  }
  if (m.unplacedReason === "no_expertise_match") {
    return {
      kind: "escalate",
      // Only the UI string differs — the dispatched action, and so the
      // activity-log entry, stays a plain `escalate`.
      label: "Escalate to partner",
      action: { type: "escalate", matterId: m.id, matterLabel: label },
    };
  }
  // no_capacity (and the null fallback) — the one reason a reassign fits.
  return { kind: "assign", label: "Assign", suggestion: room[0] ?? null };
}

/** The blocker that precedes the button on an unplaced row: "Ready to
 * place" when a reassign fits, otherwise "Blocked · <reason>". Shared so
 * desktop and mobile state the same obstacle above the matter name. */
export function unassignedRowLabel(m: EffectiveMatter): string {
  if (unassignedAction(m, []).kind === "assign") return "Ready to place";
  return `Blocked · ${unplacedReasonLabel(m.unplacedReason)}`;
}

/** The ready/blocked split for the section subtitle — matters a reassign
 * can place vs. everything a named obstacle is holding — so the header
 * states the divide rather than implying every row is assignable. */
export function unassignedSummary(items: EffectiveMatter[]): { ready: number; blocked: number } {
  const ready = items.filter((m) => unassignedAction(m, []).kind === "assign").length;
  return { ready, blocked: items.length - ready };
}

export type MatterVerbKind = "reassign" | "assign" | "chase" | "expedite" | "halt" | "escalate";

export interface MatterActionItem {
  kind: MatterVerbKind;
  label: string;
  /** null for reassign/assign — the surface renders a candidate picker instead. */
  action: LedgerAction | null;
  destructive: boolean;
}

export interface MatterActionSet {
  /** The one verb the row leads with, chosen by bucket. */
  primary: MatterActionItem;
  /** primary's verb has already been taken — render a DoneMarker in its place. */
  primaryDone: boolean;
  /** Every other verb that still applies, in menu order; nothing already taken. */
  overflow: MatterActionItem[];
}

/** Past-tense marker shown in place of a verb once it has been used —
 * matches how DoneMarker already suppresses repeats. */
export const DONE_LABEL: Record<"chase" | "expedite" | "halt" | "escalate", string> = {
  chase: "chased",
  expedite: "expedited",
  halt: "halted",
  escalate: "escalated",
};

/**
 * matterAction — one primary verb per flagged matter, plus the overflow.
 * Generalizes the primaryAction() precedent from
 * components/mobile/attention-list.tsx so desktop and mobile derive the
 * same move for the same state. Primary by bucket: compliance → Expedite
 * clearance, overdue/next4h → Chase, today/thisWeek → Reassign when the
 * matter is still movable else Chase, an unplaced matter → Assign.
 * Overflow carries every remaining verb that applies; a verb already
 * taken (chased / halted / escalated / conflictsExpedited) is in neither
 * list.
 */
export function matterAction(row: AtRiskRow, candidates: LawyerLoad[]): MatterActionSet {
  const m = row.matter;
  const label = matterLabel(m);
  const mk = (
    kind: MatterVerbKind,
    lbl: string,
    action: LedgerAction | null,
    destructive = false
  ): MatterActionItem => ({ kind, label: lbl, action, destructive });

  const reassign = mk("reassign", "Reassign", null);
  const assign = mk("assign", "Assign", null);
  const chase = mk("chase", "Chase", { type: "chase", matterId: m.id, matterLabel: label });
  const expedite = mk("expedite", "Expedite clearance", {
    type: "expedite",
    matterId: m.id,
    matterLabel: label,
  });
  const halt = mk("halt", "Halt work", { type: "halt", matterId: m.id, matterLabel: label }, true);
  const escalate = mk(
    "escalate",
    "Escalate",
    { type: "escalate", matterId: m.id, matterLabel: label },
    true
  );

  let primary: MatterActionItem;
  if (row.bucket === "compliance" || isComplianceBreach(m)) {
    primary = expedite;
  } else if (m.effectiveLawyerId === null) {
    primary = assign;
  } else if (row.bucket === "overdue" || row.bucket === "next4h") {
    primary = chase;
  } else {
    primary = isMovable(m) ? reassign : chase;
  }

  const primaryDone =
    (primary.kind === "chase" && m.chased) ||
    (primary.kind === "expedite" && m.conflictsExpedited);

  const applies: Record<MatterVerbKind, boolean> = {
    reassign:
      primary.kind !== "reassign" && primary.kind !== "assign" && candidates.length > 0,
    assign: false,
    chase: m.effectiveLawyerId !== null && !m.chased,
    expedite: isComplianceBreach(m) && !m.conflictsExpedited,
    halt: !m.halted,
    escalate: !m.escalated,
  };

  const overflow = [reassign, chase, expedite, halt, escalate].filter(
    (it) => it.kind !== primary.kind && applies[it.kind]
  );

  return { primary, primaryDone, overflow };
}
