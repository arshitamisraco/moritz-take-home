import { DAY, HOUR } from "./clock";
import { demoFixture } from "./demo";
import { LAWYER_IDENTITIES } from "./lawyers";
import type { Fixture, Matter, MatterType } from "./types";

/**
 * Overflow state — the demo dataset stretched to 200+ matters, generated
 * programmatically rather than hand-authored, to prove the attention list
 * and bench hold up under volume rather than a curated 11.
 */

const TYPES: MatterType[] = [
  "incorporation",
  "safe",
  "financing",
  "msa",
  "employment",
  "option_grant",
  "filing",
];

const NAME_BY_TYPE: Record<MatterType, string> = {
  incorporation: "Incorporation",
  safe: "SAFE",
  financing: "Financing",
  msa: "MSA",
  employment: "Employment agmt",
  option_grant: "Option grant",
  filing: "83(b) filing",
};

const CLIENT_STEMS = [
  "Alder", "Birchwood", "Cassia", "Driftline", "Ember", "Fenwick", "Glasswing",
  "Hollow", "Ironvale", "Juniper", "Kettle", "Larkfield", "Millbrook", "Northgate",
  "Orbital", "Palisade", "Quarry", "Ridgeline", "Saltmarsh", "Timberline",
];
const CLIENT_SUFFIXES = ["Labs", "Robotics", "Bio", "Analytics", "Foods", "Grid", "Health", "Systems"];

function generateOverflowMatters(count: number): Matter[] {
  const out: Matter[] = [];
  for (let i = 0; i < count; i++) {
    const type = TYPES[i % TYPES.length];
    const client = `${CLIENT_STEMS[i % CLIENT_STEMS.length]} ${CLIENT_SUFFIXES[(i * 3) % CLIENT_SUFFIXES.length]} ${i}`;
    const lawyer = LAWYER_IDENTITIES[i % LAWYER_IDENTITIES.length];
    const bucket = i % 7;
    let deadlineKind: Matter["deadlineKind"] = null;
    let deadlineOffsetMs: number | null = null;
    if (bucket === 0) {
      deadlineKind = "promise";
      deadlineOffsetMs = -((i % 12) + 1) * HOUR; // overdue
    } else if (bucket === 1) {
      deadlineKind = "promise";
      deadlineOffsetMs = ((i % 4) + 1) * HOUR; // next 4 hours
    } else if (bucket === 2) {
      deadlineKind = "closing";
      deadlineOffsetMs = 6 * HOUR + (i % 6) * HOUR; // today
    } else if (bucket === 3) {
      deadlineKind = "statutory";
      deadlineOffsetMs = 2 * DAY + (i % 5) * DAY; // this week
    }
    out.push({
      id: `of-${i}`,
      name: NAME_BY_TYPE[type],
      client,
      type,
      price: 800 + (i % 20) * 350,
      lawyerId: bucket === 4 ? null : lawyer.id,
      status: "open",
      deadlineKind,
      deadlineOffsetMs,
      promisedAtOffsetMs: null,
      marginPct: 30 + ((i * 11) % 55),
      conflictsCleared: bucket !== 5,
      workStarted: bucket === 5,
      lastActivityOffsetMs: -((i % 96) + 1) * HOUR,
      unplacedReason: bucket === 4 ? (["no_capacity", "no_expertise_match", "conflicts_pending"] as const)[i % 3] : null,
      atRisk: bucket <= 3,
    });
  }
  return out;
}

export const overflowFixture: Fixture = {
  ...demoFixture,
  matters: [...demoFixture.matters, ...generateOverflowMatters(210)],
};
