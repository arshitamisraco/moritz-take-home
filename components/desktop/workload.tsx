"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/ledger/status-badge";
import { ReassignMenu } from "@/components/ledger/reassign-menu";
import { AttentionTable } from "@/components/desktop/attention-table";
import { dayLabel, clockTime, unplacedReasonLabel } from "@/lib/format";
import { capacityOutliers } from "@/lib/derive/capacity";
import { deadlineHorizons, mostUrgent } from "@/lib/derive/deadlines";
import { overCommitted, headroom, undeclared } from "@/lib/derive/bench";
import { exceptionQueue, type AtRiskRow } from "@/lib/derive/matters";
import type { EffectiveFixture, EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

/** Inline preview before the rest folds behind a disclosure — an
 * overflow firm's exception queue can run to hundreds, and the homepage
 * shouldn't scroll forever to get past it. */
const EXCEPTION_PREVIEW = 6;

function ExceptionList({
  items,
  room,
  dispatch,
}: {
  items: EffectiveMatter[];
  room: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
}) {
  return (
    <ul className="mt-4 flex flex-col divide-y divide-border">
      {items.map((m) => (
        <li key={m.id} className="flex min-h-16 items-center justify-between gap-4 py-3">
          <div>
            <p className="t-body">
              {m.name} <span className="text-muted-foreground">· {m.client}</span>
            </p>
            <p className="t-detail text-ink-2">
              {unplacedReasonLabel(m.unplacedReason)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {m.deadlineKind && <StatusBadge variant={m.deadlineKind} />}
            <ReassignMenu
              candidates={room}
              onPick={(id, name) =>
                dispatch({
                  type: "reassign",
                  matterId: m.id,
                  matterLabel: `${m.name} · ${m.client}`,
                  toLawyerId: id,
                  toLawyerName: name,
                })
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Length encodes load. The track runs to `ceiling` (the highest ratio in
 * view, never below 100), so 167% and 133% render at different lengths; a
 * hairline marks the 100% line whenever anyone is over it.
 */
function CapacityBar({
  pct,
  ceiling,
  state,
}: {
  pct: number;
  ceiling: number;
  state: "steady" | "straining" | "breaking";
}) {
  return (
    <div className="relative h-1.5 w-full bg-accent">
      <div
        className={cn(
          "h-1.5",
          state === "breaking" ? "bg-breaking" : state === "straining" ? "bg-chart-2" : "bg-chart-4"
        )}
        style={{ width: `${(pct / ceiling) * 100}%` }}
      />
      {ceiling > 100 && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-px bg-ink-3"
          style={{ left: `${(100 / ceiling) * 100}%` }}
        />
      )}
    </div>
  );
}

/**
 * Workload — the most real estate after the hero, because capacity and
 * deadlines interact: who's overloaded and what's due both answer "can
 * this firm absorb what's in front of it right now."
 */
export function Workload({
  fx,
  rows,
  dispatch,
}: {
  fx: EffectiveFixture;
  rows: AtRiskRow[];
  dispatch: (action: LedgerAction) => void;
}) {
  const outliers = capacityOutliers(fx);
  const capCeiling = Math.max(100, ...outliers.map((o) => o.pct));
  const over = overCommitted(fx);
  const room = headroom(fx);
  const undecl = undeclared(fx);
  const exceptions = exceptionQueue(fx);
  const horizons = deadlineHorizons(fx);
  const urgent = mostUrgent(fx);
  const timedRows = rows.filter((r) => r.bucket !== "compliance");

  return (
    <Card id="workload" aria-label="Workload" className="mt-8">
      <CardHeader>
        <h2 className="t-section">Workload</h2>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-2 gap-16">
        <div>
          <p className="t-eyebrow text-muted-foreground">Lawyer capacity — {over.length} overloaded</p>
          <ul className="mt-6 flex flex-col gap-4">
            {outliers.map(({ lawyer, pct, state }) => (
              <li key={lawyer.id} className="flex items-center gap-3">
                <span className="t-body w-32 shrink-0 truncate">{lawyer.name}</span>
                <CapacityBar pct={pct} ceiling={capCeiling} state={state} />
                <span className="t-detail w-10 shrink-0 text-right tabular-nums">{pct}%</span>
                {state !== "steady" && <StatusBadge variant={state} />}
              </li>
            ))}
          </ul>
          <p className="t-detail mt-6 text-muted-foreground">
            {over.length} of {fx.lawyers.length} lawyers over committed · {room.length} with headroom
          </p>
        </div>

        <div>
          <p className="t-eyebrow text-muted-foreground">Upcoming deadlines</p>
          <div className="mt-6 flex items-baseline gap-8">
            {horizons.map((h) => (
              <div key={h.label} className="flex items-baseline gap-1.5">
                <span className="t-figure text-[28px]">{h.count}</span>
                <span className="t-detail text-muted-foreground">{h.label.toLowerCase()}</span>
              </div>
            ))}
          </div>
          {urgent.length > 0 ? (
            <ul className="mt-6 flex flex-col divide-y divide-border">
              {urgent.map((r) => (
                <li key={r.matter.id} className="flex h-11 items-center justify-between gap-3">
                  <span className="t-body">
                    {r.matter.name} <span className="text-muted-foreground">· {r.matter.client}</span>
                  </span>
                  <span className="t-detail shrink-0 text-muted-foreground">
                    {r.matter.deadlineOffsetMs !== null && (
                      <>
                        {dayLabel(r.matter.deadlineOffsetMs)}, {clockTime(r.matter.deadlineOffsetMs)}
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-detail mt-6 text-muted-foreground">No deadlines flagged this week</p>
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <p className="t-eyebrow text-muted-foreground">exception queue — {exceptions.length} awaiting placement</p>
          {undecl.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" data-icon="inline-end">
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
                    <span className="t-body text-[14px]">All {undecl.length}</span>
                  </DropdownMenuItem>
                  {undecl.map((l) => (
                    <DropdownMenuItem
                      key={l.id}
                      className="rounded-md"
                      onClick={() =>
                        dispatch({ type: "requestAvailability", lawyerId: l.id, lawyerName: l.name })
                      }
                    >
                      <span className="t-body text-[14px]">{l.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {exceptions.length === 0 ? (
          <p className="t-detail mt-4 text-muted-foreground">Nothing unplaced</p>
        ) : (
          <>
            <ExceptionList items={exceptions.slice(0, EXCEPTION_PREVIEW)} room={room} dispatch={dispatch} />
            {exceptions.length > EXCEPTION_PREVIEW && (
              <details className="mt-1">
                <summary className="t-detail cursor-pointer text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground focus-ring rounded-sm w-fit">
                  {exceptions.length - EXCEPTION_PREVIEW} more unplaced
                </summary>
                <ExceptionList items={exceptions.slice(EXCEPTION_PREVIEW)} room={room} dispatch={dispatch} />
              </details>
            )}
          </>
        )}
        {undecl.length > 0 && (
          <p className="t-detail mt-4 text-muted-foreground">
            {undecl.length} lawyer{undecl.length === 1 ? "" : "s"} haven&apos;t declared availability this week
          </p>
        )}
      </div>

      {timedRows.length > 0 && (
        <details className="mt-12 border-t border-border pt-6">
          <summary className="t-detail cursor-pointer text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground focus-ring rounded-sm w-fit">
            View all {timedRows.length} flagged matters
          </summary>
          <div className="mt-6">
            <AttentionTable rows={rows} fx={fx} headroomList={room} dispatch={dispatch} />
          </div>
        </details>
      )}
      </CardContent>
    </Card>
  );
}
