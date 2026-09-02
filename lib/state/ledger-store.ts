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

function reducer(state: LedgerState, action: LedgerAction): LedgerState {
  switch (action.type) {
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
        availabilityRequested: next,
        appendedEvents: [event, ...state.appendedEvents],
      };
    }
    default:
      return state;
  }
}

export function useLedgerState() {
  return useReducer(reducer, EMPTY_LEDGER_STATE);
}
