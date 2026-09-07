"use client";

import { Button } from "@/components/ui/button";
import { ReassignMenu } from "@/components/ledger/reassign-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { LoadRatio } from "@/components/ledger/load-ratio";
import { matterAction, matterLabel, DONE_LABEL } from "@/lib/derive/actions";
import { bucketFor } from "@/lib/derive/matters";
import type { EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

export function DoneMarker({ children }: { children: React.ReactNode }) {
  return <span className="t-subhead text-muted-foreground">{children}</span>;
}

/**
 * The row-level action bar — one primary control plus a More trigger
 * holding the rest, so hovering a row never produces a wall of buttons
 * (and never two destructive ones side by side). The verb and the
 * overflow both come from matterAction, the same selection the mobile
 * attention list runs. No icons (this is a ledger row) — the More trigger
 * carries the ChevronDown caret that Reassign already established as the
 * disclosure affordance. Halt work / Escalate sit below a separator and
 * keep destructive styling on the item.
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
  const label = matterLabel(matter);

  if (matter.status !== "open") {
    return <span className="t-detail text-muted-foreground">delivered</span>;
  }

  const { primary, primaryDone, overflow } = matterAction(
    { matter, bucket: bucketFor(matter) ?? "thisWeek" },
    candidates
  );

  const reassignTo = (id: string, name: string) =>
    dispatch({
      type: "reassign",
      matterId: matter.id,
      matterLabel: label,
      toLawyerId: id,
      toLawyerName: name,
    });

  const isPickerPrimary = primary.kind === "reassign" || primary.kind === "assign";
  const menuItems = overflow.filter((it) => !it.destructive);
  const destructiveItems = overflow.filter((it) => it.destructive);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1",
        reveal === "hover" &&
          "opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100",
        className
      )}
    >
      {isPickerPrimary ? (
        <ReassignMenu
          label={primary.kind === "assign" ? "Assign" : "Reassign"}
          candidates={candidates}
          onPick={reassignTo}
        />
      ) : primaryDone ? (
        <DoneMarker>{DONE_LABEL[primary.kind as "chase" | "expedite"]}</DoneMarker>
      ) : (
        <Button variant="ghost" onClick={() => primary.action && dispatch(primary.action)}>
          {primary.label}
        </Button>
      )}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" data-icon="inline-end">
                More
                <ChevronDown className="size-3" aria-hidden="true" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52 rounded-lg">
            <DropdownMenuGroup>
              {menuItems.map((it) =>
                it.kind === "reassign" ? (
                  <DropdownMenuSub key="reassign">
                    <DropdownMenuSubTrigger>Reassign</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56">
                      <DropdownMenuLabel className="t-subhead text-muted-foreground">
                        headroom
                      </DropdownMenuLabel>
                      {candidates.map(({ lawyer }) => (
                        <DropdownMenuItem
                          key={lawyer.id}
                          onClick={() => reassignTo(lawyer.id, lawyer.name)}
                          className="flex items-center justify-between gap-3 rounded-md"
                        >
                          <span className="t-body">{lawyer.name}</span>
                          <LoadRatio
                            committed={lawyer.committedMatters}
                            declared={lawyer.declaredAvailability}
                          />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem
                    key={it.kind}
                    className="rounded-md"
                    onClick={() => it.action && dispatch(it.action)}
                  >
                    {it.label}
                  </DropdownMenuItem>
                )
              )}
              {destructiveItems.length > 0 && <DropdownMenuSeparator />}
              {destructiveItems.map((it) => (
                <DropdownMenuItem
                  key={it.kind}
                  className="rounded-md text-destructive"
                  onClick={() => it.action && dispatch(it.action)}
                >
                  {it.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
