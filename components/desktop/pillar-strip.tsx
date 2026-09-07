"use client";

import { motion } from "motion/react";
import { StatusBadge } from "@/components/ledger/status-badge";
import { AnimatedNumber } from "@/components/motion/number";
import { LIFT, StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { healthPillar, workloadPillar, financialPillar, type PillarResult } from "@/lib/derive/pillars";
import { PILLAR_RULES, type PillarKey, type PillarState } from "@/lib/derive/thresholds";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import { cn } from "@/lib/utils";

const PILLAR_KEYS: PillarKey[] = ["health", "workload", "financial"];
const PILLAR_HREF: Record<PillarKey, string> = {
  health: "#attention",
  workload: "#workload",
  financial: "#financial",
};
const PILLAR_STATES: PillarState[] = ["steady", "straining", "breaking"];

function PillarCard({ pillarKey, result }: { pillarKey: PillarKey; result: PillarResult }) {
  const rules = PILLAR_RULES[pillarKey];

  const count = Number(result.headline);

  return (
    <motion.a
      href={PILLAR_HREF[pillarKey]}
      className="block rounded-lg transition-wash hover:bg-accent focus-ring"
      variants={staggerItem}
      {...LIFT}
    >
      <Card className="gap-3">
        {/* Below lg the badge sits under the title on every card — one
            layout for all three rather than a wrap that only the longest
            title triggers. */}
        <CardHeader className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="min-w-0 truncate text-muted-foreground">{rules.label}</CardTitle>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex">
                  <StatusBadge variant={result.state} />
                </span>
              }
            />
            <TooltipContent side="bottom" align="end" className="flex max-w-64 flex-col gap-1 py-2 text-left normal-case">
              {PILLAR_STATES.map((s) => (
                <span key={s} className={cn("t-detail", s === result.state && "font-semibold")}>
                  {s}: {rules[s]}
                </span>
              ))}
            </TooltipContent>
          </Tooltip>
        </CardHeader>

        <CardContent className="flex flex-col gap-1">
          <p className={cn("t-figure-sm tabular-nums", result.state === "breaking" ? "text-breaking" : "text-foreground")}>
            {Number.isFinite(count) ? <AnimatedNumber value={count} /> : result.headline}{" "}
            <span className="t-detail text-muted-foreground">{rules.unit}</span>
          </p>
          <p className="t-detail text-ink-2">{result.evidence}</p>
          <p className="t-detail text-muted-foreground">{result.baseline}</p>
        </CardContent>
      </Card>
    </motion.a>
  );
}

/**
 * Chrome, not the queue: three quiet cards an admin can glance at, then
 * jump to the section that explains the number. Subordinate to "Needs
 * attention" below it — every pillar state still surfaces its detail there.
 */
export function PillarStrip({ fx }: { fx: EffectiveFixture }) {
  const results: Record<PillarKey, PillarResult> = {
    health: healthPillar(fx),
    workload: workloadPillar(fx),
    financial: financialPillar(fx),
  };

  return (
    <nav aria-label="Firm at a glance" className="mt-8">
      <p className="t-detail text-muted-foreground">Firm at a glance</p>
      <StaggerGroup className="mt-3 grid grid-cols-3 gap-4">
        {PILLAR_KEYS.map((key) => (
          <PillarCard key={key} pillarKey={key} result={results[key]} />
        ))}
      </StaggerGroup>
    </nav>
  );
}
