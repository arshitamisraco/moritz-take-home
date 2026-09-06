"use client";

import { MobileHeader } from "@/components/mobile/header";
import { MobileNeedsAttention } from "@/components/mobile/needs-attention";
import { MobileWorkload } from "@/components/mobile/workload";
import { MobilePulse } from "@/components/mobile/pulse";
import { MobileFinancial } from "@/components/mobile/financial";
import { MobileQuickActions } from "@/components/mobile/quick-actions";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { AtRiskRow } from "@/lib/derive/matters";
import type { AttentionSummary } from "@/lib/derive/attention-summary";
import type { LedgerAction } from "@/lib/state/types";

export function MobileShell({
  fx,
  rows,
  summary,
  dispatch,
  onOpenPalette,
}: {
  fx: EffectiveFixture;
  rows: AtRiskRow[];
  summary: AttentionSummary;
  dispatch: (action: LedgerAction) => void;
  onOpenPalette: () => void;
}) {
  return (
    <div id="m-top">
      <MobileHeader onOpenPalette={onOpenPalette} onNewMatter={onOpenPalette} />
      <MobileNeedsAttention rows={rows} summary={summary} dispatch={dispatch} />
      <MobileWorkload fx={fx} rows={rows} dispatch={dispatch} />
      <MobilePulse pulse={fx.todayPulse} weeklyPulse={fx.weeklyPulse} />
      <MobileFinancial fx={fx} />
      <MobileQuickActions onOpenPalette={onOpenPalette} />
    </div>
  );
}
