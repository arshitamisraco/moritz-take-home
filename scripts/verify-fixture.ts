import { demoFixture, goodDayFixture, overflowFixture } from "../lib/fixture";
import { applyOverlay } from "../lib/derive/apply-overlay";
import { atRiskRows, exceptionQueue } from "../lib/derive/matters";
import { belowFloorOpenMatters } from "../lib/derive/financial";
import { healthPillar, workloadPillar, financialPillar } from "../lib/derive/pillars";
import { EMPTY_LEDGER_STATE } from "../lib/state/types";

function report(name: string, fixture: typeof demoFixture) {
  const fx = applyOverlay(fixture, EMPTY_LEDGER_STATE);
  const health = healthPillar(fx);
  const workload = workloadPillar(fx);
  const financial = financialPillar(fx);
  console.log(`\n=== ${name} ===`);
  console.log("lawyers:", fx.lawyers.length);
  console.log("at risk:", atRiskRows(fx).length);
  console.log("unplaced:", exceptionQueue(fx).length);
  console.log("below floor:", belowFloorOpenMatters(fx).length);
  console.log(
    "pillars:",
    `${health.state}(${health.count})`,
    `${workload.state}(${workload.count})`,
    `${financial.state}(${financial.count})`
  );
  console.log("health baseline:", health.baseline, "| evidence:", health.evidence);
  console.log("workload baseline:", workload.baseline, "| evidence:", workload.evidence);
  console.log("financial baseline:", financial.baseline, "| evidence:", financial.evidence);
}

report("demo", demoFixture);
report("good-day", goodDayFixture);
report("overflow", overflowFixture);

console.log("\noverflow matter count:", overflowFixture.matters.length);

import { attentionDetail } from "../lib/derive/detail";
import { headroom, overCommitted, undeclared } from "../lib/derive/bench";

const demoFx = applyOverlay(demoFixture, EMPTY_LEDGER_STATE);
console.log("\n--- demo attention rows ---");
for (const row of atRiskRows(demoFx)) {
  console.log(row.bucket.padEnd(10), row.matter.client.padEnd(20), "|", attentionDetail(row.matter, row.bucket));
}
console.log("\n--- demo headroom ---");
for (const h of headroom(demoFx)) console.log(h.lawyer.name, h.lawyer.committedMatters + "/" + h.lawyer.declaredAvailability);
console.log("\n--- demo over-committed ---");
for (const h of overCommitted(demoFx)) console.log(h.lawyer.name, h.lawyer.committedMatters + "/" + h.lawyer.declaredAvailability);
console.log("\n--- demo undeclared ---");
for (const l of undeclared(demoFx)) console.log(l.name);

const gdFx = applyOverlay(goodDayFixture, EMPTY_LEDGER_STATE);
console.log("\n--- good day next due ---");
import { nextDueMatter } from "../lib/derive/matters";
const nd = nextDueMatter(gdFx);
console.log(nd?.client, nd?.deadlineOffsetMs);
console.log("\n--- good day headroom count ---", headroom(gdFx).length);
