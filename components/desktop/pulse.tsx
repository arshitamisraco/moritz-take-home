"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { Section } from "@/components/desktop/section";
import { clockTime, pastDayLabel } from "@/lib/format";
import { groupByDay, pulseWindow, type PulseKind } from "@/lib/derive/pulse";
import type { ActivityEvent } from "@/lib/fixture/types";

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

const TILES: { kind: PulseKind; label: string }[] = [
  { kind: "filing_sent", label: "Filings" },
  { kind: "meeting", label: "Meetings" },
  { kind: "opened", label: "New matters" },
  { kind: "onboarding", label: "Onboardings" },
];

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
 * Firm pulse on one rolling 7-day window. The four tiles double as filter
 * toggles; the log is the body of the card, chunked by day — today open,
 * earlier days collapsed to a one-line count. Every number is derived from
 * the one event stream, so the tiles sum to the headline and the log can
 * never disagree with the tally.
 */
export function Pulse({ events }: { events: ActivityEvent[] }) {
  const [activeKind, setActiveKind] = useState<PulseKind | null>(null);
  const [shownDays, setShownDays] = useState(INITIAL_DAYS);

  const pulse = useMemo(() => pulseWindow(events), [events]);
  const groups = useMemo(() => groupByDay(events), [events]);

  const visible = groups.slice(0, shownDays);

  return (
    <Section id="pulse" title="Firm pulse" meta="Last 7 days">
        <p className="t-detail text-muted-foreground">
          {comparisonLine(pulse.total, pulse.changePct)}
        </p>

        <div className="mt-6 grid grid-cols-4 gap-2 border-b border-border pb-8">
          {TILES.map((t) => {
            const pressed = activeKind === t.kind;
            return (
              <Button
                key={t.kind}
                variant="ghost"
                aria-pressed={pressed}
                onClick={() => setActiveKind(pressed ? null : t.kind)}
                className="h-auto flex-col items-start gap-2 rounded-md px-3 py-3 text-left aria-pressed:bg-accent"
              >
                <span className="t-figure-sm">{pulse.byKind[t.kind]}</span>
                <span className="t-detail text-muted-foreground">{t.label}</span>
              </Button>
            );
          })}
        </div>

        <p className="t-subhead mt-8">
          Latest activity{activeKind ? ` · ${KIND_LABEL[activeKind]}` : ""}
        </p>

        <div className="mt-3 flex flex-col divide-y divide-border">
          {visible.map((group, i) => {
            const dayEvents = activeKind
              ? group.events.filter((e) => e.kind === activeKind)
              : group.events;
            return (
              <Collapsible key={group.offsetMs} defaultOpen={i === 0} className="py-1">
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-sm py-3 text-left focus-ring">
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]/collapsible:rotate-90" />
                  <span className="t-body">{pastDayLabel(group.offsetMs)}</span>
                </CollapsibleTrigger>
                <CollapsiblePanel>
                  {dayEvents.length > 0 ? (
                    <ul className="flex flex-col divide-y divide-rule-quiet pb-1 pl-3">
                      {dayEvents.map((e) => (
                        <ActivityRow key={e.id} event={e} />
                      ))}
                    </ul>
                  ) : (
                    <p className="t-detail pb-2 pl-3 text-muted-foreground">
                      {activeKind ? "No matching activity" : "No activity"}
                    </p>
                  )}
                </CollapsiblePanel>
              </Collapsible>
            );
          })}
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
