import { MARGIN_FLOOR_PCT } from "./thresholds";
import type { EffectiveFixture, EffectiveMatter } from "./apply-overlay";
import type { RevenueMonth } from "@/lib/fixture/types";

export function openMatters(fx: EffectiveFixture): EffectiveMatter[] {
  return fx.matters.filter((m) => m.status === "open");
}

export function belowFloorOpenMatters(fx: EffectiveFixture): EffectiveMatter[] {
  return openMatters(fx)
    .filter((m) => m.marginPct < MARGIN_FLOOR_PCT)
    .sort((a, b) => a.marginPct - b.marginPct);
}

export function deliveredNegativeMatters(fx: EffectiveFixture): EffectiveMatter[] {
  return fx.matters.filter(
    (m) => (m.status === "delivered_on_time" || m.status === "delivered_late") && m.marginPct < 0
  );
}

export interface TypeMargin {
  type: string;
  label: string;
  marginPct: number;
}

const TYPE_LABEL: Record<string, string> = {
  safe: "SAFEs",
  employment: "Employment",
  incorporation: "Incorporations",
  option_grant: "Option grants",
  msa: "MSAs",
  financing: "Financings",
  filing: "Filings",
};

export function marginByType(fx: EffectiveFixture): TypeMargin[] {
  return Object.entries(fx.marginByType)
    .filter(([type]) => type !== "filing")
    .map(([type, marginPct]) => ({ type, label: TYPE_LABEL[type] ?? type, marginPct }))
    .sort((a, b) => b.marginPct - a.marginPct);
}

/** Percent change of the latest month over the one before it — the
 * headline's up/down arrow, never typed in. */
export function revenueChangePct(fx: EffectiveFixture): number | null {
  const months = fx.revenueByMonth;
  if (months.length < 2) return null;
  const last = months[months.length - 1].amountUsd;
  const prev = months[months.length - 2].amountUsd;
  if (prev === 0) return null;
  return Math.round(((last - prev) / prev) * 100);
}

/** Latest month's revenue against the monthly target — the "billable
 * performance" bar. */
export function targetAttainmentPct(fx: EffectiveFixture): number {
  const months = fx.revenueByMonth;
  const last = months[months.length - 1]?.amountUsd ?? 0;
  if (fx.revenueTargetUsd === 0) return 0;
  return Math.round((last / fx.revenueTargetUsd) * 100);
}

/** Total value of open matters priced below the margin floor — the
 * section's "exposure" figure. Demo → $17.6k. */
export function belowFloorExposureUsd(fx: EffectiveFixture): number {
  return belowFloorOpenMatters(fx).reduce((sum, m) => sum + m.price, 0);
}

/** Realized minus quoted margin, in points. Negative means the firm is
 * collecting less than it priced. Demo −2, good-day +1 — the one headline
 * figure that separates Steady from Straining. */
export function realizationGapPts(fx: EffectiveFixture): number {
  return fx.realizedMarginPct - fx.quotedMarginPct;
}

/** The most recent revenue month itself, so labels read the real month
 * ("Aug") rather than a generic "this month". */
export function latestRevenueMonth(fx: EffectiveFixture): RevenueMonth | undefined {
  return fx.revenueByMonth[fx.revenueByMonth.length - 1];
}

/** The open matter furthest below the floor — belowFloorOpenMatters is
 * already sorted ascending by margin, so this is its first element. */
export function worstBelowFloor(fx: EffectiveFixture): EffectiveMatter | undefined {
  return belowFloorOpenMatters(fx)[0];
}

/** Dollar shortfall a single below-floor matter costs against the margin
 * floor — on a flat fee the firm collects the full price regardless, so
 * the loss is the gap between the floor and what the matter actually
 * margined, not the price itself. */
export function marginLeakUsd(m: EffectiveMatter): number {
  return (m.price * (MARGIN_FLOOR_PCT - m.marginPct)) / 100;
}

/** Total margin leak across every open matter below the floor — the
 * section's headline figure. Demo → $2,504, not the $17.6k sum of prices. */
export function totalMarginLeakUsd(fx: EffectiveFixture): number {
  return belowFloorOpenMatters(fx).reduce((sum, m) => sum + marginLeakUsd(m), 0);
}

/** Below-floor matters ranked by dollar leak, not margin percent — a
 * lower-margin matter can still leak less than a higher-margin one on a
 * bigger price tag (Palisade Foods at 39% costs more than Aurora Fintech
 * at 38%). */
export function leakRankedBelowFloor(fx: EffectiveFixture): EffectiveMatter[] {
  return [...belowFloorOpenMatters(fx)].sort((a, b) => marginLeakUsd(b) - marginLeakUsd(a));
}

/** The worst matter's share of the firm's total margin leak — the
 * concentration figure that names a single client as the story. */
export function leakConcentrationPct(fx: EffectiveFixture): number {
  const total = totalMarginLeakUsd(fx);
  if (total === 0) return 0;
  const ranked = leakRankedBelowFloor(fx);
  return Math.round((marginLeakUsd(ranked[0]) / total) * 100);
}
