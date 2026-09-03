"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { Separator } from "@/components/ui/separator";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  belowFloorOpenMatters,
  marginByType,
  revenueChangePct,
  targetAttainmentPct,
} from "@/lib/derive/financial";
import { MARGIN_FLOOR_PCT } from "@/lib/derive/thresholds";
import { formatPct, formatUsdCompact } from "@/lib/format";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";
import { cn } from "@/lib/utils";

const marginConfig: ChartConfig = {
  marginPct: { label: "Margin", color: "var(--chart-2)" },
};

const revenueConfig: ChartConfig = {
  amountUsd: { label: "Revenue", color: "var(--chart-2)" },
};

/**
 * Two things only, above the fold: is revenue trending toward the target,
 * and how did this month land against it. Margin-by-type and the below-
 * floor matter list are real, but they're detail-panel questions, not
 * "do I need to react this morning" ones — they sit behind a disclosure.
 */
export function Financial({ fx }: { fx: EffectiveFixture }) {
  const belowFloor = belowFloorOpenMatters(fx);
  const byType = marginByType(fx);
  const changePct = revenueChangePct(fx);
  const attainment = targetAttainmentPct(fx);
  const latest = fx.revenueByMonth[fx.revenueByMonth.length - 1];

  return (
    <section id="financial" aria-label="Financial health" className="flex flex-col pb-20">
      <h2 className="t-section">Financial health</h2>
      <Separator className="mt-6" />

      <div className="mt-10 grid grid-cols-2 gap-16">
        <div>
          <div className="flex items-baseline justify-between">
            <p className="t-eyebrow text-muted-foreground">Revenue this month</p>
            {changePct !== null && (
              <span className={cn("t-detail tabular-nums", changePct < 0 ? "text-breaking" : "text-foreground")}>
                {changePct >= 0 ? "↑" : "↓"} {Math.abs(changePct)}% vs previous month
              </span>
            )}
          </div>
          <p className="t-figure mt-2">{formatUsdCompact(latest?.amountUsd ?? 0)}</p>
          <ChartContainer config={revenueConfig} className="mt-6 h-40 w-full">
            <AreaChart data={fx.revenueByMonth} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                interval={0}
                tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis hide domain={["dataMin - 30000", "dataMax + 30000"]} />
              <ReferenceLine
                y={fx.revenueTargetUsd}
                stroke="var(--ink-1)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => formatUsdCompact(Number(v))} />}
              />
              <Area
                dataKey="amountUsd"
                type="monotone"
                fill="var(--chart-3)"
                fillOpacity={0.25}
                stroke="var(--chart-2)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div>
          <p className="t-eyebrow text-muted-foreground">Billable performance — target {formatUsdCompact(fx.revenueTargetUsd)}/mo</p>
          <p className="t-figure mt-2">{attainment}%</p>
          <p className="t-detail text-muted-foreground">
            {formatUsdCompact(latest?.amountUsd ?? 0)} of {formatUsdCompact(fx.revenueTargetUsd)}
          </p>
          <Progress value={Math.min(attainment, 100)} className="mt-8">
            <ProgressTrack className="h-2 bg-accent">
              <ProgressIndicator className={cn(attainment >= 100 ? "bg-steady-foreground" : "bg-chart-2")} />
            </ProgressTrack>
          </Progress>
          <p className="t-detail mt-6 text-muted-foreground">
            realized margin {fx.realizedMarginPct}% · quoted {fx.quotedMarginPct}% · target {fx.marginTargetPct}%
          </p>
        </div>
      </div>

      <details className="mt-12 border-t border-border pt-6">
        <summary className="t-detail cursor-pointer text-[color:var(--ink-2)] underline decoration-1 underline-offset-[0.15em] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm w-fit">
          Margin detail — {belowFloor.length} matter{belowFloor.length === 1 ? "" : "s"} below the {MARGIN_FLOOR_PCT}% floor
        </summary>

        <div className="mt-6 grid grid-cols-2 gap-12">
          <div>
            <p className="t-eyebrow text-muted-foreground">margin by matter type</p>
            <ChartContainer config={marginConfig} className="mt-4 h-44 w-full">
              <BarChart data={byType} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={88}
                  tick={{ fontFamily: "var(--font-sans)", fontSize: 11, fill: "var(--foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine
                  x={MARGIN_FLOOR_PCT}
                  stroke="var(--ink-1)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                <Bar dataKey="marginPct" fill="var(--chart-2)" radius={0} barSize={10} />
              </BarChart>
            </ChartContainer>
          </div>

          <div>
            <p className="t-eyebrow text-muted-foreground">margin on open matters below floor</p>
            {belowFloor.length === 0 ? (
              <p className="t-detail mt-4 text-muted-foreground">
                All open matters above the {MARGIN_FLOOR_PCT}% floor
              </p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {belowFloor.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                    <p className="t-body">
                      {m.name} <span className="text-muted-foreground">· {m.client}</span>
                    </p>
                    <span
                      className={cn(
                        "t-body tabular-nums",
                        m.marginPct < 0 ? "text-breaking" : "text-foreground"
                      )}
                    >
                      {formatPct(m.marginPct)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </details>
    </section>
  );
}
