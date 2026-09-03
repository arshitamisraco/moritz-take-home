import type { EffectiveFixture, EffectiveLawyer } from "./apply-overlay";
import type { PillarState } from "./thresholds";

export interface LawyerCapacity {
  lawyer: EffectiveLawyer;
  /** committed / declared, as a percentage. */
  pct: number;
  state: PillarState;
}

const STRAINING_PCT = 80;

/** Every lawyer who's declared availability, ranked by load — the
 * outliers an admin needs to see, not the full 38-name roster. Capped so
 * the homepage shows a handful, not a directory. */
export function capacityOutliers(fx: EffectiveFixture, limit = 5): LawyerCapacity[] {
  return fx.lawyers
    .filter((l) => l.declaredAvailability !== null && l.declaredAvailability > 0)
    .map((l) => {
      const pct = Math.round((l.committedMatters / (l.declaredAvailability as number)) * 100);
      const state: PillarState = pct > 100 ? "breaking" : pct >= STRAINING_PCT ? "straining" : "steady";
      return { lawyer: l, pct, state };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit);
}
