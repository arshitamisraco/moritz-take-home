import type { Fixture, Lawyer, Matter } from "@/lib/fixture/types";
import type { LedgerState } from "@/lib/state/types";

export interface EffectiveMatter extends Matter {
  chased: boolean;
  halted: boolean;
  escalated: boolean;
  conflictsExpedited: boolean;
  /** lawyerId after any reassignment. */
  effectiveLawyerId: string | null;
}

export interface EffectiveLawyer extends Lawyer {
  /** Availability has been requested this session — no longer counted as
   * undeclared, even though we don't invent a declared number. */
  availabilityRequested: boolean;
}

export interface EffectiveFixture extends Omit<Fixture, "matters" | "lawyers"> {
  matters: EffectiveMatter[];
  lawyers: EffectiveLawyer[];
}

/**
 * Merges the ops overlay onto the base fixture. Everything downstream —
 * buckets, pillar states, bench lists, the financial view — reads only
 * this merged shape, so acting on a row recomputes every zone from one
 * place instead of updating the page piecemeal.
 */
export function applyOverlay(fixture: Fixture, ledger: LedgerState): EffectiveFixture {
  const matters: EffectiveMatter[] = fixture.matters.map((m) => {
    const overlay = ledger.matterOverlays[m.id];
    return {
      ...m,
      chased: overlay?.chased ?? false,
      halted: overlay?.halted ?? false,
      escalated: overlay?.escalated ?? false,
      conflictsExpedited: overlay?.conflictsExpedited ?? false,
      effectiveLawyerId: overlay?.reassignedToLawyerId ?? m.lawyerId,
    };
  });

  // Live load — a reassignment moves one committed matter off its origin
  // lawyer and onto the target. Without folding that back into
  // committedMatters the capacity meters, the headroom pool and every
  // LoadRatio stay frozen at their fixture values while the rest of the
  // page reacts to the move. Placing a previously unassigned matter (no
  // origin) consumes headroom with no decrement.
  const loadDelta = new Map<string, number>();
  for (const m of fixture.matters) {
    const to = ledger.matterOverlays[m.id]?.reassignedToLawyerId;
    if (!to || to === m.lawyerId) continue;
    if (m.lawyerId) loadDelta.set(m.lawyerId, (loadDelta.get(m.lawyerId) ?? 0) - 1);
    loadDelta.set(to, (loadDelta.get(to) ?? 0) + 1);
  }

  const lawyers: EffectiveLawyer[] = fixture.lawyers.map((l) => ({
    ...l,
    committedMatters: Math.max(0, l.committedMatters + (loadDelta.get(l.id) ?? 0)),
    availabilityRequested: ledger.availabilityRequested.has(l.id),
  }));

  return { ...fixture, matters, lawyers };
}
