import { belowFloorOpenMatters, revenueChangePct, targetAttainmentPct } from "@/lib/derive/financial";
import { MARGIN_FLOOR_PCT } from "@/lib/derive/thresholds";
import { formatPct, formatUsdCompact } from "@/lib/format";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import { cn } from "@/lib/utils";

/**
 * Mobile gets the conclusion, desktop gets the analysis — no charts
 * squeezed into 320px, just the two numbers an admin actually needs on
 * the way out the door.
 */
export function MobileFinancial({ fx }: { fx: EffectiveFixture }) {
  const changePct = revenueChangePct(fx);
  const attainment = targetAttainmentPct(fx);
  const belowFloor = belowFloorOpenMatters(fx);
  const latest = fx.revenueByMonth[fx.revenueByMonth.length - 1];

  return (
    <section id="m-financial" className="border-b border-border px-4 py-4">
      <p className="t-eyebrow text-muted-foreground">Financial health</p>
      <div className="mt-2 flex items-baseline gap-3">
        <p className="t-body">{formatUsdCompact(latest?.amountUsd ?? 0)} revenue</p>
        {changePct !== null && (
          <span className={cn("t-detail tabular-nums", changePct < 0 ? "text-breaking" : "text-foreground")}>
            {changePct >= 0 ? "↑" : "↓"} {Math.abs(changePct)}%
          </span>
        )}
      </div>
      <p className="t-detail mt-1 text-muted-foreground">
        {attainment}% of target ({formatUsdCompact(fx.revenueTargetUsd)}/mo)
      </p>

      <details className="mt-3">
        <summary className="t-detail cursor-pointer text-foreground underline decoration-border underline-offset-4">
          View breakdown
        </summary>
        <p className="t-detail mt-2 text-muted-foreground">
          realized margin {fx.realizedMarginPct}% · quoted {fx.quotedMarginPct}% · target {fx.marginTargetPct}%
        </p>
        {belowFloor.length === 0 ? (
          <p className="t-detail mt-2 text-muted-foreground">
            All open matters above the {MARGIN_FLOOR_PCT}% floor
          </p>
        ) : (
          <ul className="mt-2 flex flex-col divide-y divide-border">
            {belowFloor.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                <p className="t-detail">
                  {m.name} <span className="text-muted-foreground">· {m.client}</span>
                </p>
                <span className={cn("t-detail tabular-nums", m.marginPct < 0 ? "text-breaking" : "text-foreground")}>
                  {formatPct(m.marginPct)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}
