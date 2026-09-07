"use client";

import { useMemo } from "react";
import { Header } from "@/components/desktop/header";
import { NeedsAttention } from "@/components/desktop/needs-attention";
import { Workload } from "@/components/desktop/workload";
import { Pulse } from "@/components/desktop/pulse";
import { Financial } from "@/components/desktop/financial";
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
        <main className="mx-auto max-w-[1200px] px-6 pb-32">
          <Header onOpenPalette={() => setPaletteOpen(true)} onNewMatter={() => setPaletteOpen(true)} />

          <NeedsAttention rows={rows} summary={summary} dispatch={dispatch} />

          <Workload fx={fx} rows={rows} dispatch={dispatch} />

          <Pulse events={activity} />

          <Financial fx={fx} />
        </main>
      </div>

      <div className="md:hidden">
        <MobileShell
          fx={fx}
          rows={rows}
          summary={summary}
          activity={activity}
          dispatch={dispatch}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      </div>

      <CommandPalette fx={fx} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
