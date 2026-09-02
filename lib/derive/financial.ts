import { MARGIN_FLOOR_PCT } from "./thresholds";
import type { EffectiveFixture, EffectiveMatter } from "./apply-overlay";

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
