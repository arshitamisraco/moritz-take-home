import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { clockTime } from "@/lib/format";
import type { ActivityEvent, PulseDay, TodayPulse } from "@/lib/fixture/types";

const KIND_LABEL: Record<string, string> = {
  opened: "opened",
  conflicts_cleared: "conflicts cleared",
  filing_sent: "filing sent",
  delivered: "delivered",
  meeting: "meeting",
  onboarding: "onboarding",
  reassigned: "reassigned",
  chased: "chased",
  halted: "halted",
  escalated: "escalated",
  conflicts_expedited: "conflicts expedited",
  availability_requested: "availability requested",
};

function Sparkline({ days }: { days: PulseDay[] }) {
  const max = Math.max(...days.map((d) => d.count), 1);
  return (
    <div className="mt-8 flex items-end gap-4">
      {days.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-2">
          <span className="t-detail tabular-nums text-muted-foreground">{d.count}</span>
          <div className="flex h-20 w-7 items-end bg-accent">
            <div className="w-full bg-chart-3" style={{ height: `${(d.count / max) * 100}%` }} />
          </div>
          <span className="t-eyebrow text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Firm pulse, not a feed. A four-number tally answers "busy, quiet or
 * accelerating" in one glance; the full chronological log is one click
 * away for anyone who wants the play-by-play.
 */
export function Pulse({
  pulse,
  weeklyPulse,
  events,
}: {
  pulse: TodayPulse;
  weeklyPulse: PulseDay[];
  events: ActivityEvent[];
}) {
  const tiles: { label: string; value: number }[] = [
    { label: "Filings", value: pulse.filings },
    { label: "Meetings", value: pulse.meetings },
    { label: "New matters", value: pulse.newMatters },
    { label: "Onboardings", value: pulse.onboardings },
  ];
  const sorted = [...events].sort((a, b) => b.offsetMs - a.offsetMs);

  return (
    <Card id="pulse" aria-label="Firm pulse" className="mt-8">
      <CardHeader>
        <h2 className="t-section">Firm pulse</h2>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-4 divide-x divide-border">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-2 px-8 first:pl-0">
            <p className="t-figure text-[32px]">{t.value}</p>
            <p className="t-detail text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>

      <Sparkline days={weeklyPulse} />

      {sorted.length > 0 && (
        <details className="mt-12 border-t border-border pt-6">
          <summary className="t-detail cursor-pointer text-ink-2 underline decoration-1 underline-offset-[0.15em] hover:text-foreground focus-ring rounded-sm w-fit">
            Recent activity
          </summary>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {sorted.map((e) => (
              <li key={e.id} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="t-detail text-muted-foreground tabular-nums">
                  {e.offsetMs <= 0 ? clockTime(e.offsetMs) : "now"}
                </span>
                <span className="t-eyebrow shrink-0 text-muted-foreground">{KIND_LABEL[e.kind] ?? e.kind}</span>
                <span className="t-detail flex-1 truncate text-right">{e.detail}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      </CardContent>
    </Card>
  );
}
