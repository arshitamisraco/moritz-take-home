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

export function MobileActivity({ events }: { events: ActivityEvent[] }) {
  const top = [...events].sort((a, b) => b.offsetMs - a.offsetMs).slice(0, 2);
  return (
    <section id="m-activity" className="border-b border-border px-4 py-4 pb-20">
      <p className="t-eyebrow text-muted-foreground">Activity</p>
      <ul className="mt-2 flex flex-col gap-2">
        {top.map((e) => (
          <li key={e.id} className="flex items-baseline justify-between gap-3">
            <span className="t-detail">
              {KIND_LABEL[e.kind] ?? e.kind} · {e.detail}
            </span>
            <span className="t-detail shrink-0 text-muted-foreground tabular-nums">
              {e.offsetMs <= 0 ? clockTime(e.offsetMs) : "now"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
