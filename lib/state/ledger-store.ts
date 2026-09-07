"use client";

import { useReducer } from "react";
import type { ActivityEvent } from "@/lib/fixture/types";
import {
  EMPTY_LEDGER_STATE,
  type LedgerAction,
  type LedgerState,
} from "./types";

let eventSeq = 0;
function nextEventId() {
  eventSeq += 1;
  return `overlay-event-${eventSeq}`;
}

const HISTORY_CAP = 20;

/** Prior-state snapshot pushed before every mutating action, so `undo` can
 * pop back to it. Excludes `history` itself — snapshots don't nest. */
function pushHistory(state: LedgerState): LedgerState[] {
  const snapshot: LedgerState = {
    matterOverlays: state.matterOverlays,
    availabilityRequested: state.availabilityRequested,
    appendedEvents: state.appendedEvents,
    history: [],
  };
  return [...state.history, snapshot].slice(-HISTORY_CAP);
}

function reducer(state: LedgerState, action: LedgerAction): LedgerState {
  switch (action.type) {
    case "undo": {
      if (state.history.length === 0) return state;
      const prior = state.history[state.history.length - 1];
      return { ...prior, history: state.history.slice(0, -1) };
    }
    case "chase": {
      const event: ActivityEvent = {
        id: nextEventId(),
        offsetMs: 0,
        kind: "chased",
        detail: action.matterLabel,
        matterId: action.matterId,
        lawyerId: null,
      };
      return {
        ...state,
        history: pushHistory(state),
        matterOverlays: {
          ...state.matterOverlays,
          [action.matterId]: { ...state.matterOverlays[action.matterId], chased: true },
        },
        appendedEvents: [event, ...state.appendedEvents],
      };
    }
    case "halt": {
      const event: ActivityEvent = {
        id: nextEventId(),
        offsetMs: 0,
        kind: "halted",
        detail: action.matterLabel,
        matterId: action.matterId,
        lawyerId: null,
      };
      return {
        ...state,
        history: pushHistory(state),
        matterOverlays: {
          ...state.matterOverlays,
          [action.matterId]: { ...state.matterOverlays[action.matterId], halted: true },
        },
        appendedEvents: [event, ...state.appendedEvents],
      };
    }
    case "expedite": {
      const event: ActivityEvent = {
        id: nextEventId(),
        offsetMs: 0,
        kind: "conflicts_expedited",
        detail: action.matterLabel,
        matterId: action.matterId,
        lawyerId: null,
      };
      return {
        ...state,
        history: pushHistory(state),
        matterOverlays: {
          ...state.matterOverlays,
          [action.matterId]: { ...state.matterOverlays[action.matterId], conflictsExpedited: true },
        },
        appendedEvents: [event, ...state.appendedEvents],
      };
    }
    case "escalate": {
      const event: ActivityEvent = {
        id: nextEventId(),
        offsetMs: 0,
        kind: "escalated",
        detail: action.matterLabel,
        matterId: action.matterId,
        lawyerId: null,
      };
      return {
        ...state,
        history: pushHistory(state),
        matterOverlays: {
          ...state.matterOverlays,
          [action.matterId]: { ...state.matterOverlays[action.matterId], escalated: true },
        },
        appendedEvents: [event, ...state.appendedEvents],
      };
    }
    case "reassign": {
      const event: ActivityEvent = {
        id: nextEventId(),
        offsetMs: 0,
        kind: "reassigned",
        detail: `${action.matterLabel} → ${action.toLawyerName}`,
        matterId: action.matterId,
        lawyerId: action.toLawyerId,
      };
      return {
        ...state,
        history: pushHistory(state),
        matterOverlays: {
          ...state.matterOverlays,
          [action.matterId]: {
            ...state.matterOverlays[action.matterId],
            reassignedToLawyerId: action.toLawyerId,
          },
        },
        appendedEvents: [event, ...state.appendedEvents],
      };
    }
    case "requestAvailability": {
      const event: ActivityEvent = {
        id: nextEventId(),
        offsetMs: 0,
        kind: "availability_requested",
        detail: action.lawyerName,
        matterId: null,
        lawyerId: action.lawyerId,
      };
      const next = new Set(state.availabilityRequested);
      next.add(action.lawyerId);
      return {
        ...state,
        history: pushHistory(state),
        availabilityRequested: next,
        appendedEvents: [event, ...state.appendedEvents],
      };
    }
    case "requestAvailabilityMany": {
      const events: ActivityEvent[] = action.lawyers.map(({ lawyerId, lawyerName }) => ({
        id: nextEventId(),
        offsetMs: 0,
        kind: "availability_requested",
        detail: lawyerName,
        matterId: null,
        lawyerId,
      }));
      const next = new Set(state.availabilityRequested);
      for (const { lawyerId } of action.lawyers) next.add(lawyerId);
      return {
        ...state,
        history: pushHistory(state),
        availabilityRequested: next,
        appendedEvents: [...events, ...state.appendedEvents],
      };
    }
    default:
      return state;
  }
}

export function useLedgerState() {
  return useReducer(reducer, EMPTY_LEDGER_STATE);
}
