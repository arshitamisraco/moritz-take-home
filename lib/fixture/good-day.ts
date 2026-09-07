import { CALM_ACTIVITY_KINDS, generateActivity } from "./activity-gen";
import { HOUR } from "./clock";
import { demoFixture } from "./demo";
import { buildGoodDayLawyers } from "./lawyers";
import type { Fixture, Matter, MatterType } from "./types";

/**
 * Dataset B — the good day. Same shape, quiet values: zero at risk, zero
 * unplaced, zero compliance flags. This doubles as the empty state — the
 * attention zone reports rather than celebrates, and still carries the
 * next deadline as context so the zone isn't wasted space.
 */

const NAMED_OPEN: Array<{
  id: string;
  name: string;
  client: string;
  type: MatterType;
  price: number;
  lawyerId: string;
  marginPct: number;
}> = [
  { id: "gd-kestrel-series-a", name: "Series A", client: "Kestrel Bio", type: "financing", price: 12000, lawyerId: "sofia-lindqvist", marginPct: 67 },
  { id: "gd-summit-incorporation", name: "Incorporation", client: "Summit Robotics", type: "incorporation", price: 2200, lawyerId: "anna-reyes", marginPct: 64 },
  { id: "gd-borealis-msa", name: "MSA", client: "Borealis Tech", type: "msa", price: 3200, lawyerId: "yusuf-demir", marginPct: 52 },
  { id: "gd-tidewater-safe", name: "SAFE", client: "Tidewater", type: "safe", price: 1500, lawyerId: "sarah-mensah", marginPct: 71 },
  { id: "gd-halcyon-employment", name: "Employment agmt", client: "Halcyon AI", type: "employment", price: 1100, lawyerId: "david-chen", marginPct: 68 },
];

const FILLER_CLIENTS = [
  "Larkspur Systems", "Amberline Foods", "Cobalt Robotics", "Windward Bio",
  "Talon Analytics", "Fernbrook Health", "Cinder Networks", "Marrow Data",
  "Halcyon Freight", "Thistle Devices", "Aldergate Capital", "Pinewell AI",
  "Grayling Foods", "Verdant Systems", "Northcairn Bio", "Lumen Grid",
  "Osprey Robotics",
];
const FILLER_TYPES: MatterType[] = [
  "incorporation", "safe", "msa", "employment", "option_grant", "financing",
];
const FILLER_LAWYERS = [
  "erik-solberg", "james-okafor", "marcus-webb", "elena-kowalski",
  "ingrid-haugen", "tom-bakke", "henrik-vold", "kari-lindstrom",
  "michael-torres", "bench-1", "bench-2", "bench-3",
];

function fillerMatters(): Matter[] {
  return FILLER_CLIENTS.map((client, i) => {
    const type = FILLER_TYPES[i % FILLER_TYPES.length];
    const nameByType: Record<MatterType, string> = {
      incorporation: "Incorporation",
      safe: "SAFE",
      msa: "MSA",
      employment: "Employment agmt",
      option_grant: "Option grant",
      financing: "Financing",
      filing: "Filing",
    };
    return {
      id: `gd-filler-${i + 1}`,
      name: nameByType[type],
      client,
      type,
      price: 1200 + i * 400,
      lawyerId: FILLER_LAWYERS[i % FILLER_LAWYERS.length],
      status: "open",
      deadlineKind: null,
      deadlineOffsetMs: null,
      promisedAtOffsetMs: null,
      marginPct: 52 + ((i * 7) % 25),
      conflictsCleared: true,
      workStarted: true,
      // capped well under the stall threshold — a good day has nothing stalled
      lastActivityOffsetMs: -((i % 8) + 1) * 6 * HOUR,
      unplacedReason: null,
      atRisk: false,
    } satisfies Matter;
  });
}

const GOOD_DAY_MATTERS: Matter[] = [
  // the one near-term deadline — "Next due" in the empty attention state,
  // well inside its promised window.
  {
    id: NAMED_OPEN[0].id,
    name: NAMED_OPEN[0].name,
    client: NAMED_OPEN[0].client,
    type: NAMED_OPEN[0].type,
    price: NAMED_OPEN[0].price,
    lawyerId: NAMED_OPEN[0].lawyerId,
    status: "open",
    deadlineKind: "closing",
    deadlineOffsetMs: 32 * HOUR, // tomorrow 18:00
    promisedAtOffsetMs: null,
    marginPct: NAMED_OPEN[0].marginPct,
    conflictsCleared: true,
    workStarted: true,
    lastActivityOffsetMs: -3 * HOUR,
    unplacedReason: null,
    atRisk: false,
  },
  ...NAMED_OPEN.slice(1).map(
    (m): Matter => ({
      id: m.id,
      name: m.name,
      client: m.client,
      type: m.type,
      price: m.price,
      lawyerId: m.lawyerId,
      status: "open",
      deadlineKind: null,
      deadlineOffsetMs: null,
      promisedAtOffsetMs: null,
      marginPct: m.marginPct,
      conflictsCleared: true,
      workStarted: true,
      lastActivityOffsetMs: -4 * HOUR,
      unplacedReason: null,
      atRisk: false,
    })
  ),
  ...fillerMatters(),
  // a few recently delivered, on time, to keep the activity feed honest
  {
    id: "gd-delivered-1",
    name: "SAFE",
    client: "Northlight Devices",
    type: "safe",
    price: 1500,
    lawyerId: "ingrid-haugen",
    status: "delivered_on_time",
    deadlineKind: null,
    deadlineOffsetMs: null,
    promisedAtOffsetMs: null,
    marginPct: 71,
    conflictsCleared: true,
    workStarted: true,
    lastActivityOffsetMs: -25 * 60_000,
    unplacedReason: null,
    atRisk: false,
  },
];

export const goodDayFixture: Fixture = {
  lawyers: buildGoodDayLawyers(),
  matters: GOOD_DAY_MATTERS,
  // Quieter volume, and none of the went-wrong event kinds — see
  // CALM_ACTIVITY_KINDS. Same derived-from-one-stream contract as demo.
  activity: generateActivity({
    seed: 0x600d_b,
    matters: GOOD_DAY_MATTERS,
    dailyRate: 24,
    kinds: CALM_ACTIVITY_KINDS,
  }),
  deliveryStats: { deliveredLast30Days: 150, lateLast30Days: 1 },
  marginByType: {
    safe: 73,
    employment: 70,
    incorporation: 66,
    option_grant: 62,
    msa: 55,
    financing: 47,
    filing: 82,
  },
  revenueByMonth: [
    { label: "Mar", amountUsd: 458_000, marginPct: 68 },
    { label: "Apr", amountUsd: 470_000, marginPct: 68 },
    { label: "May", amountUsd: 462_000, marginPct: 69 },
    { label: "Jun", amountUsd: 488_000, marginPct: 69 },
    { label: "Jul", amountUsd: 475_000, marginPct: 69 },
    { label: "Aug", amountUsd: 430_000, marginPct: 69 },
  ],
  revenueTargetUsd: demoFixture.revenueTargetUsd,
  realizedMarginPct: 69,
  quotedMarginPct: 68,
  marginTargetPct: 65,
  onTimeTargetPct: 98,
};
