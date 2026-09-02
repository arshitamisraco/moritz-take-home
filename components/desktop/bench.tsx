"use client";

import { Separator } from "@/components/ui/separator";
import { LoadRatio } from "@/components/ledger/load-ratio";
import { StatusBadge } from "@/components/ledger/status-badge";
import { unplacedReasonLabel } from "@/lib/format";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import { headroom, overCommitted, undeclared } from "@/lib/derive/bench";
import { exceptionQueue } from "@/lib/derive/matters";
import type { LedgerAction } from "@/lib/state/types";
import { ReassignMenu } from "@/components/ledger/reassign-menu";

export function Bench({
  fx,
  dispatch,
}: {
  fx: EffectiveFixture;
  dispatch: (action: LedgerAction) => void;
}) {
  const over = overCommitted(fx);
  const room = headroom(fx);
  const undecl = undeclared(fx);
  const exceptions = exceptionQueue(fx);

  return (
    <section aria-label="Bench" className="flex flex-col">
      <h2 className="t-section">Bench</h2>
      <Separator className="mt-4" />

      <div className="mt-4 grid grid-cols-2 divide-x divide-border">
        <div className="flex flex-col gap-3 pr-6">
          <p className="t-eyebrow text-muted-foreground">over committed — {over.length}</p>
          {over.length === 0 ? (
            <p className="t-detail text-muted-foreground">Nothing over committed</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {over.map(({ lawyer }) => (
                <li key={lawyer.id} className="flex items-center justify-between gap-3 py-1">
                  <span className="t-body">{lawyer.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="t-detail text-muted-foreground">{lawyer.office}</span>
                    <LoadRatio committed={lawyer.committedMatters} declared={lawyer.declaredAvailability} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3 pl-6">
          <p className="t-eyebrow text-muted-foreground">headroom — {room.length}</p>
          {room.length === 0 ? (
            <p className="t-detail text-muted-foreground">No headroom available</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {room.map(({ lawyer }) => (
                <li key={lawyer.id} className="flex items-center justify-between gap-3 py-1">
                  <span className="t-body">{lawyer.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="t-detail text-muted-foreground">{lawyer.office}</span>
                    <LoadRatio committed={lawyer.committedMatters} declared={lawyer.declaredAvailability} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <p className="t-detail text-muted-foreground">
          {undecl.length === 0
            ? "All availability declared"
            : `${undecl.length} lawyer${undecl.length === 1 ? "" : "s"} haven't declared availability`}
        </p>
        {undecl.length > 0 && (
          <div className="flex items-center gap-3">
            {undecl.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => dispatch({ type: "requestAvailability", lawyerId: l.id, lawyerName: l.name })}
                className="t-detail text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
              >
                request {l.name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <p className="t-eyebrow text-muted-foreground">exception queue — {exceptions.length}</p>
        {exceptions.length === 0 ? (
          <p className="t-detail mt-3 text-muted-foreground">Nothing unplaced</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {exceptions.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="t-body">
                    {m.name} <span className="text-muted-foreground">· {m.client}</span>
                  </p>
                  <p className="t-detail" style={{ color: "var(--ink-2)" }}>
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
        )}
      </div>
    </section>
  );
}
