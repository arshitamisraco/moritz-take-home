"use client";

import { TriangleAlert } from "lucide-react";
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

  const stats: { count: number; label: string; detail: string; state: PillarState; target: string }[] = [
    { count: summary.deadlines, label: "Deadlines", detail: "due this week", state: severity.deadlines, target: "workload" },
    { count: summary.overloaded, label: "Overloaded", detail: "lawyers over capacity", state: severity.overloaded, target: "workload" },
    { count: summary.awaitingAction, label: "Awaiting action", detail: "matters and lawyers need a decision", state: severity.awaitingAction, target: "workload" },
  ];

  return (
    <section id="attention" aria-label="Needs attention" className="pt-10 pb-10">
      <div className="flex items-center gap-2">
        <TriangleAlert className="size-4" aria-hidden="true" />
        <h1 className="t-section">Needs attention</h1>
      </div>

      {complianceRow && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-breaking bg-breaking-tint px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenMatter(complianceRow.matter.id)}
            className="flex flex-wrap items-center gap-3 text-left rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <StatusBadge variant="breaking" label="compliance" />
            <span className="t-body">
              {complianceRow.matter.name} <span className="text-muted-foreground">· {complianceRow.matter.client}</span>
            </span>
            <span className="t-detail" style={{ color: "var(--ink-2)" }}>
              Conflicts not cleared, work started
            </span>
          </button>
          {complianceRow.matter.conflictsExpedited ? (
            <span className="t-eyebrow shrink-0 text-muted-foreground">expedited</span>
          ) : (
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "expedite",
                  matterId: complianceRow.matter.id,
                  matterLabel: `${complianceRow.matter.name} · ${complianceRow.matter.client}`,
                })
              }
              className="t-detail shrink-0 text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
            >
              expedite clearance
            </button>
          )}
        </div>
      )}

      {quiet ? (
        <p className="mt-4 t-body">Nothing needs you right now — every matter is inside its promised window.</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => scrollToSection(s.target)}
              className="flex flex-col items-start gap-2 px-6 py-6 text-left first:pl-0 last:pr-0 hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <p className="t-eyebrow text-muted-foreground">{s.label}</p>
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
    </section>
  );
}
