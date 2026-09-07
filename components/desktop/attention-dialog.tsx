"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AttentionTable } from "@/components/desktop/attention-table";
import { MobileAttentionList } from "@/components/mobile/attention-list";
import { atRiskSummary, type AtRiskRow } from "@/lib/derive/matters";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";

/**
 * The full at-risk list, shared by desktop and mobile behind a "View all"
 * trigger — the page keeps a few rows, everything else lives here. The
 * body swaps between the table and the mobile list by surface, but the
 * counts and actions dispatch the same way on both. The matter spotlighted
 * in the alert has already been filtered out of `rows` by the caller, so
 * it never appears twice.
 */
export function AttentionDialog({
  open,
  onOpenChange,
  rows,
  fx,
  room,
  dispatch,
  surface,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: AtRiskRow[];
  fx: EffectiveFixture;
  room: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  surface: "desktop" | "mobile";
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          surface === "mobile"
            ? "top-0 left-0 max-w-none w-screen h-dvh translate-x-0 translate-y-0 rounded-none p-0 overflow-y-auto"
            : "sm:max-w-4xl max-h-[85vh] overflow-y-auto rounded-lg p-6"
        }
      >
        <DialogHeader className={surface === "mobile" ? "px-4 pt-6" : undefined}>
          <DialogTitle className="t-section">At risk</DialogTitle>
          <DialogDescription className="t-detail text-muted-foreground">
            {atRiskSummary(rows)}
          </DialogDescription>
        </DialogHeader>

        {surface === "mobile" ? (
          <MobileAttentionList rows={rows} candidates={room} dispatch={dispatch} />
        ) : (
          <AttentionTable rows={rows} fx={fx} headroomList={room} dispatch={dispatch} />
        )}
      </DialogContent>
    </Dialog>
  );
}
