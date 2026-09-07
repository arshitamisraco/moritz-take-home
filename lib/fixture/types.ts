/**
 * Fixture types — the single source of truth. Nothing on screen is typed
 * in; everything is either raw data here or derived from it in lib/derive.
 */

export type Office = "Oslo" | "London" | "SF";

export interface Lawyer {
  id: string;
  name: string;
  office: Office;
  committedMatters: number;
  /** null = hasn't declared availability this week. */
  declaredAvailability: number | null;
}

export type MatterType =
  | "incorporation"
  | "safe"
  | "financing"
  | "msa"
  | "employment"
  | "option_grant"
  | "filing";

export type MatterStatus = "open" | "delivered_on_time" | "delivered_late";

export type DeadlineKind = "statutory" | "closing" | "promise" | null;

export type UnplacedReason =
  | "no_capacity"
  | "no_expertise_match"
  | "conflicts_pending"
  | null;

export interface Matter {
  id: string;
  name: string;
  client: string;
  type: MatterType;
  price: number;
  lawyerId: string | null;
  status: MatterStatus;
  deadlineKind: DeadlineKind;
  /** Offset from DEMO_NOW in ms. null = no deadline (e.g. a compliance breach). */
  deadlineOffsetMs: number | null;
  /** For promise-kind matters: when the promise was made, offset from DEMO_NOW. */
  promisedAtOffsetMs: number | null;
  marginPct: number;
  conflictsCleared: boolean;
  /** Work has started on the matter — needed to evaluate the compliance-breach rule. */
  workStarted: boolean;
  /** Offset from DEMO_NOW in ms — used for the "stalled" straining condition. */
  lastActivityOffsetMs: number;
  unplacedReason: UnplacedReason;
  /** A statutory deadline that cannot be pushed, e.g. an 83(b) filing window. */
  cannotExtend?: boolean;
  /**
   * Ops has flagged this matter as needing attention. Having a deadline
   * within the week doesn't by itself make a matter "at risk" — Dataset B
   * carries a next-due pointer with a real deadline and zero at-risk rows,
   * so inclusion in the attention list is its own fixture-authored fact,
   * not something inferred from the countdown alone. Compliance breaches
   * and overdue matters are always at risk regardless of this flag.
   */
  atRisk: boolean;
}

export type ActivityKind =
  | "opened"
  | "conflicts_cleared"
  | "filing_sent"
  | "delivered"
  | "meeting"
  | "onboarding"
  | "reassigned"
  | "chased"
  | "halted"
  | "escalated"
  | "conflicts_expedited"
  | "availability_requested";

export interface ActivityEvent {
  id: string;
  /** Offset from DEMO_NOW in ms — negative is in the past. */
  offsetMs: number;
  kind: ActivityKind;
  detail: string;
  matterId: string | null;
  lawyerId: string | null;
}

export interface DeliveryStats {
  deliveredLast30Days: number;
  lateLast30Days: number;
}

export type MarginByType = Record<MatterType, number>;

export interface RevenueMonth {
  label: string;
  amountUsd: number;
  marginPct: number;
}

export interface Fixture {
  lawyers: Lawyer[];
  matters: Matter[];
  activity: ActivityEvent[];
  deliveryStats: DeliveryStats;
  marginByType: MarginByType;
  revenueByMonth: RevenueMonth[];
  revenueTargetUsd: number;
  realizedMarginPct: number;
  quotedMarginPct: number;
  marginTargetPct: number;
  onTimeTargetPct: number;
}
