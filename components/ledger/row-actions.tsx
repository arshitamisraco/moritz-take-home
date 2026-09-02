"use client";

import { ReassignMenu } from "@/components/ledger/reassign-menu";
import type { EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

function ActionLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="t-detail text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
    >
      {children}
    </button>
  );
}

function DoneMarker({ children }: { children: React.ReactNode }) {
  return <span className="t-eyebrow text-muted-foreground">{children}</span>;
}

/**
 * The row-level action bar — every link here does something, optimistically,
 * in the same overlay every other zone reads from. Nothing is decorative.
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
        "flex flex-wrap items-center gap-x-3 gap-y-1",
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
          <ActionLink onClick={() => dispatch({ type: "chase", matterId: matter.id, matterLabel: label })}>
            chase
          </ActionLink>
        ))}

      {isBreach &&
        (matter.conflictsExpedited ? (
          <DoneMarker>expedited</DoneMarker>
        ) : (
          <ActionLink onClick={() => dispatch({ type: "expedite", matterId: matter.id, matterLabel: label })}>
            expedite clearance
          </ActionLink>
        ))}

      {matter.halted ? (
        <DoneMarker>halted</DoneMarker>
      ) : (
        <ActionLink onClick={() => dispatch({ type: "halt", matterId: matter.id, matterLabel: label })}>
          halt work
        </ActionLink>
      )}

      {matter.escalated ? (
        <DoneMarker>escalated</DoneMarker>
      ) : (
        <ActionLink onClick={() => dispatch({ type: "escalate", matterId: matter.id, matterLabel: label })}>
          escalate
        </ActionLink>
      )}
    </div>
  );
}
