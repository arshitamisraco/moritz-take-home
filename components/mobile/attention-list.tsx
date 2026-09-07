"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ReassignMenu } from "@/components/ledger/reassign-menu";
import { DoneMarker } from "@/components/ledger/row-actions";
import { LoadRatio } from "@/components/ledger/load-ratio";
import { attentionDetail } from "@/lib/derive/detail";
import { matterAction, matterLabel, DONE_LABEL } from "@/lib/derive/actions";
import { promiseClockPct } from "@/lib/derive/matters";
import type { AtRiskRow, TimeBucket } from "@/lib/derive/matters";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

const BUCKET_LABEL: Record<TimeBucket, string> = {
  compliance: "Compliance",
  overdue: "Overdue",
  next4h: "Next 4 hours",
  today: "Today",
  thisWeek: "This week",
};

/**
 * Mobile chrome over the shared selection: matterAction picks one verb per
 * matter row, and a More dropdown below the tap target holds the rest —
 * Reassign (as a submenu), Halt work and Escalate, none of which were
 * reachable anywhere on mobile before.
 */
export function MobileAttentionList({
  rows,
  candidates,
  dispatch,
  counts,
}: {
  rows: AtRiskRow[];
  candidates: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  /** Group totals for the whole tier — see AttentionTable. */
  counts?: Partial<Record<TimeBucket, number>>;
}) {
  const bucketCounts =
    counts ??
    rows.reduce<Partial<Record<TimeBucket, number>>>((acc, row) => {
      acc[row.bucket] = (acc[row.bucket] ?? 0) + 1;
      return acc;
    }, {});

  const withHeaders = rows.map((row, i) => ({
    row,
    showHeader: row.bucket !== rows[i - 1]?.bucket,
    lastInGroup: row.bucket !== rows[i + 1]?.bucket,
  }));

  return (
    <ul className="flex flex-col">
      {withHeaders.map(({ row, showHeader, lastInGroup }) => {
        const m = row.matter;
        const { primary, primaryDone, overflow } = matterAction(row, candidates);
        const reassignTo = (id: string, name: string) =>
          dispatch({
            type: "reassign",
            matterId: m.id,
            matterLabel: matterLabel(m),
            toLawyerId: id,
            toLawyerName: name,
          });
        const isPickerPrimary = primary.kind === "reassign" || primary.kind === "assign";
        const menuItems = overflow.filter((it) => !it.destructive);
        const destructiveItems = overflow.filter((it) => it.destructive);
        const clockPct = promiseClockPct(m);
        const overPromise = clockPct !== null && clockPct > 100;

        return (
          <li key={m.id}>
            {showHeader && (
              <p className="t-subhead border-b border-rule-quiet px-4 pt-5 pb-3 text-muted-foreground">
                {BUCKET_LABEL[row.bucket]} · {bucketCounts[row.bucket]}
              </p>
            )}
            {/* Matters sit one level in from their bucket heading, and the
                rule between two of them starts at that indent — inside the
                group rather than across it. */}
            <div className={cn("ml-4", !lastInGroup && "border-b border-rule-quiet")}>
              <div className="flex w-full flex-col gap-2 pr-4 pt-5 pb-3">
                <p className="t-body">{m.name}</p>
                <p className="t-detail text-muted-foreground">{m.client}</p>
                <p
                  className={cn(
                    "t-detail",
                    overPromise ? "text-breaking" : "text-ink-2",
                    m.halted && "line-through decoration-1"
                  )}
                >
                  {attentionDetail(m, row.bucket)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pr-4 pb-5">
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
                        <Button variant="ghost" data-icon="inline-end">
                          More
                          <ChevronDown className="size-3" aria-hidden="true" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="start" className="w-52 rounded-lg">
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
