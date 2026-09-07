"use client";

import { MobileHeader } from "@/components/mobile/header";
import { MobileNeedsAttention } from "@/components/mobile/needs-attention";
import { MobileWorkload } from "@/components/mobile/workload";
import { MobilePulse } from "@/components/mobile/pulse";
import { MobileFinancial } from "@/components/mobile/financial";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { AtRiskRow } from "@/lib/derive/matters";
import type { AttentionSummary } from "@/lib/derive/attention-summary";
import type { LedgerAction } from "@/lib/state/types";
import type { ActivityEvent } from "@/lib/fixture/types";

export function MobileShell({
  fx,
  rows,
  summary,
  activity,
  dispatch,
  onOpenPalette,
}: {
  fx: EffectiveFixture;
  rows: AtRiskRow[];
  summary: AttentionSummary;
  activity: ActivityEvent[];
  dispatch: (action: LedgerAction) => void;
  onOpenPalette: () => void;
}) {
  return (
    <div id="m-top" className="pb-24">
      <MobileHeader onOpenPalette={onOpenPalette} onNewMatter={onOpenPalette} />
      <MobileNeedsAttention rows={rows} summary={summary} dispatch={dispatch} />
      <MobileWorkload fx={fx} rows={rows} dispatch={dispatch} />
      <MobilePulse events={activity} />
      <MobileFinancial fx={fx} />
    </div>
  );
}
