"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/desktop/section";
import { AttentionAlert } from "@/components/ledger/attention-alert";
import { AttentionTable } from "@/components/desktop/attention-table";
import { AttentionDialog } from "@/components/desktop/attention-dialog";
import {
  actNowRows,
  atRiskRows,
  atRiskSummary,
  bucketCounts,
  nextDueMatter,
} from "@/lib/derive/matters";
import { headroom } from "@/lib/derive/bench";
import { clockTime, dayLabel } from "@/lib/format";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

/**
 * The command-center principle: exceptions over information. This is the
 * first thing on the page, ahead of revenue — an admin's most urgent
 * question is "what's broken", not "how much did we bill".
 *
 * The alert above is a spotlight on the single most urgent matter, so the
 * table underneath shows every other at-risk matter — the spotlighted one
 * is dropped from it rather than repeated, since it's already on screen
 * and one action clears it from both places at once.
 */
export function NeedsAttention({
  fx,
  dispatch,
}: {
  fx: EffectiveFixture;
  dispatch: (action: LedgerAction) => void;
}) {
  const rows = atRiskRows(fx);
  const room = headroom(fx);
  const actNow = actNowRows(rows);
  const spotlightId = actNow[0]?.matter.id ?? null;
  const tableRows = spotlightId ? rows.filter((r) => r.matter.id !== spotlightId) : rows;
  const quiet = rows.length === 0;
  const nextDue = quiet ? nextDueMatter(fx) : null;
  const [dialogOpen, setDialogOpen] = useState(false);

  /** The table stays short on the page; past this, the rest lives behind
   * View all rather than pushing Workload off the fold. */
  const VISIBLE = 4;
  const visibleRows = tableRows.slice(0, VISIBLE);

  return (
    <Section
      id="attention"
      title={quiet ? "Nothing needs attention" : "Needs attention"}
      as="h1"
      first
    >
      <AttentionAlert
        rows={actNow}
        fx={fx}
        candidates={room}
        dispatch={dispatch}
        surface="desktop"
      />

      {quiet ? (
        <p className="t-body">
          Nothing needs you right now. Every matter is inside its promised window.
          {nextDue && (
            <span className="text-muted-foreground">
              {" "}
              Next due: {nextDue.name} · {nextDue.client},{" "}
              {dayLabel(nextDue.deadlineOffsetMs as number)}{" "}
              {clockTime(nextDue.deadlineOffsetMs as number)}.
            </span>
          )}
        </p>
      ) : tableRows.length > 0 ? (
        <div className={cn(actNow.length > 0 && "mt-8")}>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="t-subhead text-muted-foreground">
              At risk · {tableRows.length}
            </span>
            <span className="t-detail text-muted-foreground">
              {atRiskSummary(tableRows)}
            </span>
          </div>

          <AttentionTable
            rows={visibleRows}
            fx={fx}
            headroomList={room}
            dispatch={dispatch}
            counts={bucketCounts(tableRows)}
          />

          {tableRows.length > visibleRows.length && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                View all {tableRows.length}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* The alert is still running but nothing else is at risk — say so,
           rather than leaving the section looking truncated. */
        <p className={cn("t-detail text-muted-foreground", actNow.length > 0 && "mt-6")}>
          Nothing else is at risk this week.
        </p>
      )}

      <AttentionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rows={tableRows}
        fx={fx}
        room={room}
        dispatch={dispatch}
        surface="desktop"
      />
    </Section>
  );
}
