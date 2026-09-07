"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AttentionAlert } from "@/components/ledger/attention-alert";
import { MobileAttentionList } from "@/components/mobile/attention-list";
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

/** Same layout as the desktop section, rendered full-bleed: the act-now
 * spotlight above the full at-risk list. Both come from the derive layer,
 * so the two surfaces can't disagree about what counts as urgent. */
export function MobileNeedsAttention({
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

  /** Two rows on a phone; the rest is a tap away. */
  const VISIBLE = 2;
  const visibleRows = tableRows.slice(0, VISIBLE);

  return (
    <section id="m-attention" aria-label="Needs attention">
      {/* The page's one h1, as on desktop — visually the alert and the
          pillar strip already say it, so it reads only to assistive tech. */}
      <h1 className="sr-only">{quiet ? "Nothing needs attention" : "Needs attention"}</h1>
      <AttentionAlert
        rows={actNow}
        fx={fx}
        candidates={room}
        dispatch={dispatch}
        surface="mobile"
      />

      {quiet ? (
        <div className="border-b border-border px-4 py-7">
          <p className="t-body">Nothing needs you right now</p>
          <p className="t-detail mt-2 text-muted-foreground">
            Every matter is inside its promised window.
            {nextDue && (
              <>
                {" "}
                Next due: {nextDue.name} · {nextDue.client},{" "}
                {dayLabel(nextDue.deadlineOffsetMs as number)}{" "}
                {clockTime(nextDue.deadlineOffsetMs as number)}.
              </>
            )}
          </p>
        </div>
      ) : tableRows.length > 0 ? (
        <div className="border-b border-border">
          <div className="flex items-baseline justify-between px-4 pt-6 pb-1">
            <span className="t-subhead text-muted-foreground">At risk · {tableRows.length}</span>
            <span className="t-detail text-muted-foreground">{atRiskSummary(tableRows)}</span>
          </div>

          <MobileAttentionList
            rows={visibleRows}
            candidates={room}
            dispatch={dispatch}
            counts={bucketCounts(tableRows)}
          />

          {tableRows.length > visibleRows.length && (
            <div className="px-4 py-4">
              <Button variant="outline" className="w-full" onClick={() => setDialogOpen(true)}>
                View all {tableRows.length}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-b border-border px-4 py-6">
          <p className="t-detail text-muted-foreground">
            Nothing else is at risk this week.
          </p>
        </div>
      )}

      <AttentionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rows={tableRows}
        fx={fx}
        room={room}
        dispatch={dispatch}
        surface="mobile"
      />
    </section>
  );
}
