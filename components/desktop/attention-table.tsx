"use client";

import { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ledger/status-badge";
import { LoadRatio } from "@/components/ledger/load-ratio";
import { RowActions } from "@/components/ledger/row-actions";
import { attentionDetail } from "@/lib/derive/detail";
import type { AtRiskRow, TimeBucket } from "@/lib/derive/matters";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

const BUCKET_LABEL: Partial<Record<TimeBucket, string>> = {
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
  onOpenMatter,
}: {
  rows: AtRiskRow[];
  fx: EffectiveFixture;
  headroomList: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  onOpenMatter: (matterId: string) => void;
}) {
  if (rows.length === 0) {
    return null;
  }

  const withHeaders = rows.map((row, i) => ({
    row,
    showHeader: row.bucket !== "compliance" && row.bucket !== rows[i - 1]?.bucket,
  }));

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableBody>
          {withHeaders.map(({ row, showHeader }) => {
            const lawyer = lawyerName(fx, row.matter.effectiveLawyerId);

            return (
              <Fragment key={row.matter.id}>
                {showHeader && (
                  <TableRow key={`${row.bucket}-header`} className="border-b-0 hover:bg-transparent">
                    <TableCell colSpan={5} className="pt-6 pb-2 first:pt-0">
                      <span className="t-eyebrow text-muted-foreground">
                        {BUCKET_LABEL[row.bucket]}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  key={row.matter.id}
                  data-halted={row.matter.halted || undefined}
                  className="group/row h-11 cursor-pointer border-border hover:bg-transparent"
                  onClick={() => onOpenMatter(row.matter.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onOpenMatter(row.matter.id);
                  }}
                >
                  <TableCell className="w-[26%] py-3 align-top whitespace-normal">
                    <p className="t-body">{row.matter.name}</p>
                    <p className="t-detail text-muted-foreground">{row.matter.client}</p>
                  </TableCell>

                  <TableCell className="w-[10%] py-3 align-top">
                    {row.bucket === "compliance" ? (
                      <StatusBadge variant="breaking" label="compliance" />
                    ) : (
                      row.matter.deadlineKind && <StatusBadge variant={row.matter.deadlineKind} />
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "w-[28%] py-3 align-top whitespace-normal t-detail",
                      row.matter.halted && "line-through decoration-1"
                    )}
                    style={{ color: "var(--ink-2)" }}
                  >
                    {attentionDetail(row.matter, row.bucket)}
                  </TableCell>

                  <TableCell className="w-[16%] py-3 align-top">
                    {lawyer ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="t-body text-[14px]">{lawyer.name}</span>
                        <LoadRatio committed={lawyer.committedMatters} declared={lawyer.declaredAvailability} />
                      </div>
                    ) : (
                      <span className="t-detail text-muted-foreground">unassigned</span>
                    )}
                  </TableCell>

                  <TableCell
                    className="w-[20%] py-3 align-top text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
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
