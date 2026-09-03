"use client";

import { StatusBadge } from "@/components/ledger/status-badge";
import { MobileComplianceBreach } from "@/components/mobile/compliance-breach";
import type { AtRiskRow } from "@/lib/derive/matters";
import { attentionSeverity, type AttentionSummary } from "@/lib/derive/attention-summary";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

function scrollToWorkload() {
  document.getElementById("m-workload")?.scrollIntoView({ block: "start" });
}

export function MobileNeedsAttention({
  rows,
  summary,
  dispatch,
  onOpenMatter,
}: {
  rows: AtRiskRow[];
  summary: AttentionSummary;
  dispatch: (action: LedgerAction) => void;
  onOpenMatter: (matterId: string) => void;
}) {
  const complianceRow = rows.find((r) => r.bucket === "compliance") ?? null;
  const quiet = summary.deadlines === 0 && summary.overloaded === 0 && summary.awaitingAction === 0 && !complianceRow;
  const severity = attentionSeverity(summary, rows);

  const stats = [
    { count: summary.deadlines, label: "Deadlines", state: severity.deadlines },
    { count: summary.overloaded, label: "Overloaded", state: severity.overloaded },
    { count: summary.awaitingAction, label: "Awaiting action", state: severity.awaitingAction },
  ];

  return (
    <>
      {complianceRow && (
        <MobileComplianceBreach row={complianceRow} dispatch={dispatch} onOpenMatter={onOpenMatter} />
      )}
      {quiet ? (
        <div className="border-b border-border px-4 py-7">
          <p className="t-body">Nothing needs you right now</p>
          <p className="t-detail mt-2 text-muted-foreground">Every matter is inside its promised window.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={scrollToWorkload}
              className="flex flex-col items-start gap-2 px-4 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <StatusBadge variant={s.state} />
              <p className={cn("t-figure text-[28px]", s.state === "breaking" ? "text-breaking" : "text-foreground")}>
                {s.count}
              </p>
              <p className="t-detail text-muted-foreground">{s.label}</p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
