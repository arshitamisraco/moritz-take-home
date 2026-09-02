import type { ActivityEvent } from "@/lib/fixture/types";

export interface MatterOverlay {
  chased?: boolean;
  halted?: boolean;
  escalated?: boolean;
  conflictsExpedited?: boolean;
  /** Set by `reassign` — the matter's lawyer as chosen by ops. */
  reassignedToLawyerId?: string;
}

export interface LedgerState {
  matterOverlays: Record<string, MatterOverlay>;
  /** Lawyer ids whose availability has been requested this session. */
  availabilityRequested: Set<string>;
  /** Events appended by actions, newest first. */
  appendedEvents: ActivityEvent[];
}

export type LedgerAction =
  | { type: "chase"; matterId: string; matterLabel: string }
  | { type: "halt"; matterId: string; matterLabel: string }
  | { type: "expedite"; matterId: string; matterLabel: string }
  | { type: "escalate"; matterId: string; matterLabel: string }
  | { type: "reassign"; matterId: string; matterLabel: string; toLawyerId: string; toLawyerName: string }
  | { type: "requestAvailability"; lawyerId: string; lawyerName: string };

export const EMPTY_LEDGER_STATE: LedgerState = {
  matterOverlays: {},
  availabilityRequested: new Set(),
  appendedEvents: [],
};
