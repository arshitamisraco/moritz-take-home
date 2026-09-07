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
import { promiseClockPct } from "@/lib/derive/matters";
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

/**
 * Rows sit one level in from their bucket heading, and the rule that
 * separates two of them starts at that indent rather than at the table
 * edge — so the divider reads as "inside this group", not as a seam
 * between groups. Cells carry it instead of the <tr> because a row
 * border always spans the full table; the lead cell draws its share as
 * an inset pseudo-rule so the line begins where the text does.
 */
const ROW_INDENT = "pl-4";

function AttentionRow({
  row,
  fx,
  headroomList,
  dispatch,
  lastInGroup,
}: {
  row: AtRiskRow;
  fx: EffectiveFixture;
  headroomList: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  lastInGroup: boolean;
}) {
  const lawyer = lawyerName(fx, row.matter.effectiveLawyerId);
  const clockPct = promiseClockPct(row.matter);
  const overPromise = clockPct !== null && clockPct > 100;
  const rule = lastInGroup ? "" : "border-b border-rule-quiet";
  const leadRule = lastInGroup
    ? ""
    : "relative after:pointer-events-none after:absolute after:bottom-0 after:left-4 after:right-0 after:h-px after:bg-rule-quiet";

  return (
    <TableRow
      data-halted={row.matter.halted || undefined}
      className={cn(
        "group/row border-0 transition-wash",
        row.bucket === "compliance" ? "hover:bg-surface-active" : "hover:bg-accent"
      )}
    >
      <TableCell className={cn("w-[28%] py-5 align-top whitespace-normal", ROW_INDENT, leadRule)}>
        <p className="t-body">{row.matter.name}</p>
        <p className="t-detail text-muted-foreground">{row.matter.client}</p>
      </TableCell>

      <TableCell
        className={cn(
          "w-[32%] py-5 align-top whitespace-normal t-detail",
          rule,
          overPromise ? "text-breaking" : "text-ink-2",
          row.matter.halted && "line-through decoration-1"
        )}
      >
        {attentionDetail(row.matter, row.bucket)}
      </TableCell>

      <TableCell className={cn("w-[16%] py-5 align-top", rule)}>
        {lawyer ? (
          <div className="flex items-baseline gap-1.5">
            <span className="t-body">{lawyer.name}</span>
            <LoadRatio committed={lawyer.committedMatters} declared={lawyer.declaredAvailability} />
          </div>
        ) : (
          <span className="t-detail text-muted-foreground">unassigned</span>
        )}
      </TableCell>

      {/* No fixed width: the action cell takes what the three sized columns
          leave and never wraps its two controls, so at tablet the detail
          column gives way instead of Chase / More stacking. */}
      <TableCell className={cn("py-5 align-top text-right whitespace-nowrap", rule)}>
        <RowActions
          matter={row.matter}
          candidates={headroomList}
          dispatch={dispatch}
          reveal="always"
          className="flex-nowrap justify-end"
        />
      </TableCell>
    </TableRow>
  );
}

export function AttentionTable({
  rows,
  fx,
  headroomList,
  dispatch,
  counts,
}: {
  rows: AtRiskRow[];
  fx: EffectiveFixture;
  headroomList: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  /** Group totals for the whole tier. The page renders a truncated slice,
   * so counting the rows in hand would print "Today · 1" over a group that
   * actually holds four. Omitted when `rows` is the complete list. */
  counts?: Partial<Record<TimeBucket, number>>;
}) {
  if (rows.length === 0) {
    return null;
  }

  const bucketCounts =
    counts ??
    rows.reduce<Partial<Record<TimeBucket, number>>>((acc, row) => {
      acc[row.bucket] = (acc[row.bucket] ?? 0) + 1;
      return acc;
    }, {});

  const withHeaders = rows.map((row, i) => ({
    row,
    showHeader: row.bucket !== rows[i - 1]?.bucket,
    /** Only the very first group sits flush; the rest need air above them. */
    firstGroup: i === 0,
    lastInGroup: row.bucket !== rows[i + 1]?.bucket,
  }));

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableBody>
          {withHeaders.map(({ row, showHeader, firstGroup, lastInGroup }) => (
            <Fragment key={row.matter.id}>
              {showHeader && (
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className={cn(
                      "border-b border-rule-quiet pb-3",
                      firstGroup ? "pt-0" : "pt-6"
                    )}
                  >
                    <span className="t-subhead text-muted-foreground">
                      {BUCKET_LABEL[row.bucket]} · {bucketCounts[row.bucket]}
                    </span>
                  </TableCell>
                </TableRow>
              )}
              <AttentionRow
                row={row}
                fx={fx}
                headroomList={headroomList}
                dispatch={dispatch}
                lastInGroup={lastInGroup}
              />
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
