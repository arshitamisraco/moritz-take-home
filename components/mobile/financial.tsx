import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { StatusBadge } from "@/components/ledger/status-badge";
import { MatterRow } from "@/components/ledger/matter-row";
import {
  latestRevenueMonth,
  leakConcentrationPct,
  leakRankedBelowFloor,
  lowestMarginType,
  marginByType,
  marginLeakUsd,
  revenueChangePct,
  targetAttainmentPct,
  totalMarginLeakUsd,
} from "@/lib/derive/financial";
import { financialPillar } from "@/lib/derive/pillars";
import { MARGIN_FLOOR_PCT } from "@/lib/derive/thresholds";
import { formatPct, formatUsdCompact } from "@/lib/format";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import { cn } from "@/lib/utils";

/**
 * Mobile gets the conclusion, desktop gets the analysis — no charts
 * squeezed into 320px. Revenue leads (hero figure + the three facts
 * desktop's band 1 shows), then margin-by-type, then the leak behind one
 * disclosure.
 */
const BELOW_FLOOR_PREVIEW = 5;

export function MobileFinancial({ fx }: { fx: EffectiveFixture }) {
  const pillar = financialPillar(fx);
  const ranked = leakRankedBelowFloor(fx);
  const totalLeak = totalMarginLeakUsd(fx);
  const byType = marginByType(fx);
  const lowest = lowestMarginType(fx);
  const changePct = revenueChangePct(fx);
  const attainment = targetAttainmentPct(fx);
  const latest = latestRevenueMonth(fx);

  const preview = ranked.slice(0, BELOW_FLOOR_PREVIEW);
  const restCount = ranked.length - preview.length;
  const worst = ranked[0];
  const concentration = leakConcentrationPct(fx);

  return (
    <section id="m-financial" className="border-b border-border px-4 py-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="t-section">Financial health</h2>
          <p className="t-figure mt-2 tabular-nums">
            {latest ? formatUsdCompact(latest.amountUsd) : "—"}
          </p>
        </div>
        <StatusBadge variant={pillar.state} />
      </div>

      <p className="t-detail mt-1 tabular-nums text-muted-foreground">
        {changePct !== null && (
          <>
            <span className={changePct < 0 ? "text-breaking" : undefined}>
              {changePct >= 0 ? "↑" : "↓"} {Math.abs(changePct)}%
            </span>{" "}
            vs last month ·{" "}
          </>
        )}
        {attainment}% of {formatUsdCompact(fx.revenueTargetUsd)} target · margin{" "}
        {formatPct(fx.realizedMarginPct)} vs {formatPct(fx.marginTargetPct)} target
      </p>

      <Collapsible className="mt-4">
        <CollapsibleTrigger className="t-detail cursor-pointer text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground">
          Margin detail
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {byType.map((t) => (
              <li key={t.type} className="flex items-center justify-between gap-3 py-2">
                <span className="t-detail">{t.label}</span>
                <span
                  className={cn(
                    "t-detail tabular-nums",
                    t.marginPct < MARGIN_FLOOR_PCT ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {formatPct(t.marginPct)}
                  {t.marginPct < MARGIN_FLOOR_PCT && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {MARGIN_FLOOR_PCT - t.marginPct}pt below floor
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {lowest && (
            <p className="t-detail mt-2 text-muted-foreground">
              {lowest.label} run {lowest.belowFloorPts > 0 ? `${lowest.belowFloorPts}pt below` : `${Math.abs(lowest.belowFloorPts)}pt above`} the {MARGIN_FLOOR_PCT}% floor, the thinnest of any type.
            </p>
          )}

          {ranked.length === 0 ? (
            <p className="t-detail mt-4 text-muted-foreground">
              All open matters above the {MARGIN_FLOOR_PCT}% floor
            </p>
          ) : (
            <>
              <p className="t-detail mt-4 tabular-nums text-muted-foreground">
                {formatUsdCompact(totalLeak)} margin shortfall · {ranked.length} below the{" "}
                {MARGIN_FLOOR_PCT}% floor
                {worst && (
                  <>
                    {" "}
                    · {worst.client} is {concentration}% of it
                  </>
                )}
              </p>
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {preview.map((m) => (
                  <MatterRow
                    key={m.id}
                    name={m.name}
                    client={m.client}
                    className="t-detail"
                    right={
                      <>
                        {formatUsdCompact(m.price)}{" "}
                        <span
                          className={cn(
                            m.marginPct < 0 ? "text-breaking" : "text-muted-foreground"
                          )}
                        >
                          · {formatPct(m.marginPct)}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          · {formatUsdCompact(marginLeakUsd(m))}
                        </span>
                      </>
                    }
                  />
                ))}
              </ul>
              {restCount > 0 && (
                <p className="t-detail mt-3 text-muted-foreground">
                  +{restCount} more below the {MARGIN_FLOOR_PCT}% floor
                </p>
              )}
            </>
          )}
        </CollapsiblePanel>
      </Collapsible>
    </section>
  );
}
