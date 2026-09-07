"use client";

import { AnimatePresence, motion } from "motion/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { SWAP } from "@/components/motion/reveal";
import { LoadRatio } from "@/components/ledger/load-ratio";
import { RowActions } from "@/components/ledger/row-actions";
import { attentionDetail } from "@/lib/derive/detail";
import { isHandled, type AtRiskRow } from "@/lib/derive/matters";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

/**
 * The act-now spotlight: always the single most urgent matter.
 *
 * The previous surface put a single hardcoded compliance banner above a
 * flat table of every at-risk matter, which left the most urgent thing on
 * the page looking exactly like the least urgent one, and left an admin
 * with no sense of how much was actually in front of them. Here the
 * threshold does the work: only matters that can still turn irreversible
 * today reach this component. There's no pager through that set — the
 * card is always rows[0], which atRiskRows already sorted to the front.
 * Act on it and it leaves; the next-most-urgent matter takes its place
 * with the same enter animation, and the "cleared" count climbs.
 *
 * Nothing here holds its own copy of the queue. The rows are recomputed
 * from the ledger on every action, so the card that leaves is the same
 * event that clears the pillar above and the row below — one dispatch,
 * every zone.
 */
export function AttentionAlert({
  rows,
  fx,
  candidates,
  dispatch,
  surface,
}: {
  rows: AtRiskRow[];
  fx: EffectiveFixture;
  candidates: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  surface: "desktop" | "mobile";
}) {
  if (rows.length === 0) return null;

  // Always the most urgent row — atRiskRows already sorted the set, so
  // there's no position to track. When this one clears, the next row
  // becomes rows[0] on the next render.
  const row = rows[0];
  const cleared = fx.matters.filter(isHandled).length;
  const lawyer = fx.lawyers.find((l) => l.id === row.matter.effectiveLawyerId) ?? null;
  const breaking = row.bucket === "compliance" || row.bucket === "overdue";

  return (
    <Alert
      variant={breaking ? "destructive" : "straining"}
      className={cn(
        "gap-0 px-6 py-5",
        surface === "mobile" && "rounded-none border-x-0 border-t-0 px-4 py-6"
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        {/* No icon: the tint and border already carry the state, so a
            warning glyph would only restate it. */}
        <span className="t-eyebrow text-ink-2 flex items-center gap-2">
          Act now
          {cleared > 0 && (
            <span className="text-muted-foreground">· {cleared} cleared</span>
          )}
        </span>

        {/* How much is left in the queue behind this card — no pager to
            move through it, just the count. */}
        {rows.length > 1 && (
          <span className="t-detail text-muted-foreground tabular-nums">
            +{rows.length - 1} more
          </span>
        )}
      </div>

      {/* Keyed on the matter: the acted-on card slides out before the next
          one slides in, so the queue is seen to move — the dispatch itself
          lands immediately, the presence layer holds the old card for the
          exit. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={row.matter.id}
          aria-live="polite"
          {...SWAP}
          className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4"
        >
          <div className="grid gap-1.5">
            <AlertTitle className="t-body">
              {row.matter.name}{" "}
              <span className="text-muted-foreground">· {row.matter.client}</span>
            </AlertTitle>
            <AlertDescription className="t-detail text-ink-2">
              {attentionDetail(row.matter, row.bucket)}
            </AlertDescription>
            {lawyer && (
              <span className="t-detail text-muted-foreground flex items-baseline gap-1.5">
                {lawyer.name}
                <LoadRatio
                  committed={lawyer.committedMatters}
                  declared={lawyer.declaredAvailability}
                />
              </span>
            )}
          </div>

          {/* Deliberately not AlertAction. That primitive pins itself to the
              corner and makes the Alert reserve a 72px right gutter for it;
              this card lays its action out in flow, so opting in would only
              buy an indent to fight. */}
          <div className="flex shrink-0 items-center">
            <RowActions
              matter={row.matter}
              candidates={candidates}
              dispatch={dispatch}
              reveal="always"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </Alert>
  );
}
