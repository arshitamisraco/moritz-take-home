"use client";

import { StatusBadge } from "@/components/ledger/status-badge";
import { attentionDetail } from "@/lib/derive/detail";
import type { AtRiskRow, TimeBucket } from "@/lib/derive/matters";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

const BUCKET_LABEL: Record<TimeBucket, string> = {
  compliance: "Compliance",
  overdue: "Overdue",
  next4h: "Next 4 hours",
  today: "Today",
  thisWeek: "This week",
};

/** One primary action per row — mobile answers "what needs me right now",
 * not the full action set the desktop row carries. */
function primaryAction(row: AtRiskRow): { label: string; action: LedgerAction } | null {
  const label = `${row.matter.name} · ${row.matter.client}`;
  if (row.bucket === "compliance") {
    if (row.matter.conflictsExpedited) return null;
    return { label: "expedite clearance", action: { type: "expedite", matterId: row.matter.id, matterLabel: label } };
  }
  if (row.matter.effectiveLawyerId === null) return null; // reassign needs a picker, not a one-tap action
  if (row.bucket === "overdue") {
    if (row.matter.escalated) return null;
    return { label: "escalate", action: { type: "escalate", matterId: row.matter.id, matterLabel: label } };
  }
  if (row.matter.chased) return null;
  return { label: "chase", action: { type: "chase", matterId: row.matter.id, matterLabel: label } };
}

export function MobileAttentionList({
  rows,
  dispatch,
  onOpenMatter,
}: {
  rows: AtRiskRow[];
  dispatch: (action: LedgerAction) => void;
  onOpenMatter: (matterId: string) => void;
}) {
  const withHeaders = rows.map((row, i) => ({
    row,
    showHeader: row.bucket !== rows[i - 1]?.bucket,
  }));

  return (
    <ul className="flex flex-col">
      {withHeaders.map(({ row, showHeader }) => {
        const action = primaryAction(row);

        return (
          <li key={row.matter.id} className="border-b border-border">
            {showHeader && (
              <p className="t-eyebrow px-4 pt-5 pb-2 text-muted-foreground">
                {BUCKET_LABEL[row.bucket]}
              </p>
            )}
            <button
              type="button"
              onClick={() => onOpenMatter(row.matter.id)}
              className="flex w-full flex-col gap-1 px-4 pt-3 pb-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              {row.bucket !== "compliance" && row.matter.deadlineKind && (
                <StatusBadge variant={row.matter.deadlineKind} />
              )}
              {row.bucket === "compliance" && <StatusBadge variant="breaking" label="compliance" />}
              <p className="t-body">{row.matter.name}</p>
              <p className="t-detail text-muted-foreground">{row.matter.client}</p>
              <p
                className={cn("t-detail", row.matter.halted && "line-through decoration-1")}
                style={{ color: "var(--ink-2)" }}
              >
                {attentionDetail(row.matter, row.bucket)}
              </p>
            </button>
            {action && (
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={() => dispatch(action.action)}
                  className="t-detail w-fit text-foreground underline decoration-border underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
                >
                  {action.label}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
