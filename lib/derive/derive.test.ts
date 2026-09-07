import { describe, expect, it } from "vitest";
import { demoFixture, goodDayFixture, overflowFixture } from "@/lib/fixture";
import { applyOverlay } from "@/lib/derive/apply-overlay";
import { EMPTY_LEDGER_STATE, type LedgerState } from "@/lib/state/types";
import { healthPillar, workloadPillar, financialPillar } from "@/lib/derive/pillars";
import {
  actNowRows,
  atRiskRows,
  bucketFor,
  exceptionQueue,
  isActNow,
  isHandled,
  type TimeBucket,
} from "@/lib/derive/matters";
import { matterAction, unassignedAction } from "@/lib/derive/actions";
import { headroom, overCommitted } from "@/lib/derive/bench";
import { benchRows, workloadVerdictParts } from "@/lib/derive/bench-load";
import {
  leakRankedBelowFloor,
  marginLeakUsd,
  revenueChangePct,
  targetAttainmentPct,
  totalMarginLeakUsd,
} from "@/lib/derive/financial";
import { pulseWindow, PULSE_KINDS } from "@/lib/derive/pulse";

const demo = applyOverlay(demoFixture, EMPTY_LEDGER_STATE);
const good = applyOverlay(goodDayFixture, EMPTY_LEDGER_STATE);
const overflow = applyOverlay(overflowFixture, EMPTY_LEDGER_STATE);

const BUCKET_ORDER: TimeBucket[] = ["compliance", "overdue", "next4h", "today", "thisWeek"];

type Overlay = LedgerState["matterOverlays"][string];
const demoWith = (id: string, overlay: Overlay) =>
  applyOverlay(demoFixture, { ...EMPTY_LEDGER_STATE, matterOverlays: { [id]: overlay } });

describe("pillars", () => {
  it("demo: health breaking, workload and financial straining", () => {
    expect(healthPillar(demo).state).toBe("breaking");
    expect(workloadPillar(demo).state).toBe("straining");
    expect(financialPillar(demo).state).toBe("straining");
  });
  it("good day: every pillar steady", () => {
    expect(healthPillar(good).state).toBe("steady");
    expect(workloadPillar(good).state).toBe("steady");
    expect(financialPillar(good).state).toBe("steady");
  });
  it("overflow: same states as demo, at scale", () => {
    expect(healthPillar(overflow).state).toBe("breaking");
    expect(workloadPillar(overflow).state).toBe("straining");
    expect(financialPillar(overflow).state).toBe("straining");
  });
  it("the headline figure is the count the rule fired on", () => {
    for (const fx of [demo, good, overflow]) {
      for (const p of [healthPillar(fx), workloadPillar(fx), financialPillar(fx)]) {
        expect(p.headline).toBe(String(p.count));
      }
    }
  });
});

describe("at-risk queue", () => {
  it("orders by bucket, then by deadline within a bucket", () => {
    for (const fx of [demo, overflow]) {
      const rows = atRiskRows(fx);
      for (let i = 1; i < rows.length; i++) {
        const a = rows[i - 1];
        const b = rows[i];
        const ba = BUCKET_ORDER.indexOf(a.bucket);
        const bb = BUCKET_ORDER.indexOf(b.bucket);
        expect(ba).toBeLessThanOrEqual(bb);
        if (ba === bb) {
          expect(a.matter.deadlineOffsetMs ?? 0).toBeLessThanOrEqual(b.matter.deadlineOffsetMs ?? 0);
        }
      }
    }
  });
  it("act-now is the subset that can turn irreversible today", () => {
    const rows = atRiskRows(demo);
    const now = actNowRows(rows);
    expect(now.length).toBeGreaterThan(0);
    expect(now.length).toBeLessThan(rows.length);
    for (const r of now) expect(isActNow(r)).toBe(true);
    for (const r of rows.filter((r) => !isActNow(r))) {
      expect(["today", "thisWeek"]).toContain(r.bucket);
    }
  });
  it("a quiet day has an empty queue", () => {
    expect(atRiskRows(good)).toHaveLength(0);
  });
});

describe("isHandled — one verb clears a matter from the queue", () => {
  const first = atRiskRows(demo)[0].matter;
  const cases: [string, Overlay][] = [
    ["chase", { chased: true }],
    ["halt", { halted: true }],
    ["escalate", { escalated: true }],
    ["expedite", { conflictsExpedited: true }],
    ["reassign", { reassignedToLawyerId: headroom(demo)[0].lawyer.id }],
  ];
  for (const [name, overlay] of cases) {
    it(`${name} removes the matter from the queue`, () => {
      expect(bucketFor(first)).not.toBeNull();
      const fx = demoWith(first.id, overlay);
      const m = fx.matters.find((x) => x.id === first.id)!;
      expect(isHandled(m)).toBe(true);
      expect(bucketFor(m)).toBeNull();
      expect(atRiskRows(fx).some((r) => r.matter.id === first.id)).toBe(false);
      expect(atRiskRows(fx)).toHaveLength(atRiskRows(demo).length - 1);
    });
  }
  it("reassigning moves committed load between lawyers", () => {
    const from = demo.lawyers.find((l) => l.id === first.lawyerId)!;
    const to = headroom(demo)[0].lawyer;
    const fx = demoWith(first.id, { reassignedToLawyerId: to.id });
    expect(fx.lawyers.find((l) => l.id === from.id)!.committedMatters).toBe(from.committedMatters - 1);
    expect(fx.lawyers.find((l) => l.id === to.id)!.committedMatters).toBe(to.committedMatters + 1);
  });
});

describe("matterAction — one primary verb per row", () => {
  it("compliance → expedite, overdue → chase, and the primary never repeats in More", () => {
    const room = headroom(demo);
    for (const row of atRiskRows(demo)) {
      const { primary, overflow: more } = matterAction(row, room);
      if (row.bucket === "compliance") expect(primary.kind).toBe("expedite");
      if (row.bucket === "overdue") expect(primary.kind).toBe("chase");
      expect(more.map((o) => o.kind)).not.toContain(primary.kind);
    }
  });
  it("unassigned rows split into assign / expedite / escalate", () => {
    const kinds = exceptionQueue(demo).map((m) => unassignedAction(m, headroom(demo)).kind);
    expect(kinds).toEqual(["expedite", "assign", "escalate"]);
  });
});

describe("bench", () => {
  it("lists exactly the over-committed lawyers, worst deadline first", () => {
    const rows = benchRows(demo);
    expect(rows.map((r) => r.lawyer.id).sort()).toEqual(
      overCommitted(demo).map((o) => o.lawyer.id).sort()
    );
    const rank = { overdue: 3, today: 2, later: 1, none: 0 };
    for (let i = 1; i < rows.length; i++) {
      expect(rank[rows[i - 1].worst]).toBeGreaterThanOrEqual(rank[rows[i].worst]);
    }
    for (const r of rows) expect(r.over).toBeGreaterThanOrEqual(1);
  });
  it("a sticky lawyer back inside capacity re-emits as a resolved row, last", () => {
    const spare = headroom(demo)[0].lawyer.id;
    const rows = benchRows(demo, new Set([spare]));
    const last = rows[rows.length - 1];
    expect(last.lawyer.id).toBe(spare);
    expect(last.resolved).toBe(true);
    expect(last.headline).toBe("Now within declared capacity");
  });
  it("verdict wording tracks the fixture", () => {
    expect(workloadVerdictParts(demo).lead).toBe(
      "All 6 deadlines due today or overdue sit with lawyers already over capacity."
    );
    expect(workloadVerdictParts(demo).room).toBe("4 others have room for 9 more.");
    expect(workloadVerdictParts(overflow).lead).toMatch(/^\d+ of \d+ deadlines/);
    expect(workloadVerdictParts(good).lead.length).toBeGreaterThan(0);
  });
});

describe("financial", () => {
  it("leak is the gap to the floor, not the price", () => {
    expect(Math.round(totalMarginLeakUsd(demo))).toBe(2504);
    expect(totalMarginLeakUsd(good)).toBe(0);
  });
  it("ranks below-floor matters by dollar leak, descending", () => {
    const ranked = leakRankedBelowFloor(demo);
    expect(ranked.map((m) => m.client)).toEqual([
      "Vantage Health",
      "Palisade Foods",
      "Aurora Fintech",
      "Contoso Biotech",
    ]);
    for (let i = 1; i < ranked.length; i++) {
      expect(marginLeakUsd(ranked[i - 1])).toBeGreaterThanOrEqual(marginLeakUsd(ranked[i]));
    }
  });
  it("revenue headline facts", () => {
    expect(revenueChangePct(demo)).toBe(-13);
    expect(targetAttainmentPct(demo)).toBe(90);
  });
});

describe("pulse", () => {
  it("the four kind counts sum to the headline total", () => {
    for (const fx of [demo, good, overflow]) {
      const p = pulseWindow(fx.activity);
      const sum = PULSE_KINDS.reduce((n, k) => n + p.byKind[k], 0);
      expect(sum).toBe(p.total);
    }
  });
  it("demo window: 45 events, 2% behind the previous week", () => {
    const p = pulseWindow(demo.activity);
    expect(p.total).toBe(45);
    expect(p.changePct).toBe(-2);
  });
});
