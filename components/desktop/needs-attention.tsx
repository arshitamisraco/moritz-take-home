"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ledger/status-badge";
import type { AtRiskRow } from "@/lib/derive/matters";
import { attentionSeverity, type AttentionSummary } from "@/lib/derive/attention-summary";
import type { PillarState } from "@/lib/derive/thresholds";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

/**
 * The command-center principle: exceptions over information. This is the
 * first thing on the page, ahead of revenue — an admin's most urgent
 * question is "what's broken", not "how much did we bill".
 */
export function NeedsAttention({
  rows,
  summary,
  dispatch,
}: {
  rows: AtRiskRow[];
  summary: AttentionSummary;
  dispatch: (action: LedgerAction) => void;
}) {
  const complianceRow = rows.find((r) => r.bucket === "compliance") ?? null;
  const quiet = summary.deadlines === 0 && summary.overloaded === 0 && summary.awaitingAction === 0 && !complianceRow;
  const severity = attentionSeverity(summary, rows);

  const stats: { count: number; label: string; detail: string; state: PillarState; target: string }[] = [
    { count: summary.deadlines, label: "Deadlines", detail: "due this week", state: severity.deadlines, target: "workload" },
    { count: summary.overloaded, label: "Overloaded", detail: "lawyers over capacity", state: severity.overloaded, target: "workload" },
    { count: summary.awaitingAction, label: "Awaiting action", detail: "matters and lawyers need a decision", state: severity.awaitingAction, target: "workload" },
  ];

  return (
    <section id="attention" aria-label="Needs attention" className="mt-8">
      <div className="flex items-center gap-2">
        {!quiet && <TriangleAlert className="size-4" aria-hidden="true" />}
        <h1 className="t-section">{quiet ? "Nothing needs attention" : "Needs attention"}</h1>
      </div>
      <div className="mt-6">
        {complianceRow && (
          <Alert
            variant="destructive"
            className="flex flex-wrap items-center justify-between gap-4 px-6 py-6"
          >
            <div className="grid gap-1.5">
              <AlertTitle className="t-body">
                {complianceRow.matter.name}{" "}
                <span className="text-muted-foreground">· {complianceRow.matter.client}</span>
              </AlertTitle>
              <AlertDescription className="t-detail text-ink-2">
                Conflicts not cleared, work started
              </AlertDescription>
            </div>

            {/* Primary action, right-aligned — it's the reason the row exists. */}
            <div className="flex shrink-0 items-center">
              {complianceRow.matter.conflictsExpedited ? (
                <span className="t-eyebrow text-muted-foreground">expedited</span>
              ) : (
                <Button
                  onClick={() =>
                    dispatch({
                      type: "expedite",
                      matterId: complianceRow.matter.id,
                      matterLabel: `${complianceRow.matter.name} · ${complianceRow.matter.client}`,
                    })
                  }
                >
                  Expedite clearance
                </Button>
              )}
            </div>
          </Alert>
        )}

        {quiet ? (
          <p className={cn("t-body", complianceRow && "mt-6")}>
            Nothing needs you right now — every matter is inside its promised window.
          </p>
        ) : (
          <div className={cn("grid grid-cols-3 gap-4", complianceRow && "mt-6")}>
            {stats.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => scrollToSection(s.target)}
                className="flex flex-col items-start gap-3 rounded-lg bg-card p-6 text-left ring-1 ring-foreground/10 transition-wash hover:bg-accent active:bg-surface-active focus-ring"
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <p className="t-subhead text-muted-foreground">{s.label}</p>
                  <StatusBadge variant={s.state} />
                </div>
                <p
                  className={cn("t-figure", s.state === "breaking" ? "text-breaking" : "text-foreground")}
                >
                  {s.count}
                </p>
                <p className="t-detail text-muted-foreground">{s.detail}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
