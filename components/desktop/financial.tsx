"use client";

import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts";
import { Section } from "@/components/desktop/section";
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

const revenueMarginConfig: ChartConfig = {
  amountUsd: { label: "Revenue", color: "var(--chart-2)" },
  marginPct: { label: "Margin", color: "var(--chart-1)" },
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

function leadSentence(fx: EffectiveFixture, ranked: EffectiveMatter[], totalLeak: number): string {
  if (ranked.length === 0) {
    return `Steady — all open matters are above the ${MARGIN_FLOOR_PCT}% margin floor.`;
  }
  const pillar = financialPillar(fx);
  const stateLabel = pillar.state === "breaking" ? "Breaking" : pillar.state === "straining" ? "Straining" : "Steady";
  const concentration = leakConcentrationPct(fx);
  return `${stateLabel} — ${ranked.length} open matter${ranked.length === 1 ? "" : "s"} ${
    ranked.length === 1 ? "is" : "are"
  } running below the ${MARGIN_FLOOR_PCT}% margin floor, costing ${formatUsdCompact(totalLeak)}. ${
    ranked[0].client
  } alone is ${concentration}% of it.`;
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
      <p className="t-body max-w-[70ch] text-pretty">{leadSentence(fx, ranked, totalLeak)}</p>

      {/* Band 1 — the leak */}
      <div className="mt-8">
        {ranked.length === 0 ? (
          <div className="flex items-center gap-3">
            <StatusBadge variant={pillar.state} />
            <p className="t-detail text-muted-foreground">
              All open matters above the {MARGIN_FLOOR_PCT}% floor
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="t-eyebrow text-muted-foreground">Margin shortfall</p>
                <p className="t-figure mt-1">{formatUsdCompact(totalLeak)}</p>
                <p className="t-detail mt-1 text-muted-foreground">
                  across {ranked.length} open matter{ranked.length === 1 ? "" : "s"}, against the{" "}
                  {MARGIN_FLOOR_PCT}% floor
                </p>
              </div>
              <StatusBadge variant={pillar.state} />
            </div>

            <ul className="mt-6 flex flex-col divide-y divide-border">
              {preview.map((m) => (
                <LeakRow key={m.id} m={m} />
              ))}
            </ul>
            {rest.length > 0 && (
              <Collapsible className="mt-3">
                <CollapsibleTrigger className="t-detail w-fit cursor-pointer rounded-sm text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground focus-ring">
                  +{rest.length} more below the {MARGIN_FLOOR_PCT}% floor
                </CollapsibleTrigger>
                <CollapsiblePanel>
                  <ul className="mt-1 flex flex-col divide-y divide-border">
                    {rest.map((m) => (
                      <LeakRow key={m.id} m={m} />
                    ))}
                  </ul>
                </CollapsiblePanel>
              </Collapsible>
            )}
          </>
        )}
      </div>

      {/* Band 2 — the two "why" reads */}
      <div className="mt-12 grid grid-cols-2 gap-12 border-t border-border pt-8">
        <div>
          <p className="t-subhead">Where delivery costs most</p>
          <ChartContainer config={marginByTypeConfig} className="mt-4 h-44 w-full">
            <BarChart data={byType} layout="vertical" margin={{ left: 8, right: 12 }}>
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
                width={88}
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
          <p className="t-detail mt-3 text-muted-foreground">
            Financings take the most lawyer time per dollar billed.
          </p>
        </div>

        <div>
          <p className="t-subhead">Revenue vs margin</p>
          <ChartContainer config={revenueMarginConfig} className="mt-4 h-44 w-full">
            <ComposedChart data={fx.revenueByMonth} margin={{ left: 4, right: 4, top: 4, bottom: 4 }}>
              <XAxis dataKey="label" hide />
              <YAxis
                yAxisId="revenue"
                hide
                domain={["dataMin - 30000", "dataMax + 30000"]}
              />
              <YAxis yAxisId="margin" hide domain={[0, 100]} />
              <ReferenceLine
                yAxisId="margin"
                y={fx.marginTargetPct}
                stroke="var(--ink-1)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(v, name) =>
                      name === "amountUsd" ? formatUsdCompact(Number(v)) : `${v}%`
                    }
                  />
                }
              />
              <Area
                yAxisId="revenue"
                dataKey="amountUsd"
                type="monotone"
                fill="var(--chart-3)"
                fillOpacity={0.25}
                stroke="var(--chart-2)"
                strokeWidth={1.5}
              />
              <Line
                yAxisId="margin"
                dataKey="marginPct"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ChartContainer>
          <p className="t-detail mt-3 tabular-nums text-muted-foreground">
            {latest ? formatUsdCompact(latest.amountUsd) : "—"} {latest?.label}
            {changePct !== null && (
              <>
                {" "}
                · <span className={changePct < 0 ? "text-breaking" : undefined}>
                  {changePct >= 0 ? "↑" : "↓"} {Math.abs(changePct)}%
                </span>
              </>
            )}{" "}
            · {attainment}% of {formatUsdCompact(fx.revenueTargetUsd)} target
          </p>
        </div>
      </div>
    </Section>
  );
}
