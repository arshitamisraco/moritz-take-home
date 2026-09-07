"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Header } from "@/components/desktop/header";
import { PillarStrip } from "@/components/desktop/pillar-strip";
import { NeedsAttention } from "@/components/desktop/needs-attention";
import { Workload } from "@/components/desktop/workload";
import { Pulse } from "@/components/desktop/pulse";
import { Financial } from "@/components/desktop/financial";
import { CommandPalette, useCommandPaletteState } from "@/components/desktop/command-palette";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { Reveal } from "@/components/motion/reveal";
import { BackToTop, ScrollProgress } from "@/components/motion/scroll";
import { applyOverlay } from "@/lib/derive/apply-overlay";
import { useLedgerState } from "@/lib/state/ledger-store";
import type { LedgerAction } from "@/lib/state/types";
import type { Fixture } from "@/lib/fixture/types";

/** Past-tense toast copy for a dispatched action, built only from fields
 * the action already carries — never a hand-typed matter name. */
function describeAction(action: LedgerAction): string | null {
  switch (action.type) {
    case "chase":
      return `Chased · ${action.matterLabel}`;
    case "halt":
      return `Halted · ${action.matterLabel}`;
    case "expedite":
      return `Expedited · ${action.matterLabel}`;
    case "escalate":
      return `Escalated · ${action.matterLabel}`;
    case "reassign":
      return `Reassigned to ${action.toLawyerName} · ${action.matterLabel}`;
    case "requestAvailability":
      return `Availability requested · ${action.lawyerName}`;
    case "requestAvailabilityMany":
      return `Availability requested · ${action.lawyers.length} lawyers`;
    case "undo":
      return null;
  }
}

export function Dashboard({ fixture }: { fixture: Fixture }) {
  const [ledger, rawDispatch] = useLedgerState();
  const [paletteOpen, setPaletteOpen] = useCommandPaletteState();

  const undo = useCallback(() => rawDispatch({ type: "undo" }), [rawDispatch]);

  const notify = useCallback(
    (action: LedgerAction) => {
      const message = describeAction(action);
      if (!message) return;
      toast(message, { action: { label: "Undo", onClick: undo } });
    },
    [undo]
  );

  // `requestAvailability` calls made in the same tick (the Workload "All
  // N" bulk trigger dispatches one per lawyer via forEach, and we don't
  // own that component) collapse into one requestAvailabilityMany — one
  // history entry, one toast, one Undo.
  const pendingAvailability = useRef<{ lawyerId: string; lawyerName: string }[] | null>(null);

  const flushAvailability = useCallback(() => {
    const batch = pendingAvailability.current;
    pendingAvailability.current = null;
    if (!batch || batch.length === 0) return;
    const action: LedgerAction =
      batch.length === 1
        ? { type: "requestAvailability", ...batch[0] }
        : { type: "requestAvailabilityMany", lawyers: batch };
    rawDispatch(action);
    notify(action);
  }, [rawDispatch, notify]);

  const dispatch = useCallback(
    (action: LedgerAction) => {
      if (action.type === "requestAvailability") {
        if (!pendingAvailability.current) {
          pendingAvailability.current = [];
          queueMicrotask(flushAvailability);
        }
        pendingAvailability.current.push({ lawyerId: action.lawyerId, lawyerName: action.lawyerName });
        return;
      }
      rawDispatch(action);
      notify(action);
    },
    [rawDispatch, notify, flushAvailability]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "z" || !(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      e.preventDefault();
      undo();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo]);

  const fx = useMemo(() => applyOverlay(fixture, ledger), [fixture, ledger]);

  const activity = useMemo(
    () => [...ledger.appendedEvents, ...fx.activity],
    [ledger.appendedEvents, fx.activity]
  );

  return (
    <>
      <ScrollProgress />
      <div className="hidden md:block">
        <Header onOpenPalette={() => setPaletteOpen(true)} />
        <main className="mx-auto max-w-[1200px] px-6 pb-32">
          <Reveal order={0}>
            <PillarStrip fx={fx} />
          </Reveal>
          <Reveal order={1}>
            <NeedsAttention fx={fx} dispatch={dispatch} />
          </Reveal>
          <Reveal order={2}>
            <Workload fx={fx} dispatch={dispatch} />
          </Reveal>
          <Reveal order={3}>
            <Pulse events={activity} />
          </Reveal>
          <Reveal order={4}>
            <Financial fx={fx} />
          </Reveal>
        </main>
      </div>

      <div className="md:hidden">
        <MobileShell
          fx={fx}
          activity={activity}
          dispatch={dispatch}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      </div>

      <CommandPalette fx={fx} open={paletteOpen} onOpenChange={setPaletteOpen} />
      <BackToTop />
    </>
  );
}
