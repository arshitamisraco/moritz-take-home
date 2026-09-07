"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedNumber } from "@/components/motion/number";
import { EASE, PRESS, StaggerGroup, StaggerList, StaggerRow, staggerItem } from "@/components/motion/reveal";
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

const INITIAL_ROWS = 5;

export function MobilePulse({ events }: { events: ActivityEvent[] }) {
  const [rows, setRows] = useState(INITIAL_ROWS);

  const pulse = useMemo(() => pulseWindow(events), [events]);
  const groups = useMemo(() => groupByDay(events), [events]);

  const total = useMemo(
    () => groups.reduce((n, g) => n + g.events.length, 0),
    [groups]
  );

  // Fill day blocks up to the row budget, newest first.
  const blocks = useMemo(() => {
    let budget = rows;
    const out: { offsetMs: number; events: ActivityEvent[] }[] = [];
    for (const g of groups) {
      if (budget <= 0) break;
      if (g.events.length === 0) continue;
      const take = g.events.slice(0, budget);
      out.push({ offsetMs: g.offsetMs, events: take });
      budget -= take.length;
    }
    return out;
  }, [groups, rows]);

  const comparison =
    pulse.changePct === 0
      ? `${pulse.total} events · even with the previous 7 days`
      : `${pulse.total} events · ${Math.abs(pulse.changePct)}% ${
          pulse.changePct > 0 ? "ahead of" : "behind"
        } the previous 7 days`;

  return (
    <section id="m-pulse" className="border-b border-border px-4 py-7">
      <h2 className="t-section">Firm pulse</h2>
      <p className="t-detail mt-1 text-muted-foreground">Last 7 days</p>

      <p className="t-detail mt-4 text-muted-foreground">{comparison}</p>

      <StaggerGroup className="mt-4 grid grid-cols-2 gap-4">
        {PULSE_KINDS.map((kind) => (
          <motion.div key={kind} variants={staggerItem} className="flex flex-col gap-1">
            <p className="t-figure-sm tabular-nums">
              <AnimatedNumber value={pulse.byKind[kind]} />
            </p>
            <p className="t-eyebrow text-muted-foreground">{PULSE_KIND_LABEL[kind]}</p>
          </motion.div>
        ))}
      </StaggerGroup>

      {blocks.length === 0 ? (
        <p className="t-detail mt-4 text-muted-foreground">No activity</p>
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          <AnimatePresence initial={false}>
          {blocks.map((block) => (
            <motion.div
              key={block.offsetMs}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <p className="t-body">{pastDayLabel(block.offsetMs)}</p>
              <StaggerList className="mt-2 flex flex-col divide-y divide-rule-quiet pl-3">
                {block.events.map((e) => (
                  <StaggerRow key={e.id} className="flex items-baseline gap-3 py-2.5">
                    <span className="t-detail w-11 shrink-0 tabular-nums text-muted-foreground">
                      {e.offsetMs >= 0 ? "now" : clockTime(e.offsetMs)}
                    </span>
                    <span className="t-detail flex-1 truncate">{e.detail}</span>
                    <span className="t-eyebrow shrink-0 text-muted-foreground">
                      {KIND_LABEL[e.kind] ?? e.kind}
                    </span>
                  </StaggerRow>
                ))}
              </StaggerList>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      {rows < total && (
        <motion.button
          type="button"
          onClick={() => setRows((n) => n + INITIAL_ROWS)}
          {...PRESS}
          className="t-detail mt-4 inline-block text-ink-2 underline decoration-1 underline-offset-[0.15em] focus-ring rounded-sm"
        >
          Load older
        </motion.button>
      )}
    </section>
  );
}
