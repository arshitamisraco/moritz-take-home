"use client";

import { ReassignMenu } from "@/components/ledger/reassign-menu";
import { DoneMarker } from "@/components/ledger/row-actions";
import { clockTime, dayLabel } from "@/lib/format";
import { matterLabel } from "@/lib/derive/actions";
import type { BenchMatter } from "@/lib/derive/bench-load";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";

/**
 * One matter inside an expanded bench lawyer. The move is matter-scoped:
 * either a Reassign to a lawyer with headroom, or — once handover is no
 * longer worth it — a static "locked" label where a dead button would have
 * been. Chase / Escalate / Halt act on a single deadline and live in
 * RowActions on the flagged-matters table, not here.
 */
export function BenchMatterRow({
  bm,
  room,
  dispatch,
}: {
  bm: BenchMatter;
  room: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
}) {
  const { matter, movable } = bm;
  const when =
    matter.deadlineOffsetMs === null
      ? "no deadline"
      : `${dayLabel(matter.deadlineOffsetMs)} ${clockTime(matter.deadlineOffsetMs)}`;

  return (
    <li className="group/row flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-sm px-2 py-3 -mx-2 transition-wash hover:bg-accent">
      <div className="min-w-0">
        <p className="t-detail truncate">
          {matter.name} <span className="text-muted-foreground">· {matter.client}</span>
        </p>
        <p className="t-detail text-ink-2">{when}</p>
      </div>
      <div className="shrink-0">
        {movable ? (
          <ReassignMenu
            candidates={room}
            onPick={(id, name) =>
              dispatch({
                type: "reassign",
                matterId: matter.id,
                matterLabel: matterLabel(matter),
                toLawyerId: id,
                toLawyerName: name,
              })
            }
          />
        ) : (
          <DoneMarker>
            locked
            {matter.deadlineOffsetMs !== null && ` · due ${clockTime(matter.deadlineOffsetMs)}`}
          </DoneMarker>
        )}
      </div>
    </li>
  );
}
