"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { ReassignMenu } from "@/components/ledger/reassign-menu";
import { DoneMarker } from "@/components/ledger/row-actions";
import { CapacityMeter } from "@/components/ledger/capacity-meter";
import { BenchMatterRow } from "@/components/ledger/bench-matter-row";
import { MobileAttentionList } from "@/components/mobile/attention-list";
import { deadlineHorizons } from "@/lib/derive/deadlines";
import { benchRows, workloadVerdict } from "@/lib/derive/bench-load";
import {
  unassignedAction,
  unassignedRowLabel,
  unassignedSummary,
  matterLabel,
} from "@/lib/derive/actions";
import { headroom, undeclared } from "@/lib/derive/bench";
import { exceptionQueue, type AtRiskRow } from "@/lib/derive/matters";
import type { EffectiveFixture, EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";

const UNASSIGNED_PREVIEW = 4;

function UnassignedRow({
  m,
  room,
  dispatch,
}: {
  m: EffectiveMatter;
  room: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
}) {
  const act = unassignedAction(m, room);
  const done =
    (act.kind === "expedite" && m.conflictsExpedited) ||
    (act.kind === "escalate" && m.escalated);

  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="t-detail text-ink-2">{unassignedRowLabel(m)}</p>
        <p className="t-detail">
          {m.name} <span className="text-muted-foreground">· {m.client}</span>
        </p>
      </div>
      <div className="shrink-0">
        {act.kind === "assign" ? (
          <ReassignMenu
            label="Assign"
            candidates={room}
            onPick={(id, name) =>
              dispatch({
                type: "reassign",
                matterId: m.id,
                matterLabel: matterLabel(m),
                toLawyerId: id,
                toLawyerName: name,
              })
            }
          />
        ) : done ? (
          <DoneMarker>{act.kind === "expedite" ? "expedited" : "escalated"}</DoneMarker>
        ) : (
          <Button
            variant={act.kind === "escalate" ? "destructive" : "ghost"}
            size="sm"
            onClick={() => dispatch(act.action)}
          >
            {act.label}
          </Button>
        )}
      </div>
    </li>
  );
}

function UnassignedList({
  items,
  room,
  dispatch,
}: {
  items: EffectiveMatter[];
  room: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
}) {
  return (
    <ul className="mt-5 flex flex-col divide-y divide-border">
      {items.map((m) => (
        <UnassignedRow key={m.id} m={m} room={room} dispatch={dispatch} />
      ))}
    </ul>
  );
}

export function MobileWorkload({
  fx,
  rows,
  dispatch,
}: {
  fx: EffectiveFixture;
  rows: AtRiskRow[];
  dispatch: (action: LedgerAction) => void;
}) {
  // See the desktop note — a reassign can drop a lawyer from overCommitted()
  // while their panel is open; the sticky set keeps their row on the card.
  const [sticky, setSticky] = useState<ReadonlySet<string>>(() => new Set());
  const bench = benchRows(fx, sticky);
  const seen = bench.filter((r) => !sticky.has(r.lawyer.id));
  if (seen.length > 0) setSticky(new Set([...sticky, ...seen.map((r) => r.lawyer.id)]));
  const verdict = workloadVerdict(fx);
  const horizons = deadlineHorizons(fx).filter((h) => h.count > 0);
  const room = headroom(fx);
  const undecl = undeclared(fx);
  const unassigned = exceptionQueue(fx);
  const unassignedSplit = unassignedSummary(unassigned);
  const timedRows = rows.filter((r) => r.bucket !== "compliance");

  return (
    <section id="m-workload" className="border-b border-border px-4 py-7">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="t-section">Workload</h2>
        {horizons.length > 0 && (
          <p className="t-detail tabular-nums text-muted-foreground">
            {horizons.map((h, i) => (
              <span key={h.label}>
                {i > 0 && " · "}
                {h.count} {h.label.toLowerCase()}
              </span>
            ))}
          </p>
        )}
      </div>

      <p className="t-body mt-4 text-pretty">{verdict}</p>

      {bench.length > 0 && (
        <ul className="mt-6 flex flex-col divide-y divide-border">
          {bench.map((row) => (
            <li key={row.lawyer.id} className="py-4">
              <Collapsible>
                <CollapsibleTrigger className="group flex w-full cursor-pointer flex-col gap-3 rounded-sm text-left focus-ring">
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="t-body truncate">{row.lawyer.name}</span>
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180"
                      aria-hidden="true"
                    />
                  </div>
                  <CapacityMeter segments={row.segments} declared={row.declared} />
                  <span className="t-detail text-ink-2">{row.headline}</span>
                </CollapsibleTrigger>
                {row.matters.length > 0 && (
                  <CollapsiblePanel>
                    <ul className="mt-3 flex flex-col divide-y divide-rule-quiet border-l border-rule-quiet pl-4">
                      {row.matters.map((bm) => (
                        <BenchMatterRow key={bm.matter.id} bm={bm} room={room} dispatch={dispatch} />
                      ))}
                    </ul>
                  </CollapsiblePanel>
                )}
              </Collapsible>
            </li>
          ))}
        </ul>
      )}

      {unassigned.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="t-subhead">Unassigned</p>
          <p className="t-detail mt-2 text-ink-2">
            {unassigned.length} unplaced — {unassignedSplit.ready} ready to assign,{" "}
            {unassignedSplit.blocked} blocked.
          </p>
          <UnassignedList
            items={unassigned.slice(0, UNASSIGNED_PREVIEW)}
            room={room}
            dispatch={dispatch}
          />
          {unassigned.length > UNASSIGNED_PREVIEW && (
            <Collapsible className="mt-2">
              <CollapsibleTrigger className="t-detail cursor-pointer text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground">
                {unassigned.length - UNASSIGNED_PREVIEW} more unplaced
              </CollapsibleTrigger>
              <CollapsiblePanel>
                <UnassignedList
                  items={unassigned.slice(UNASSIGNED_PREVIEW)}
                  room={room}
                  dispatch={dispatch}
                />
              </CollapsiblePanel>
            </Collapsible>
          )}
        </div>
      )}

      {undecl.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="t-detail text-muted-foreground">
            {undecl.length} lawyer{undecl.length === 1 ? " hasn't" : "s haven't"} declared
            availability this week
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() =>
              undecl.forEach((l) =>
                dispatch({ type: "requestAvailability", lawyerId: l.id, lawyerName: l.name })
              )
            }
          >
            Request availability ({undecl.length})
          </Button>
        </div>
      )}

      {timedRows.length > 0 && (
        <Collapsible className="mt-8 -mx-4 border-t border-border pt-6">
          <CollapsibleTrigger className="t-detail cursor-pointer px-4 text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground">
            View all {timedRows.length} flagged matters
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <div className="mt-5">
              <MobileAttentionList rows={timedRows} candidates={room} dispatch={dispatch} />
            </div>
          </CollapsiblePanel>
        </Collapsible>
      )}
    </section>
  );
}
