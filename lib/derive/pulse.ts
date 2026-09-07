import { DAY, DEMO_NOW_MS, offsetToDate } from "@/lib/fixture/clock";
import type { ActivityEvent, ActivityKind } from "@/lib/fixture/types";

/**
 * The Firm Pulse section counts one thing: the four "healthy volume" event
 * kinds. Every number on screen — the headline total, the four tiles, the
 * per-day counts — is a count of PULSE_KINDS, so the tiles always sum to
 * the total and the log can never disagree with the tally the way the old
 * separately-authored fixtures did. Action events (chased, halted,
 * escalated, reassigned, …) are deliberately excluded, so dispatching an
 * action drops a row into today's group without moving any count.
 */
export const PULSE_KINDS = ["filing_sent", "meeting", "opened", "onboarding"] as const;
export type PulseKind = (typeof PULSE_KINDS)[number];

const PULSE_KIND_SET = new Set<ActivityKind>(PULSE_KINDS);
const WINDOW_MS = 7 * DAY;

export interface PulseWindow {
  total: number;
  byKind: Record<PulseKind, number>;
  prevTotal: number;
  /** Rounded % change of total vs the preceding 7-day window. */
  changePct: number;
}

/**
 * Window is the trailing 7 days from DEMO_NOW; the previous window is the 7
 * days before that. An event dispatched "now" (offsetMs 0) lands in the
 * current window — though no PULSE_KIND is ever appended by an action.
 */
export function pulseWindow(events: ActivityEvent[]): PulseWindow {
  const byKind: Record<PulseKind, number> = {
    filing_sent: 0,
    meeting: 0,
    opened: 0,
    onboarding: 0,
  };
  let total = 0;
  let prevTotal = 0;

  for (const e of events) {
    if (!PULSE_KIND_SET.has(e.kind)) continue;
    if (e.offsetMs > -WINDOW_MS) {
      total += 1;
      byKind[e.kind as PulseKind] += 1;
    } else if (e.offsetMs > -2 * WINDOW_MS) {
      prevTotal += 1;
    }
  }

  const changePct =
    prevTotal === 0 ? 0 : Math.round(((total - prevTotal) / prevTotal) * 100);
  return { total, byKind, prevTotal, changePct };
}

export interface DayActivity {
  /** Offset (ms from DEMO_NOW) of this day's 00:00 UTC. */
  offsetMs: number;
  /** Every kind of event that day, newest-first. */
  events: ActivityEvent[];
  /** Count restricted to PULSE_KINDS — the number shown on the day row. */
  pulseCount: number;
}

/** Newest day first, covering the displayed 7 days. Day groups carry all
 * event kinds; only pulseCount is restricted. */
export function groupByDay(events: ActivityEvent[]): DayActivity[] {
  const now = offsetToDate(0);
  const todayMidnightOffset =
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - DEMO_NOW_MS;

  const groups: DayActivity[] = [];
  for (let d = 0; d < 7; d++) {
    const dayStart = todayMidnightOffset - d * DAY;
    const dayEnd = dayStart + DAY;
    const inDay = events
      .filter((e) => e.offsetMs >= dayStart && e.offsetMs < dayEnd)
      .sort((a, b) => b.offsetMs - a.offsetMs);
    groups.push({
      offsetMs: dayStart,
      events: inDay,
      pulseCount: inDay.filter((e) => PULSE_KIND_SET.has(e.kind)).length,
    });
  }
  return groups;
}
