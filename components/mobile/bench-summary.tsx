"use client";

import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import { headroom, overCommitted, undeclared } from "@/lib/derive/bench";
import { exceptionQueue } from "@/lib/derive/matters";
import type { LedgerAction } from "@/lib/state/types";

export function MobileBenchSummary({
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
    <section id="m-bench" className="border-b border-border px-4 py-4">
      <p className="t-eyebrow text-muted-foreground">Bench</p>
      <p className="t-body mt-2">
        {over.length} over committed · {room.length} with headroom
      </p>
      {exceptions.length > 0 && (
        <p className="t-detail mt-1" style={{ color: "var(--ink-2)" }}>
          {exceptions.length} unplaced in the exception queue
        </p>
      )}
      {undecl.length > 0 ? (
        <button
          type="button"
          onClick={() =>
            undecl.forEach((l) =>
              dispatch({ type: "requestAvailability", lawyerId: l.id, lawyerName: l.name })
            )
          }
          className="t-detail mt-2 text-foreground underline decoration-border underline-offset-4"
        >
          request availability from {undecl.length}
        </button>
      ) : (
        <p className="t-detail mt-2 text-muted-foreground">All availability declared</p>
      )}
    </section>
  );
}
