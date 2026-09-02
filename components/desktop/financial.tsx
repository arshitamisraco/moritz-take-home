"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { belowFloorOpenMatters, marginByType } from "@/lib/derive/financial";
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

export function Financial({ fx }: { fx: EffectiveFixture }) {
  const belowFloor = belowFloorOpenMatters(fx);
  const byType = marginByType(fx);

  return (
    <section aria-label="Financial" className="flex flex-col">
      <h2 className="t-section">Financial</h2>
      <Separator className="mt-4" />

      <div className="mt-4">
        <p className="t-eyebrow text-muted-foreground">
          margin on open matters — {belowFloor.length} below floor
        </p>
        {belowFloor.length === 0 ? (
          <p className="t-detail mt-3 text-muted-foreground">
            All open matters above the {MARGIN_FLOOR_PCT}% floor
          </p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {belowFloor.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-2.5">
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

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <p className="t-eyebrow text-muted-foreground">margin by matter type</p>
          <ChartContainer config={marginConfig} className="mt-3 h-44 w-full">
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
          <p className="t-eyebrow text-muted-foreground">
            revenue vs target — target {formatUsdCompact(fx.revenueTargetUsd)}/mo
          </p>
          <ChartContainer config={revenueConfig} className="mt-3 h-44 w-full">
            <BarChart data={fx.revenueByMonth} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontFamily: "var(--font-mono)", fontSize: 10, fill: "var(--ink-3)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis hide domain={[0, "dataMax + 50000"]} />
              <ReferenceLine
                y={fx.revenueTargetUsd}
                stroke="var(--ink-1)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => formatUsdCompact(Number(v))} />}
              />
              <Bar dataKey="amountUsd" fill="var(--chart-3)" radius={0} barSize={18} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </section>
  );
}
