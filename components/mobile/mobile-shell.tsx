"use client";

import { MobileHeader } from "@/components/mobile/header";
import { MobilePillarStrip } from "@/components/mobile/pillar-strip";
import { MobileNeedsAttention } from "@/components/mobile/needs-attention";
import { MobileWorkload } from "@/components/mobile/workload";
import { MobilePulse } from "@/components/mobile/pulse";
import { MobileFinancial } from "@/components/mobile/financial";
import { Reveal, ScrollReveal } from "@/components/motion/reveal";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import type { LedgerAction } from "@/lib/state/types";
import type { ActivityEvent } from "@/lib/fixture/types";

export function MobileShell({
  fx,
  activity,
  dispatch,
  onOpenPalette,
}: {
  fx: EffectiveFixture;
  activity: ActivityEvent[];
  dispatch: (action: LedgerAction) => void;
  onOpenPalette: () => void;
}) {
  return (
    <main id="m-top" className="pb-24">
      <MobileHeader onOpenPalette={onOpenPalette} />
      <Reveal order={0}>
        <MobilePillarStrip fx={fx} />
      </Reveal>
      <Reveal order={1}>
        <MobileNeedsAttention fx={fx} dispatch={dispatch} />
      </Reveal>
      {/* Below the first screen the entrance is earned by scrolling, not
          spent on mount. */}
      <ScrollReveal>
        <MobileWorkload fx={fx} dispatch={dispatch} />
      </ScrollReveal>
      <ScrollReveal>
        <MobilePulse events={activity} />
      </ScrollReveal>
      <ScrollReveal>
        <MobileFinancial fx={fx} />
      </ScrollReveal>
    </main>
  );
}
