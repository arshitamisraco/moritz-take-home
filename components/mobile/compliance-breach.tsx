"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ledger/status-badge";
import type { AtRiskRow } from "@/lib/derive/matters";
import type { LedgerAction } from "@/lib/state/types";

export function MobileComplianceBreach({
  row,
  dispatch,
}: {
  row: AtRiskRow;
  dispatch: (action: LedgerAction) => void;
}) {
  const label = `${row.matter.name} · ${row.matter.client}`;
  return (
    <div className="border-b border-border bg-breaking-tint px-4 py-7">
      <StatusBadge variant="breaking" label="compliance" />
      <div className="mt-3">
        <p className="t-body">{row.matter.name}</p>
        <p className="t-detail text-muted-foreground">{row.matter.client}</p>
        <p className="t-detail mt-2 text-ink-2">
          Conflicts not cleared, work started
        </p>
      </div>
      {!row.matter.conflictsExpedited ? (
        <Button
          className="mt-3"
          onClick={() => dispatch({ type: "expedite", matterId: row.matter.id, matterLabel: label })}
        >
          Expedite clearance
        </Button>
      ) : (
        <span className="t-eyebrow mt-3 block text-muted-foreground">expedited</span>
      )}
    </div>
  );
}
