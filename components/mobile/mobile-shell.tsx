"use client";

import { MobileHeader } from "@/components/mobile/header";
import { StatusChips } from "@/components/mobile/status-chips";
import { MobileComplianceBreach } from "@/components/mobile/compliance-breach";
import { MobileAttentionList } from "@/components/mobile/attention-list";
import { MobileBenchSummary } from "@/components/mobile/bench-summary";
import { MobileActivity } from "@/components/mobile/activity";
import { MobileBottomNav } from "@/components/mobile/bottom-nav";
import { AttentionEmpty } from "@/components/desktop/attention-empty";
import { openMatters } from "@/lib/derive/financial";
import type { EffectiveFixture, EffectiveMatter } from "@/lib/derive/apply-overlay";
import type { AtRiskRow } from "@/lib/derive/matters";
import type { LawyerLoad } from "@/lib/derive/bench";
import type { PillarResult } from "@/lib/derive/pillars";
import type { ActivityEvent } from "@/lib/fixture/types";
import type { LedgerAction } from "@/lib/state/types";

export function MobileShell({
  fx,
  health,
  workload,
  financial,
  rows,
  activity,
  next,
  dispatch,
  onOpenMatter,
  onOpenPalette,
}: {
  fx: EffectiveFixture;
  health: PillarResult;
  workload: PillarResult;
  financial: PillarResult;
  rows: AtRiskRow[];
  room: LawyerLoad[];
  activity: ActivityEvent[];
  next: EffectiveMatter | null;
  dispatch: (action: LedgerAction) => void;
  onOpenMatter: (matterId: string) => void;
  onOpenPalette: () => void;
}) {
  const complianceRow = rows.find((r) => r.bucket === "compliance") ?? null;
  const timedRows = rows.filter((r) => r.bucket !== "compliance");

  return (
    <div id="m-top">
      <MobileHeader onOpenPalette={onOpenPalette} />
      <StatusChips health={health} workload={workload} financial={financial} />

      {complianceRow && (
        <MobileComplianceBreach row={complianceRow} dispatch={dispatch} onOpenMatter={onOpenMatter} />
      )}

      <section id="m-attention">
        {timedRows.length > 0 ? (
          <MobileAttentionList rows={timedRows} dispatch={dispatch} onOpenMatter={onOpenMatter} />
        ) : (
          !complianceRow && (
            <div className="px-4">
              <AttentionEmpty next={next} matterCount={openMatters(fx).length} />
            </div>
          )
        )}
      </section>

      <MobileBenchSummary fx={fx} dispatch={dispatch} />
      <MobileActivity events={activity} />
      <MobileBottomNav />
    </div>
  );
}
