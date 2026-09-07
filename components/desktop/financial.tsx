"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartHeading } from "@/components/desktop/chart-heading";
import { Section } from "@/components/desktop/section";
import { AnimatedNumber } from "@/components/motion/number";
import { ScrollReveal, StaggerList } from "@/components/motion/reveal";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { StatusBadge } from "@/components/ledger/status-badge";
import { MatterRow } from "@/components/ledger/matter-row";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
import type { EffectiveFixture, EffectiveMatter } from "@/lib/derive/apply-overlay";
import { cn } from "@/lib/utils";

/**
 * Recharts renders axis labels as SVG <text>, which can't wear a type-scale
 * class, so the tick style the margin chart uses is declared here once.
 */
const TICK_MONO = { fontFamily: "var(--font-mono)", fontSize: 12, fill: "var(--ink-3)" } as const;
const TICK_SANS = { fontFamily: "var(--font-sans)", fontSize: 12, fill: "var(--foreground)" } as const;

const marginByTypeConfig: ChartConfig = {
  marginPct: { label: "Margin", color: "var(--chart-2)" },
};

/** One series, one question: is revenue on target. Margin's story is told
 * in words on the band above and by type in the chart alongside — a second
 * axis and a second line here only garbled both. */
const revenueConfig: ChartConfig = {
  amountUsd: { label: "Revenue", color: "var(--chart-1)" },
};

/** How many below-floor matters the section lists before the rest folds
 * behind a disclosure — bounds the panel in ?state=overflow, where dozens
 * of matters sit below the floor. */
const BELOW_FLOOR_PREVIEW = 5;

/** One below-floor matter, ranked by leak: price, margin, and the dollar
 * shortfall it costs against the floor. Negative margin is the only thing
 * that reddens. */
function LeakRow({ m }: { m: EffectiveMatter }) {
  return (
    <MatterRow
      name={m.name}
      client={m.client}
      className="t-body"
      right={
        <>
          {formatUsdCompact(m.price)}{" "}
          <span className={cn(m.marginPct < 0 ? "text-breaking" : "text-muted-foreground")}>
            · {formatPct(m.marginPct)}
          </span>{" "}
          <span className="text-muted-foreground">· {formatUsdCompact(marginLeakUsd(m))}</span>
        </>
      }
    />
  );
}

/**
 * Financial health is a state section, not a work queue — bucketFor()
 * deliberately keeps margin out of at-risk triage, so money is a standing
 * condition here: what shape it's in, which matters are leaking, and why
 * the pattern recurs. Read-only, no action verbs.
 */
export function Financial({ fx }: { fx: EffectiveFixture }) {
  const pillar = financialPillar(fx);
  const ranked = leakRankedBelowFloor(fx);
  const totalLeak = totalMarginLeakUsd(fx);
  const byType = marginByType(fx);
  const lowest = lowestMarginType(fx);
  const changePct = revenueChangePct(fx);
  const attainment = targetAttainmentPct(fx);
  const latest = latestRevenueMonth(fx);

  const preview = ranked.slice(0, BELOW_FLOOR_PREVIEW);
  const rest = ranked.slice(BELOW_FLOOR_PREVIEW);

  return (
    <Section
      id="financial"
      title="Financial health"
      meta={latest ? `Revenue through ${latest.label}` : undefined}
    >
      {/* Band 1 — revenue vs target */}
      <div className="mt-8 flex items-start justify-between gap-4">
        <div>
          <p className="t-eyebrow text-muted-foreground">Revenue</p>
          <p className="t-figure mt-2 tabular-nums">
            {latest ? (
              <AnimatedNumber value={latest.amountUsd} format={formatUsdCompact} />
            ) : (
              "—"
            )}
          </p>
          <p className="t-detail mt-2 tabular-nums text-muted-foreground">
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
        </div>
        <StatusBadge variant={pillar.state} />
      </div>

      {/* Band 2 — the two "why" reads */}
      <div className="mt-8 grid grid-cols-2 gap-12 border-t border-border pt-8">
        <ScrollReveal>
          <ChartHeading
            title="Revenue vs target"
            hint={
              <>
                Each point is one month of billed revenue. The dashed line is the{" "}
                {formatUsdCompact(fx.revenueTargetUsd)} monthly target — above the line is ahead of
                target, below it is short.
              </>
            }
          />
          <ChartContainer config={revenueConfig} className="mt-4 h-52 w-full">
            <AreaChart data={fx.revenueByMonth} margin={{ left: 4, right: 96, top: 12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={TICK_MONO}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                width={52}
                tick={TICK_MONO}
                tickFormatter={(v) => formatUsdCompact(Number(v))}
                axisLine={false}
                tickLine={false}
                tickCount={4}
                domain={([dataMin, dataMax]: readonly [number, number]) => [
                  Math.min(dataMin, fx.revenueTargetUsd) - 20_000,
                  Math.max(dataMax, fx.revenueTargetUsd) + 20_000,
                ]}
              />
              <ReferenceLine
                y={fx.revenueTargetUsd}
                stroke="var(--ink-1)"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: `${formatUsdCompact(fx.revenueTargetUsd)} target`,
                  position: "right",
                  offset: 8,
                  fill: "var(--ink-2)",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => formatUsdCompact(Number(v))} />}
              />
              <Area
                dataKey="amountUsd"
                type="monotone"
                fill="var(--chart-fill)"
                fillOpacity={1}
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <ChartHeading
            title="Margin by matter type"
            hint={
              <>
                One bar per kind of work. The bar is the share of the price kept as profit after
                delivery, so a longer bar is better. The dashed line is the {MARGIN_FLOOR_PCT}%
                floor — bars that stop short of it earn less than the firm allows.
              </>
            }
          />
          <ChartContainer config={marginByTypeConfig} className="mt-4 h-52 w-full">
            <BarChart data={byType} layout="vertical" margin={{ left: 0, right: 12 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={TICK_MONO}
                tickFormatter={(v) => `${v}%`}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={120}
                tick={TICK_SANS}
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
          {lowest && (
            <p className="t-detail mt-3 text-muted-foreground">
              {lowest.label} run {lowest.belowFloorPts > 0 ? `${lowest.belowFloorPts}pt below` : `${Math.abs(lowest.belowFloorPts)}pt above`} the {MARGIN_FLOOR_PCT}% floor, the thinnest of any type.
            </p>
          )}
        </ScrollReveal>
      </div>

      {/* Band 3 — the leak, demoted */}
      <div className="mt-12 border-t border-border pt-8">
        {ranked.length === 0 ? (
          <div className="flex items-center gap-3">
            <p className="t-detail text-muted-foreground">
              All open matters above the {MARGIN_FLOOR_PCT}% floor
            </p>
          </div>
        ) : (
          <>
            <p className="t-subhead">Margin shortfall</p>
            <p className="t-detail mt-1 tabular-nums text-muted-foreground">
              {formatUsdCompact(totalLeak)} across {ranked.length} open matter
              {ranked.length === 1 ? "" : "s"}, against the {MARGIN_FLOOR_PCT}% floor ·{" "}
              {ranked[0].client} is {leakConcentrationPct(fx)}% of it
            </p>

            <StaggerList className="mt-4 flex flex-col divide-y divide-border">
              {preview.map((m) => (
                <LeakRow key={m.id} m={m} />
              ))}
            </StaggerList>
            {rest.length > 0 && (
              <Collapsible className="mt-3">
                <CollapsibleTrigger className="t-detail w-fit cursor-pointer rounded-sm text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground focus-ring">
                  +{rest.length} more below the {MARGIN_FLOOR_PCT}% floor
                </CollapsibleTrigger>
                <CollapsiblePanel>
                  <StaggerList className="mt-1 flex flex-col divide-y divide-border">
                    {rest.map((m) => (
                      <LeakRow key={m.id} m={m} />
                    ))}
                  </StaggerList>
                </CollapsiblePanel>
              </Collapsible>
            )}
          </>
        )}
      </div>
    </Section>
  );
}
