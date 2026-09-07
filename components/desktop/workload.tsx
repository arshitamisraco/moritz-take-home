"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/desktop/section";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { DisclosureRow } from "@/components/ledger/disclosure-row";
import { ReassignMenu } from "@/components/ledger/reassign-menu";
import { DoneMarker } from "@/components/ledger/row-actions";
import { CapacityLegend, CapacityMeter } from "@/components/ledger/capacity-meter";
import { BenchMatterRow } from "@/components/ledger/bench-matter-row";
import { deadlineHorizons } from "@/lib/derive/deadlines";
import { benchRows, workloadVerdictParts, type BenchRow } from "@/lib/derive/bench-load";
import {
  unassignedAction,
  unassignedRowLabel,
  unassignedSummary,
  matterLabel,
} from "@/lib/derive/actions";
import { headroom, undeclared } from "@/lib/derive/bench";
import { exceptionQueue } from "@/lib/derive/matters";
import type { EffectiveFixture, EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";

/** Inline preview before the rest folds behind a disclosure — an overflow
 * firm can leave dozens of matters unplaced, and the homepage shouldn't
 * scroll forever to get past them. The bench has no such cap: it's bounded
 * by the roster, and capping it is what dropped Erik Solberg (125%, MSA
 * due in hours) out of the old card. */
const UNASSIGNED_PREVIEW = 6;

/**
 * The bench is a disclosure list. The trigger is the glance layer — name,
 * capacity meter, deadline headline — unchanged from before; the former
 * action slot is now a caret. Opening a row lists that lawyer's matters,
 * each carrying its own matter-scoped move (Reassign, or a static
 * "locked" label). Collapsible (components/ui) over a native <details> so
 * the panel animates its height open and shut.
 */
function Bench({
  rows,
  room,
  dispatch,
}: {
  rows: BenchRow[];
  room: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
}) {
  return (
    <ul className="mt-3 flex flex-col divide-y divide-border">
      {rows.map((row) => (
        <li key={row.lawyer.id} className="group/row py-3">
          <Collapsible>
            <DisclosureRow>
              <span className="t-body w-36 shrink-0 truncate">{row.lawyer.name}</span>
              <CapacityMeter
                segments={row.segments}
                declared={row.declared}
                className="w-40 shrink-0"
              />
              <span className="t-detail flex-1 text-ink-2">{row.headline}</span>
            </DisclosureRow>
            {row.matters.length > 0 && (
              <CollapsiblePanel>
                <ul className="ml-5 mt-3 flex flex-col divide-y divide-rule-quiet border-l border-rule-quiet pl-5">
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
  );
}

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
    <li className="group/row flex min-h-16 items-center justify-between gap-6 rounded-sm -mx-2 px-2 py-4 transition-wash hover:bg-accent">
      <div>
        <p className="t-detail text-ink-2">
          {unassignedRowLabel(m)}
          {act.kind === "assign" && act.suggestion && (
            <span className="text-muted-foreground"> · suggested {act.suggestion.lawyer.name}</span>
          )}
        </p>
        <p className="t-body">
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
    <ul className="mt-6 flex flex-col divide-y divide-border">
      {items.map((m) => (
        <UnassignedRow key={m.id} m={m} room={room} dispatch={dispatch} />
      ))}
    </ul>
  );
}

/**
 * Workload — "spot over-leveraged lawyers or looming deadlines at a
 * glance." One ranked list where capacity and deadline are the same
 * object: an over-committed lawyer, a segmented meter of the matters they
 * hold coloured by how soon each is due, a plain-text label, and the one
 * action that fits their situation.
 */
export function Workload({
  fx,
  dispatch,
}: {
  fx: EffectiveFixture;
  dispatch: (action: LedgerAction) => void;
}) {
  // Reassigning from an open panel can fold a lawyer back inside capacity
  // and drop them from overCommitted() mid-interaction. Remember every
  // bench id we've shown so benchRows re-emits their row (resolved) instead
  // of letting it vanish. Set union is idempotent, so adjusting state
  // during render here is safe — the extra pass just carries the new id in.
  const [sticky, setSticky] = useState<ReadonlySet<string>>(() => new Set());
  const bench = benchRows(fx, sticky);
  const seen = bench.filter((r) => !sticky.has(r.lawyer.id));
  if (seen.length > 0) setSticky(new Set([...sticky, ...seen.map((r) => r.lawyer.id)]));
  const verdict = workloadVerdictParts(fx);
  const horizons = deadlineHorizons(fx).filter((h) => h.count > 0);
  const room = headroom(fx);
  const undecl = undeclared(fx);
  const unassigned = exceptionQueue(fx);
  const unassignedSplit = unassignedSummary(unassigned);

  return (
    <Section
      id="workload"
      title="Workload"
      meta={
        horizons.length > 0
          ? horizons.map((h, i) => (
              <span key={h.label}>
                {i > 0 && " · "}
                {h.count} {h.label.toLowerCase()}
              </span>
            ))
          : undefined
      }
    >
        <p className="t-subhead text-pretty">{verdict.lead}</p>
        {verdict.room && <p className="t-detail mt-1 text-ink-2 text-pretty">{verdict.room}</p>}

        {undecl.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-6">
            <p className="t-detail text-muted-foreground">
              {undecl.length} lawyer{undecl.length === 1 ? " hasn't" : "s haven't"} declared
              availability this week
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" data-icon="inline-end">
                    Request availability ({undecl.length})
                    <ChevronDown className="size-3" aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 rounded-lg">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="rounded-md"
                    onClick={() =>
                      undecl.forEach((l) =>
                        dispatch({ type: "requestAvailability", lawyerId: l.id, lawyerName: l.name })
                      )
                    }
                  >
                    <span className="t-body">All {undecl.length}</span>
                  </DropdownMenuItem>
                  {undecl.map((l) => (
                    <DropdownMenuItem
                      key={l.id}
                      className="rounded-md"
                      onClick={() =>
                        dispatch({ type: "requestAvailability", lawyerId: l.id, lawyerName: l.name })
                      }
                    >
                      <span className="t-body">{l.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {bench.length > 0 && (
          <>
            <CapacityLegend className="mt-8" />
            <Bench rows={bench} room={room} dispatch={dispatch} />
          </>
        )}

        {unassigned.length > 0 && (
          <div className="mt-12 border-t border-border pt-8">
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
                <CollapsibleTrigger className="t-detail w-fit cursor-pointer rounded-sm text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground focus-ring">
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
    </Section>
  );
}
