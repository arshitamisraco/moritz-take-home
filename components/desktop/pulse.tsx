"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { DisclosureRow } from "@/components/ledger/disclosure-row";
import { Section } from "@/components/desktop/section";
import { clockTime, pastDayLabel } from "@/lib/format";
import { groupByDay, pulseWindow, PULSE_KINDS, type PulseKind } from "@/lib/derive/pulse";
import type { ActivityEvent } from "@/lib/fixture/types";

const PULSE_KIND_LABEL: Record<PulseKind, string> = {
  filing_sent: "filings sent",
  meeting: "meetings",
  opened: "opened",
  onboarding: "onboardings",
};

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

/** Today plus three days collapsed; "Load older" reveals the rest of the 7. */
const INITIAL_DAYS = 4;

function comparisonLine(total: number, changePct: number): string {
  if (changePct === 0) return `${total} events · even with the previous 7 days`;
  const dir = changePct > 0 ? "ahead of" : "behind";
  return `${total} events · ${Math.abs(changePct)}% ${dir} the previous 7 days`;
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="t-detail w-12 shrink-0 tabular-nums text-muted-foreground">
        {event.offsetMs >= 0 ? "now" : clockTime(event.offsetMs)}
      </span>
      <span className="t-eyebrow shrink-0 text-muted-foreground">
        {KIND_LABEL[event.kind] ?? event.kind}
      </span>
      <span className="t-detail flex-1 truncate text-right">{event.detail}</span>
    </li>
  );
}

/**
 * Firm pulse on one rolling 7-day window. The log is the body of the
 * card, chunked by day — today open, earlier days collapsed to a
 * one-line count.
 */
export function Pulse({ events }: { events: ActivityEvent[] }) {
  const [shownDays, setShownDays] = useState(INITIAL_DAYS);

  const pulse = useMemo(() => pulseWindow(events), [events]);
  const groups = useMemo(() => groupByDay(events), [events]);

  const visible = groups.slice(0, shownDays);

  return (
    <Section id="pulse" title="Firm pulse" meta="Last 7 days">
        <p className="t-detail text-muted-foreground">
          {comparisonLine(pulse.total, pulse.changePct)}
        </p>

        <div className="mt-4 grid grid-cols-4 gap-4">
          {PULSE_KINDS.map((kind) => (
            <div key={kind} className="flex flex-col gap-1">
              <p className="t-figure-sm">{pulse.byKind[kind]}</p>
              <p className="t-eyebrow text-muted-foreground">{PULSE_KIND_LABEL[kind]}</p>
            </div>
          ))}
        </div>

        <p className="t-subhead mt-8">Latest activity</p>

        <div className="mt-3 flex flex-col divide-y divide-border">
          {visible.map((group, i) => (
            <Collapsible key={group.offsetMs} defaultOpen={i === 0} className="py-1">
              <DisclosureRow>
                <span className="t-body">{pastDayLabel(group.offsetMs)}</span>
              </DisclosureRow>
              <CollapsiblePanel>
                {group.events.length > 0 ? (
                  <ul className="flex flex-col divide-y divide-rule-quiet pb-1 pl-3">
                    {group.events.map((e) => (
                      <ActivityRow key={e.id} event={e} />
                    ))}
                  </ul>
                ) : (
                  <p className="t-detail pb-2 pl-3 text-muted-foreground">No activity</p>
                )}
              </CollapsiblePanel>
            </Collapsible>
          ))}
        </div>

        {shownDays < groups.length && (
          <Button
            variant="link"
            onClick={() => setShownDays((n) => Math.min(n + 3, groups.length))}
            className="mt-4"
          >
            Load older ›
          </Button>
        )}
    </Section>
  );
}
