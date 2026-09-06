"use client";

import { useMemo } from "react";
import { Header } from "@/components/desktop/header";
import { NeedsAttention } from "@/components/desktop/needs-attention";
import { Workload } from "@/components/desktop/workload";
import { Pulse } from "@/components/desktop/pulse";
import { Financial } from "@/components/desktop/financial";
import { QuickActions } from "@/components/desktop/quick-actions";
import { CommandPalette, useCommandPaletteState } from "@/components/desktop/command-palette";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { applyOverlay } from "@/lib/derive/apply-overlay";
import { atRiskRows } from "@/lib/derive/matters";
import { attentionSummary } from "@/lib/derive/attention-summary";
import { useLedgerState } from "@/lib/state/ledger-store";
import type { Fixture } from "@/lib/fixture/types";

export function Dashboard({ fixture }: { fixture: Fixture }) {
  const [ledger, dispatch] = useLedgerState();
  const [paletteOpen, setPaletteOpen] = useCommandPaletteState();

  const fx = useMemo(() => applyOverlay(fixture, ledger), [fixture, ledger]);

  const rows = useMemo(() => atRiskRows(fx), [fx]);
  const summary = useMemo(() => attentionSummary(fx), [fx]);
  const activity = useMemo(
    () => [...ledger.appendedEvents, ...fx.activity],
    [ledger.appendedEvents, fx.activity]
  );

  return (
    <>
      <div className="hidden md:block">
        <main className="mx-auto max-w-[1200px] px-6">
          <Header onOpenPalette={() => setPaletteOpen(true)} onNewMatter={() => setPaletteOpen(true)} />

          <NeedsAttention rows={rows} summary={summary} dispatch={dispatch} />

          <Workload fx={fx} rows={rows} dispatch={dispatch} />

          <Pulse pulse={fx.todayPulse} weeklyPulse={fx.weeklyPulse} events={activity} />

          <Financial fx={fx} />

          <QuickActions onOpenPalette={() => setPaletteOpen(true)} />
        </main>
      </div>

      <div className="md:hidden">
        <MobileShell
          fx={fx}
          rows={rows}
          summary={summary}
          dispatch={dispatch}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      </div>

      <CommandPalette fx={fx} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
