"use client";

import { MobileHeader } from "@/components/mobile/header";
import { MobileNeedsAttention } from "@/components/mobile/needs-attention";
import { MobileWorkload } from "@/components/mobile/workload";
import { MobilePulse } from "@/components/mobile/pulse";
import { MobileFinancial } from "@/components/mobile/financial";
import { MobileQuickActions } from "@/components/mobile/quick-actions";
import { MobileBottomNav } from "@/components/mobile/bottom-nav";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { AtRiskRow } from "@/lib/derive/matters";
import type { AttentionSummary } from "@/lib/derive/attention-summary";
import type { LedgerAction } from "@/lib/state/types";

export function MobileShell({
  fx,
  rows,
  summary,
  dispatch,
  onOpenMatter,
  onOpenPalette,
}: {
  fx: EffectiveFixture;
  rows: AtRiskRow[];
  summary: AttentionSummary;
  dispatch: (action: LedgerAction) => void;
  onOpenMatter: (matterId: string) => void;
  onOpenPalette: () => void;
}) {
  return (
    <div id="m-top">
      <MobileHeader onOpenPalette={onOpenPalette} />
      <MobileNeedsAttention rows={rows} summary={summary} dispatch={dispatch} onOpenMatter={onOpenMatter} />
      <MobileWorkload fx={fx} rows={rows} dispatch={dispatch} onOpenMatter={onOpenMatter} />
      <MobilePulse pulse={fx.todayPulse} weeklyPulse={fx.weeklyPulse} />
      <MobileFinancial fx={fx} />
      <MobileQuickActions onOpenPalette={onOpenPalette} />
      <MobileBottomNav />
    </div>
  );
}
