import { StatusBadge } from "@/components/ledger/status-badge";
import type { PillarResult } from "@/lib/derive/pillars";
import { cn } from "@/lib/utils";

const LABEL = { health: "Health", workload: "Workload", financial: "Financial" } as const;

export function StatusChips({
  health,
  workload,
  financial,
}: {
  health: PillarResult;
  workload: PillarResult;
  financial: PillarResult;
}) {
  const items = [
    { key: "health", r: health },
    { key: "workload", r: workload },
    { key: "financial", r: financial },
  ] as const;

  return (
    <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
      {items.map(({ key, r }) => (
        <div key={key} className="flex flex-col items-start gap-1.5 px-3 py-3">
          <StatusBadge variant={r.state} />
          <p
            className={cn(
              "t-figure",
              r.state === "breaking" ? "text-breaking" : "text-foreground"
            )}
          >
            {r.headline}
          </p>
          <p className="t-detail text-muted-foreground">{LABEL[key]}</p>
        </div>
      ))}
    </div>
  );
}
