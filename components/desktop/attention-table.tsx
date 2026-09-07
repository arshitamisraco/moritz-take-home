"use client";

import { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { LoadRatio } from "@/components/ledger/load-ratio";
import { RowActions } from "@/components/ledger/row-actions";
import { attentionDetail } from "@/lib/derive/detail";
import type { AtRiskRow, TimeBucket } from "@/lib/derive/matters";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
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

function lawyerName(fx: EffectiveFixture, id: string | null) {
  if (!id) return null;
  return fx.lawyers.find((l) => l.id === id) ?? null;
}

export function AttentionTable({
  rows,
  fx,
  headroomList,
  dispatch,
}: {
  rows: AtRiskRow[];
  fx: EffectiveFixture;
  headroomList: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
}) {
  if (rows.length === 0) {
    return null;
  }

  const withHeaders = rows.map((row, i) => ({
    row,
    showHeader: row.bucket !== rows[i - 1]?.bucket,
    /** Only the very first group sits flush; the rest need air above them. */
    firstGroup: i === 0,
  }));

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableBody>
          {withHeaders.map(({ row, showHeader, firstGroup }) => {
            const lawyer = lawyerName(fx, row.matter.effectiveLawyerId);

            return (
              <Fragment key={row.matter.id}>
                {showHeader && (
                  <TableRow key={`${row.bucket}-header`} className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={4} className={cn("pb-4", firstGroup ? "pt-0" : "pt-12")}>
                      <span className="t-subhead text-muted-foreground">
                        {BUCKET_LABEL[row.bucket]}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  key={row.matter.id}
                  data-halted={row.matter.halted || undefined}
                  className={cn(
                    "group/row h-20 border-border transition-wash",
                    row.bucket === "compliance" ? "hover:bg-surface-active" : "hover:bg-accent"
                  )}
                >
                  <TableCell className="w-[30%] py-5 align-top whitespace-normal">
                    <p className="t-body">{row.matter.name}</p>
                    <p className="t-detail text-muted-foreground">{row.matter.client}</p>
                  </TableCell>

                  <TableCell
                    className={cn(
                      "w-[34%] py-5 align-top whitespace-normal t-detail text-ink-2",
                      row.matter.halted && "line-through decoration-1"
                    )}
                  >
                    {attentionDetail(row.matter, row.bucket)}
                  </TableCell>

                  <TableCell className="w-[16%] py-5 align-top">
                    {lawyer ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="t-body">{lawyer.name}</span>
                        <LoadRatio committed={lawyer.committedMatters} declared={lawyer.declaredAvailability} />
                      </div>
                    ) : (
                      <span className="t-detail text-muted-foreground">unassigned</span>
                    )}
                  </TableCell>

                  <TableCell className="w-[20%] py-5 align-top text-right">
                    <RowActions
                      matter={row.matter}
                      candidates={headroomList}
                      dispatch={dispatch}
                      reveal="hover"
                      className="justify-end"
                    />
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
