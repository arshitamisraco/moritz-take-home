"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/desktop/header";
import { Pillars } from "@/components/desktop/pillars";
import { AttentionTable } from "@/components/desktop/attention-table";
import { AttentionEmpty } from "@/components/desktop/attention-empty";
import { Bench } from "@/components/desktop/bench";
import { Financial } from "@/components/desktop/financial";
import { Activity } from "@/components/desktop/activity";
import { MatterSheet } from "@/components/desktop/matter-sheet";
import { CommandPalette, useCommandPaletteState } from "@/components/desktop/command-palette";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { applyOverlay } from "@/lib/derive/apply-overlay";
import { atRiskRows, nextDueMatter } from "@/lib/derive/matters";
import { openMatters } from "@/lib/derive/financial";
import { headroom } from "@/lib/derive/bench";
import { healthPillar, workloadPillar, financialPillar } from "@/lib/derive/pillars";
import { useLedgerState } from "@/lib/state/ledger-store";
import type { Fixture } from "@/lib/fixture/types";

export function Dashboard({ fixture }: { fixture: Fixture }) {
  const [ledger, dispatch] = useLedgerState();
  const [openMatterId, setOpenMatterId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useCommandPaletteState();

  const fx = useMemo(() => applyOverlay(fixture, ledger), [fixture, ledger]);

  const rows = useMemo(() => atRiskRows(fx), [fx]);
  const room = useMemo(() => headroom(fx), [fx]);
  const activity = useMemo(
    () => [...ledger.appendedEvents, ...fx.activity],
    [ledger.appendedEvents, fx.activity]
  );

  const health = healthPillar(fx);
  const workload = workloadPillar(fx);
  const financial = financialPillar(fx);

  const openMatter = openMatterId ? fx.matters.find((m) => m.id === openMatterId) ?? null : null;
  const next = nextDueMatter(fx);

  return (
    <>
      <div className="hidden md:block">
        <main className="mx-auto max-w-[1200px] px-6">
          <Header onOpenPalette={() => setPaletteOpen(true)} />

          <div id="pillars">
            <Pillars health={health} workload={workload} financial={financial} />
          </div>

          <section id="attention" className="pt-12 pb-12">
            <h2 className="t-section">Attention</h2>
            <div className="mt-4 border-t border-border" />
            {rows.length > 0 ? (
              <AttentionTable
                rows={rows}
                fx={fx}
                headroomList={room}
                dispatch={dispatch}
                onOpenMatter={setOpenMatterId}
              />
            ) : (
              <AttentionEmpty next={next} matterCount={openMatters(fx).length} />
            )}
          </section>

          <section id="bench" className="pb-12">
            <Bench fx={fx} dispatch={dispatch} />
          </section>

          <section id="financial" className="pb-12">
            <Financial fx={fx} />
          </section>

          <section id="activity" className="pb-16">
            <Activity events={activity} />
          </section>
        </main>
      </div>

      <div className="md:hidden">
        <MobileShell
          fx={fx}
          health={health}
          workload={workload}
          financial={financial}
          rows={rows}
          room={room}
          activity={activity}
          next={next}
          dispatch={dispatch}
          onOpenMatter={setOpenMatterId}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      </div>

      <MatterSheet
        matter={openMatter}
        fx={fx}
        activity={activity}
        headroomList={room}
        dispatch={dispatch}
        onOpenChange={(open) => !open && setOpenMatterId(null)}
      />

      <CommandPalette
        fx={fx}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onOpenMatter={setOpenMatterId}
      />
    </>
  );
}
