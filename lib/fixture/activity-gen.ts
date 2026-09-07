import { DAY, DEMO_NOW_MS, HOUR, offsetToDate } from "./clock";
import { LAWYER_IDENTITIES } from "./lawyers";
import type { ActivityEvent, ActivityKind, Matter } from "./types";

/**
 * Deterministic seeded activity generator. Follows the programmatic-fixture
 * pattern in ./overflow.ts — one fixed seed per dataset, no Math.random, so
 * the server (SSR) and the client resolve the identical stream and the Firm
 * Pulse section never hydrates to a number different from the one it
 * rendered.
 *
 * Covers 14 days back from DEMO_NOW: the trailing 7 the section displays,
 * plus the 7 before them that feed its "vs the previous 7 days" comparison.
 * Every string is composed from the dataset's own matters and the shared
 * LAWYER_IDENTITIES roster — no invented client names.
 */

/** 32-bit seeded PRNG — the same one the rest of the fixture layer leans on. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Demo runs the full vocabulary. */
export const ALL_ACTIVITY_KINDS: ActivityKind[] = [
  "opened",
  "conflicts_cleared",
  "filing_sent",
  "delivered",
  "meeting",
  "onboarding",
  "reassigned",
  "chased",
  "halted",
  "escalated",
  "conflicts_expedited",
  "availability_requested",
];

/** Good-day drops the three kinds that only happen when something has gone
 * wrong — a reassignment, a halt, an escalation. */
export const CALM_ACTIVITY_KINDS: ActivityKind[] = ALL_ACTIVITY_KINDS.filter(
  (k) => k !== "reassigned" && k !== "halted" && k !== "escalated"
);

const DAYS_BACK = 14;
const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 18;
const WEEKEND_RATE_FACTOR = 0.05;

interface GenerateArgs {
  seed: number;
  matters: Matter[];
  /** Mean events on a working day; weekends run at ~5% of this. */
  dailyRate: number;
  kinds: ActivityKind[];
}

function lawyerName(id: string | null): string {
  return LAWYER_IDENTITIES.find((l) => l.id === id)?.name ?? "co-counsel";
}

function composeDetail(kind: ActivityKind, matter: Matter, assignee: string): string {
  const m = `${matter.name} · ${matter.client}`;
  switch (kind) {
    case "filing_sent":
      return `83(b) · ${matter.client}`;
    case "meeting":
      return `Closing call · ${matter.client}`;
    case "onboarding":
      return `New client · ${matter.client}`;
    case "conflicts_cleared":
      return `Conflicts cleared · ${matter.client}`;
    case "conflicts_expedited":
      return `Conflicts expedited · ${matter.client}`;
    case "reassigned":
      return `${m} → ${assignee}`;
    case "availability_requested":
      return assignee;
    default:
      return m;
  }
}

export function generateActivity({
  seed,
  matters,
  dailyRate,
  kinds,
}: GenerateArgs): ActivityEvent[] {
  const rand = mulberry32(seed);
  const events: ActivityEvent[] = [];

  const now = offsetToDate(0);
  const todayMidnightOffset =
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - DEMO_NOW_MS;

  let seq = 0;
  for (let d = 0; d < DAYS_BACK; d++) {
    const dayStartOffset = todayMidnightOffset - d * DAY;
    const weekday = new Date(DEMO_NOW_MS + dayStartOffset).getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const rate = isWeekend ? dailyRate * WEEKEND_RATE_FACTOR : dailyRate;
    const count = Math.max(0, Math.round(rate * (0.8 + rand() * 0.4)));

    for (let i = 0; i < count; i++) {
      const hour =
        BUSINESS_START_HOUR + rand() * (BUSINESS_END_HOUR - BUSINESS_START_HOUR);
      const offsetMs = dayStartOffset + Math.round(hour * HOUR);
      // DEMO_NOW is itself mid-morning — today's later slots haven't happened.
      if (offsetMs >= 0) continue;

      const kind = kinds[Math.floor(rand() * kinds.length)];
      const matter = matters[Math.floor(rand() * matters.length)];
      const lawyerId =
        kind === "availability_requested" || kind === "reassigned"
          ? LAWYER_IDENTITIES[Math.floor(rand() * LAWYER_IDENTITIES.length)].id
          : matter.lawyerId;
      seq += 1;
      events.push({
        id: `gen-${seed}-${seq}`,
        offsetMs,
        kind,
        detail: composeDetail(kind, matter, lawyerName(lawyerId)),
        matterId: kind === "availability_requested" ? null : matter.id,
        lawyerId,
      });
    }
  }

  // Newest-first, matching the hand-authored arrays this replaces.
  events.sort((a, b) => b.offsetMs - a.offsetMs);
  return events;
}
