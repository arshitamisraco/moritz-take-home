import { Separator } from "@/components/ui/separator";
import { clockTime } from "@/lib/format";
import type { ActivityEvent } from "@/lib/fixture/types";

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

export function Activity({ events }: { events: ActivityEvent[] }) {
  const sorted = [...events].sort((a, b) => b.offsetMs - a.offsetMs);

  return (
    <section aria-label="Activity" className="flex flex-col">
      <h2 className="t-section">Activity</h2>
      <Separator className="mt-4" />
      <ul className="mt-3 flex flex-col divide-y divide-border">
        {sorted.map((e) => (
          <li key={e.id} className="flex items-baseline justify-between gap-4 py-2">
            <span className="t-detail text-muted-foreground tabular-nums">
              {e.offsetMs <= 0 ? clockTime(e.offsetMs) : "now"}
            </span>
            <span className="t-eyebrow shrink-0 text-muted-foreground">
              {KIND_LABEL[e.kind] ?? e.kind}
            </span>
            <span className="t-detail flex-1 truncate text-right">{e.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
