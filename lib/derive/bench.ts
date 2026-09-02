import type { EffectiveFixture, EffectiveLawyer } from "./apply-overlay";

export interface LawyerLoad {
  lawyer: EffectiveLawyer;
  spare: number; // declared - committed, only meaningful when declared !== null
}

/** committed > declared. */
export function overCommitted(fx: EffectiveFixture): LawyerLoad[] {
  return fx.lawyers
    .filter((l) => l.declaredAvailability !== null && l.committedMatters > l.declaredAvailability)
    .map((l) => ({ lawyer: l, spare: (l.declaredAvailability as number) - l.committedMatters }))
    .sort((a, b) => a.spare - b.spare);
}

/** committed at least 2 below declared — the pool a reassign menu draws from. */
export function headroom(fx: EffectiveFixture): LawyerLoad[] {
  return fx.lawyers
    .filter((l) => l.declaredAvailability !== null && l.declaredAvailability - l.committedMatters >= 2)
    .map((l) => ({ lawyer: l, spare: (l.declaredAvailability as number) - l.committedMatters }))
    .sort((a, b) => b.spare - a.spare);
}

/** Hasn't declared availability this week, and hasn't been asked to since. */
export function undeclared(fx: EffectiveFixture): EffectiveLawyer[] {
  return fx.lawyers.filter((l) => l.declaredAvailability === null && !l.availabilityRequested);
}
