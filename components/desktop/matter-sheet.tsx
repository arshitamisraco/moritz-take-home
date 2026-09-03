"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ledger/status-badge";
import { LoadRatio } from "@/components/ledger/load-ratio";
import { RowActions } from "@/components/ledger/row-actions";
import { MARGIN_FLOOR_PCT } from "@/lib/derive/thresholds";
import { formatPct, formatUsd, clockTime, dayLabel } from "@/lib/format";
import type { EffectiveFixture, EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { ActivityEvent } from "@/lib/fixture/types";
import type { LedgerAction } from "@/lib/state/types";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<string, string> = {
  opened: "opened",
  conflicts_cleared: "conflicts cleared",
  filing_sent: "filing sent",
  delivered: "delivered",
  meeting: "meeting",
  onboarding: "onboarding",
  reassigned: "reassigned",
  chased: "chased",
  halted: "halted",
  escalated: "escalated",
  conflicts_expedited: "conflicts expedited",
  availability_requested: "availability requested",
};

const TYPE_LABEL: Record<string, string> = {
  incorporation: "Incorporation",
  safe: "SAFE",
  financing: "Financing",
  msa: "MSA",
  employment: "Employment agreement",
  option_grant: "Option grant",
  filing: "Statutory filing",
};

export function MatterSheet({
  matter,
  fx,
  activity,
  headroomList,
  dispatch,
  onOpenChange,
}: {
  matter: EffectiveMatter | null;
  fx: EffectiveFixture;
  activity: ActivityEvent[];
  headroomList: LawyerLoad[];
  dispatch: (action: LedgerAction) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const lawyer = matter?.effectiveLawyerId
    ? fx.lawyers.find((l) => l.id === matter.effectiveLawyerId) ?? null
    : null;

  const history = matter
    ? activity.filter((e) => e.matterId === matter.id).sort((a, b) => b.offsetMs - a.offsetMs)
    : [];

  const belowFloor = matter ? matter.marginPct < MARGIN_FLOOR_PCT : false;
  const isBreach = matter ? !matter.conflictsCleared && matter.workStarted : false;

  return (
    <Sheet open={matter !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto rounded-none sm:max-w-md">
        {matter && (
          <>
            <SheetHeader className="gap-1 border-b border-border pb-6">
              <SheetTitle className="t-section text-left font-normal">{matter.name}</SheetTitle>
              <SheetDescription className="t-body text-left text-muted-foreground">
                {matter.client}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-6 py-8">
              <Field label="type">
                <span className="t-body">{TYPE_LABEL[matter.type]}</span>
              </Field>

              <Field label="price">
                <span className="t-body tabular-nums">{formatUsd(matter.price)}</span>
              </Field>

              <Field label="lawyer">
                {lawyer ? (
                  <div className="flex items-baseline gap-2">
                    <span className="t-body">{lawyer.name}</span>
                    <LoadRatio committed={lawyer.committedMatters} declared={lawyer.declaredAvailability} />
                  </div>
                ) : (
                  <span className="t-body text-muted-foreground">unassigned</span>
                )}
              </Field>

              <Field label="deadline">
                <div className="flex items-center gap-2">
                  {matter.deadlineKind && <StatusBadge variant={matter.deadlineKind} />}
                  <span
                    className={cn("t-detail", matter.halted && "line-through decoration-1")}
                    style={{ color: "var(--ink-2)" }}
                  >
                    {matter.deadlineOffsetMs !== null
                      ? `${dayLabel(matter.deadlineOffsetMs)} ${clockTime(matter.deadlineOffsetMs)}`
                      : "no deadline tracked"}
                  </span>
                </div>
              </Field>

              <Field label="margin">
                <div className="flex items-baseline gap-2">
                  <span className={cn("t-body tabular-nums", belowFloor && "text-breaking")}>
                    {formatPct(matter.marginPct)}
                  </span>
                  <span className="t-detail text-muted-foreground">
                    against {MARGIN_FLOOR_PCT}% floor
                  </span>
                </div>
              </Field>

              <Field label="conflicts">
                <span className="t-body">
                  {matter.conflictsCleared
                    ? "cleared"
                    : matter.conflictsExpedited
                      ? "not cleared — expedited"
                      : "not cleared"}
                  {isBreach && (
                    <span className="t-detail ml-2" style={{ color: "var(--ink-2)" }}>
                      work started before clearance
                    </span>
                  )}
                </span>
              </Field>

              <Separator />

              <div className="flex flex-col gap-3">
                <p className="t-eyebrow text-muted-foreground">actions</p>
                <RowActions
                  matter={matter}
                  candidates={headroomList}
                  dispatch={dispatch}
                  reveal="always"
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <p className="t-eyebrow text-muted-foreground">history</p>
                {history.length === 0 ? (
                  <p className="t-detail text-muted-foreground">No recorded activity</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {history.map((e) => (
                      <li key={e.id} className="flex items-baseline justify-between gap-3">
                        <span className="t-detail">{KIND_LABEL[e.kind] ?? e.kind}</span>
                        <span className="t-detail shrink-0 text-muted-foreground tabular-nums">
                          {e.offsetMs <= 0 ? clockTime(e.offsetMs) : "now"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="t-eyebrow w-20 shrink-0 pt-0.5 text-muted-foreground">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}
