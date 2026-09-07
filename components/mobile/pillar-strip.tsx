"use client";

import { motion } from "motion/react";
import { StatusBadge } from "@/components/ledger/status-badge";
import { AnimatedNumber } from "@/components/motion/number";
import { StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { healthPillar, workloadPillar, financialPillar, type PillarResult } from "@/lib/derive/pillars";
import { PILLAR_RULES, type PillarKey } from "@/lib/derive/thresholds";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import { cn } from "@/lib/utils";

const PILLAR_KEYS: PillarKey[] = ["health", "workload", "financial"];
const PILLAR_HREF: Record<PillarKey, string> = {
  health: "#m-attention",
  workload: "#m-workload",
  financial: "#m-financial",
};

/** Mobile drops the tooltip (no hover, and a press-to-reveal rule table
 * competes with the row's own tap target) and the baseline line (three
 * facts wrapping to three lines in a 120px column is noise, not glance).
 * Badge, figure, label — the section below carries the rest. */
export function MobilePillarStrip({ fx }: { fx: EffectiveFixture }) {
  const results: Record<PillarKey, PillarResult> = {
    health: healthPillar(fx),
    workload: workloadPillar(fx),
    financial: financialPillar(fx),
  };

  return (
    <StaggerGroup className="grid grid-cols-3 divide-x divide-border border-b border-border">
      {PILLAR_KEYS.map((key) => {
        const result = results[key];
        const count = Number(result.headline);
        return (
          <motion.a
            key={key}
            href={PILLAR_HREF[key]}
            variants={staggerItem}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.4 }}
            className="flex flex-col items-start gap-2 px-4 py-6 transition-wash hover:bg-accent focus-ring"
          >
            <StatusBadge variant={result.state} />
            <p className={cn("t-figure-sm tabular-nums", result.state === "breaking" ? "text-breaking" : "text-foreground")}>
              {Number.isFinite(count) ? <AnimatedNumber value={count} /> : result.headline}{" "}
              <span className="t-detail text-muted-foreground">{PILLAR_RULES[key].unit}</span>
            </p>
            <p className="t-detail text-muted-foreground">{PILLAR_RULES[key].label}</p>
          </motion.a>
        );
      })}
    </StaggerGroup>
  );
}
