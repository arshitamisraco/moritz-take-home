import { TriangleAlert } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/ledger/status-badge";
import type { PillarResult } from "@/lib/derive/pillars";
import { PILLAR_RULES, type PillarKey } from "@/lib/derive/thresholds";
import { cn } from "@/lib/utils";

const ORDER: PillarKey[] = ["health", "workload", "financial"];
const TITLE: Record<PillarKey, string> = {
  health: "Firm health",
  workload: "Workload",
  financial: "Financial",
};

export function Pillars({
  health,
  workload,
  financial,
}: {
  health: PillarResult;
  workload: PillarResult;
  financial: PillarResult;
}) {
  const results: Record<PillarKey, PillarResult> = { health, workload, financial };

  return (
    <section className="grid grid-cols-3 divide-x divide-border border-y border-border" aria-label="Pillars">
      {ORDER.map((key) => {
        const r = results[key];
        const rule = PILLAR_RULES[key];
        return (
          <div key={key} className="flex flex-col gap-3 px-6 py-6 first:pl-0 last:pr-0">
            <div className="flex items-center justify-between gap-2">
              <p className="t-eyebrow text-muted-foreground">{TITLE[key]}</p>
              <Tooltip>
                <TooltipTrigger
                  aria-label={`${TITLE[key]} threshold rule`}
                  className="rounded-sm text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <TriangleAlert className="size-3" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-64">
                  <dl className="t-detail space-y-1">
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 t-eyebrow text-[10px]">steady</dt>
                      <dd>{rule.steady}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 t-eyebrow text-[10px]">straining</dt>
                      <dd>{rule.straining}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 t-eyebrow text-[10px]">breaking</dt>
                      <dd>{rule.breaking}</dd>
                    </div>
                  </dl>
                </TooltipContent>
              </Tooltip>
            </div>

            <StatusBadge variant={r.state} />

            <p
              className={cn(
                "t-figure",
                r.state === "breaking" ? "text-breaking" : "text-foreground"
              )}
            >
              {r.headline}
            </p>

            <p className="t-detail text-muted-foreground">{r.baseline}</p>
            <p className="t-detail" style={{ color: "var(--ink-2)" }}>
              {r.evidence}
            </p>
          </div>
        );
      })}
    </section>
  );
}
