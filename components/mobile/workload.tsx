"use client";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ledger/status-badge";
import { ReassignMenu } from "@/components/ledger/reassign-menu";
import { MobileAttentionList } from "@/components/mobile/attention-list";
import { capacityOutliers } from "@/lib/derive/capacity";
import { deadlineHorizons, mostUrgent } from "@/lib/derive/deadlines";
import { overCommitted, headroom, undeclared } from "@/lib/derive/bench";
import { exceptionQueue, type AtRiskRow } from "@/lib/derive/matters";
import { dayLabel, unplacedReasonLabel } from "@/lib/format";
import type { EffectiveFixture, EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

const EXCEPTION_PREVIEW = 4;

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
    <ul className="mt-3 flex flex-col divide-y divide-border">
      {items.map((m) => (
        <li key={m.id} className="flex items-center justify-between gap-3 py-3">
          <div>
            <p className="t-detail">
              {m.name} <span className="text-muted-foreground">· {m.client}</span>
            </p>
            <p className="t-detail" style={{ color: "var(--ink-2)" }}>
              {unplacedReasonLabel(m.unplacedReason)}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
    <div className="relative h-1.5 flex-1 bg-accent">
      <div
        className={cn(
          "h-1.5",
          state === "breaking" ? "bg-breaking" : state === "straining" ? "bg-straining" : "bg-chart-4"
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

export function MobileWorkload({
  fx,
  rows,
  dispatch,
  onOpenMatter,
}: {
  fx: EffectiveFixture;
  rows: AtRiskRow[];
  dispatch: (action: LedgerAction) => void;
  onOpenMatter: (matterId: string) => void;
}) {
  const outliers = capacityOutliers(fx, 4);
  const capCeiling = Math.max(100, ...outliers.map((o) => o.pct));
  const over = overCommitted(fx);
  const room = headroom(fx);
  const undecl = undeclared(fx);
  const exceptions = exceptionQueue(fx);
  const horizons = deadlineHorizons(fx);
  const urgent = mostUrgent(fx, 3);
  const timedRows = rows.filter((r) => r.bucket !== "compliance");

  return (
    <section id="m-workload" className="border-b border-border px-4 py-7">
      <p className="t-eyebrow text-muted-foreground">Workload</p>

      <p className="t-body mt-3">
        {over.length} of {fx.lawyers.length} lawyers overloaded · {room.length} with headroom
      </p>
      <ul className="mt-5 flex flex-col gap-3">
        {outliers.map(({ lawyer, pct, state }) => (
          <li key={lawyer.id} className="flex items-center gap-2.5">
            <span className="t-detail w-24 shrink-0 truncate">{lawyer.name}</span>
            <CapacityBar pct={pct} ceiling={capCeiling} state={state} />
            <span className="t-detail w-9 shrink-0 text-right tabular-nums">{pct}%</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline gap-4 border-t border-border pt-5">
        {horizons.map((h) => (
          <div key={h.label} className="flex items-baseline gap-1">
            <span className="t-body">{h.count}</span>
            <span className="t-detail text-muted-foreground">{h.label.toLowerCase()}</span>
          </div>
        ))}
      </div>
      {urgent.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {urgent.map((r) => (
            <li key={r.matter.id}>
              <button
                type="button"
                onClick={() => onOpenMatter(r.matter.id)}
                className="flex w-full items-baseline justify-between gap-3 py-3 text-left"
              >
                <span className="t-detail">
                  {r.matter.name} <span className="text-muted-foreground">· {r.matter.client}</span>
                </span>
                <span className="t-detail shrink-0 text-muted-foreground">
                  {r.matter.deadlineOffsetMs !== null && dayLabel(r.matter.deadlineOffsetMs)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {exceptions.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="t-eyebrow text-muted-foreground">exception queue — {exceptions.length}</p>
          <ExceptionList items={exceptions.slice(0, EXCEPTION_PREVIEW)} room={room} dispatch={dispatch} />
          {exceptions.length > EXCEPTION_PREVIEW && (
            <details className="mt-1">
              <summary className="t-detail cursor-pointer text-[color:var(--ink-2)] underline decoration-1 underline-offset-[0.15em] hover:text-foreground">
                {exceptions.length - EXCEPTION_PREVIEW} more unplaced
              </summary>
              <ExceptionList items={exceptions.slice(EXCEPTION_PREVIEW)} room={room} dispatch={dispatch} />
            </details>
          )}
        </div>
      )}

      {undecl.length > 0 ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-6"
          onClick={() =>
            undecl.forEach((l) => dispatch({ type: "requestAvailability", lawyerId: l.id, lawyerName: l.name }))
          }
        >
          Request availability ({undecl.length})
        </Button>
      ) : (
        <p className="t-detail mt-6 text-muted-foreground">All availability declared</p>
      )}

      {timedRows.length > 0 && (
        <details className="mt-6 border-t border-border pt-5 -mx-4">
          <summary className="t-detail cursor-pointer px-4 text-[color:var(--ink-2)] underline decoration-1 underline-offset-[0.15em] hover:text-foreground">
            View all {timedRows.length} flagged matters
          </summary>
          <div className="mt-4">
            <MobileAttentionList rows={timedRows} dispatch={dispatch} onOpenMatter={onOpenMatter} />
          </div>
        </details>
      )}
    </section>
  );
}
