import type { PulseDay, TodayPulse } from "@/lib/fixture/types";

export function MobilePulse({ pulse, weeklyPulse }: { pulse: TodayPulse; weeklyPulse: PulseDay[] }) {
  const max = Math.max(...weeklyPulse.map((d) => d.count), 1);
  const tiles: { label: string; value: number }[] = [
    { label: "Filings", value: pulse.filings },
    { label: "Meetings", value: pulse.meetings },
    { label: "New matters", value: pulse.newMatters },
    { label: "Onboardings", value: pulse.onboardings },
  ];

  return (
    <section id="m-pulse" className="border-b border-border px-4 py-4">
      <p className="t-eyebrow text-muted-foreground">Today</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {tiles.map((t) => (
          <div key={t.label}>
            <p className="t-body">{t.value}</p>
            <p className="t-detail text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-end gap-2.5">
        {weeklyPulse.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1">
            <div className="flex h-10 w-5 items-end bg-accent">
              <div className="w-full bg-chart-3" style={{ height: `${(d.count / max) * 100}%` }} />
            </div>
            <span className="t-eyebrow text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
