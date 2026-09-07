"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert";
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
    <Alert
      variant="destructive"
      className="rounded-none border-x-0 border-t-0 px-4 py-7 pr-4"
    >
      <TriangleAlert className="translate-y-0" />
      <AlertTitle className="t-body">{row.matter.name}</AlertTitle>
      <AlertDescription className="text-ink-2">
        <span className="t-detail block text-muted-foreground">{row.matter.client}</span>
        <span className="t-detail mt-2 block">Conflicts not cleared, work started</span>
      </AlertDescription>
      <AlertAction className="static col-start-2 mt-3">
        {!row.matter.conflictsExpedited ? (
          <Button
            onClick={() => dispatch({ type: "expedite", matterId: row.matter.id, matterLabel: label })}
          >
            Expedite clearance
          </Button>
        ) : (
          <span className="t-eyebrow block text-muted-foreground">expedited</span>
        )}
      </AlertAction>
    </Alert>
  );
}
