"use client";

import { Button } from "@/components/ui/button";
import { ReassignMenu } from "@/components/ledger/reassign-menu";
import type { EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

function DoneMarker({ children }: { children: React.ReactNode }) {
  return <span className="t-eyebrow text-muted-foreground">{children}</span>;
}

/**
 * The row-level action bar — every control here acts, optimistically, in the
 * same overlay every other zone reads from. No icons (this is a ledger row),
 * no underlines (nothing here reveals or navigates — Reassign is the one
 * disclosure and it carries its own caret). Tiers follow the Sheet mapping:
 * Reassign secondary · Chase ghost · Expedite ghost · Halt work / Escalate
 * destructive.
 */
export function RowActions({
  matter,
  candidates,
  dispatch,
  reveal = "always",
  className,
}: {
  matter: EffectiveMatter;
  candidates: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  /** "hover" fades the bar in on row hover/focus; "always" (the Sheet) keeps it visible. */
  reveal?: "hover" | "always";
  className?: string;
}) {
  const label = `${matter.name} · ${matter.client}`;
  const isOpen = matter.status === "open";
  const isBreach = !matter.conflictsCleared && matter.workStarted;
  const isAssigned = matter.effectiveLawyerId !== null;

  if (!isOpen) {
    return <span className="t-detail text-muted-foreground">delivered</span>;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1",
        reveal === "hover" &&
          "opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100",
        className
      )}
    >
      <ReassignMenu
        candidates={candidates}
        onPick={(id, name) =>
          dispatch({ type: "reassign", matterId: matter.id, matterLabel: label, toLawyerId: id, toLawyerName: name })
        }
      />

      {isAssigned &&
        (matter.chased ? (
          <DoneMarker>chased</DoneMarker>
        ) : (
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "chase", matterId: matter.id, matterLabel: label })}
          >
            Chase
          </Button>
        ))}

      {isBreach &&
        (matter.conflictsExpedited ? (
          <DoneMarker>expedited</DoneMarker>
        ) : (
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "expedite", matterId: matter.id, matterLabel: label })}
          >
            Expedite clearance
          </Button>
        ))}

      {matter.halted ? (
        <DoneMarker>halted</DoneMarker>
      ) : (
        <Button
          variant="destructive"
          onClick={() => dispatch({ type: "halt", matterId: matter.id, matterLabel: label })}
        >
          Halt work
        </Button>
      )}

      {matter.escalated ? (
        <DoneMarker>escalated</DoneMarker>
      ) : (
        <Button
          variant="destructive"
          onClick={() => dispatch({ type: "escalate", matterId: matter.id, matterLabel: label })}
        >
          Escalate
        </Button>
      )}
    </div>
  );
}
