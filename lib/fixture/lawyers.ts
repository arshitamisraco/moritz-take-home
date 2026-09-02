import type { Lawyer, Office } from "./types";

/**
 * 38 contracted co-counsel lawyers, one identity roster shared by every
 * dataset — the bench is the same 38 people on a good day and a bad one,
 * only their committed / declared load changes. The 15 lawyers named in
 * the source data keep those names; the remaining 23 "within range" seats
 * are never rendered by name on any screen, so they're filled with
 * plausible names for type-safety and never referenced beyond that.
 */

interface Identity {
  id: string;
  name: string;
  office: Office;
}

const NAMED: Identity[] = [
  // over committed (demo)
  { id: "priya-chandra", name: "Priya Chandra", office: "London" },
  { id: "erik-solberg", name: "Erik Solberg", office: "Oslo" },
  { id: "james-okafor", name: "James Okafor", office: "SF" },
  { id: "marcus-webb", name: "Marcus Webb", office: "SF" },
  { id: "sofia-lindqvist", name: "Sofia Lindqvist", office: "Oslo" },
  { id: "elena-kowalski", name: "Elena Kowalski", office: "London" },
  // headroom (demo)
  { id: "ingrid-haugen", name: "Ingrid Haugen", office: "Oslo" },
  { id: "anna-reyes", name: "Anna Reyes", office: "Oslo" },
  { id: "tom-bakke", name: "Tom Bakke", office: "London" },
  { id: "david-chen", name: "David Chen", office: "SF" },
  // undeclared (demo)
  { id: "henrik-vold", name: "Henrik Vold", office: "Oslo" },
  { id: "sarah-mensah", name: "Sarah Mensah", office: "London" },
  { id: "yusuf-demir", name: "Yusuf Demir", office: "SF" },
  { id: "kari-lindstrom", name: "Kari Lindstrøm", office: "Oslo" },
  { id: "michael-torres", name: "Michael Torres", office: "SF" },
];

const FILLER_FIRST = [
  "Astrid",
  "Ben",
  "Camille",
  "Dag",
  "Efe",
  "Freya",
  "Gustav",
  "Hana",
  "Ines",
  "Jonas",
  "Kwame",
  "Liv",
  "Mateo",
  "Nora",
  "Oskar",
  "Petra",
  "Quinn",
  "Runa",
  "Silje",
  "Theo",
  "Uma",
  "Viggo",
  "Wren",
];

const FILLER_LAST = [
  "Berg",
  "Fossum",
  "Nyland",
  "Skog",
  "Aas",
  "Lund",
  "Voss",
  "Dahl",
  "Rein",
  "Moe",
  "Strand",
  "Holt",
  "Vik",
  "Sund",
  "Ravn",
  "Krogh",
  "Lie",
  "Bakken",
  "Fjeld",
  "Sæther",
  "Aune",
  "Roth",
  "Kass",
];

const FILLER_OFFICES: Office[] = ["Oslo", "London", "SF"];

const FILLER: Identity[] = FILLER_FIRST.map((first, i) => ({
  id: `bench-${i + 1}`,
  name: `${first} ${FILLER_LAST[i]}`,
  office: FILLER_OFFICES[i % FILLER_OFFICES.length],
}));

export const LAWYER_IDENTITIES: Identity[] = [...NAMED, ...FILLER];

type Load = { committed: number; declared: number | null };

/**
 * Demo-day load: 6 over committed, 4 headroom, 5 undeclared, 23 within
 * range — reconciles to 6 + 4 + 5 + 23 = 38.
 */
const DEMO_LOAD: Record<string, Load> = {
  "priya-chandra": { committed: 5, declared: 3 },
  "erik-solberg": { committed: 5, declared: 4 },
  "james-okafor": { committed: 4, declared: 3 },
  "marcus-webb": { committed: 4, declared: 3 },
  "sofia-lindqvist": { committed: 4, declared: 3 },
  "elena-kowalski": { committed: 4, declared: 3 },
  "ingrid-haugen": { committed: 1, declared: 4 },
  "anna-reyes": { committed: 0, declared: 2 },
  "tom-bakke": { committed: 1, declared: 3 },
  "david-chen": { committed: 1, declared: 3 },
  "henrik-vold": { committed: 2, declared: null },
  "sarah-mensah": { committed: 3, declared: null },
  "yusuf-demir": { committed: 2, declared: null },
  "kari-lindstrom": { committed: 1, declared: null },
  "michael-torres": { committed: 3, declared: null },
};

/**
 * Good-day load: 1 over committed (Priya 4/3), 11 headroom, 0 undeclared,
 * the rest within range. Reuses the same 38 identities — the bench
 * doesn't change, the week does.
 */
const GOOD_DAY_LOAD: Record<string, Load> = {
  "priya-chandra": { committed: 4, declared: 3 },
  "erik-solberg": { committed: 2, declared: 3 },
  "james-okafor": { committed: 2, declared: 3 },
  "marcus-webb": { committed: 3, declared: 3 },
  "sofia-lindqvist": { committed: 3, declared: 3 },
  "elena-kowalski": { committed: 2, declared: 3 },
  "ingrid-haugen": { committed: 1, declared: 4 },
  "anna-reyes": { committed: 0, declared: 2 },
  "tom-bakke": { committed: 1, declared: 3 },
  "david-chen": { committed: 1, declared: 3 },
  "henrik-vold": { committed: 1, declared: 3 },
  "sarah-mensah": { committed: 1, declared: 3 },
  "yusuf-demir": { committed: 1, declared: 3 },
  "kari-lindstrom": { committed: 2, declared: 4 },
  "michael-torres": { committed: 1, declared: 3 },
  "bench-1": { committed: 1, declared: 3 },
  "bench-2": { committed: 0, declared: 2 },
};

function withinRangeLoad(seed: number): Load {
  // committed <= declared, less than 2 spare — deterministic per lawyer so
  // the fixture is stable across renders.
  const committed = (seed % 3) + 1; // 1..3
  const spare = seed % 2; // 0 or 1
  return { committed, declared: committed + spare };
}

function buildLawyers(load: Record<string, Load>): Lawyer[] {
  return LAWYER_IDENTITIES.map((identity, i) => {
    const l = load[identity.id] ?? withinRangeLoad(i);
    return {
      id: identity.id,
      name: identity.name,
      office: identity.office,
      committedMatters: l.committed,
      declaredAvailability: l.declared,
    };
  });
}

export function buildDemoLawyers(): Lawyer[] {
  return buildLawyers(DEMO_LOAD);
}

export function buildGoodDayLawyers(): Lawyer[] {
  return buildLawyers(GOOD_DAY_LOAD);
}
