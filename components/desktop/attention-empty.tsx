import { StatusBadge } from "@/components/ledger/status-badge";
import { clockTime, dayLabel } from "@/lib/format";
import type { EffectiveMatter } from "@/lib/derive/apply-overlay";

/**
 * The empty state reports, it doesn't celebrate — the count of matters in
 * flight and the next deadline are both derived, never typed in, so the
 * zone still carries information instead of wasting the most valuable
 * space on the page.
 */
export function AttentionEmpty({
  next,
  matterCount,
}: {
  next: EffectiveMatter | null;
  matterCount?: number;
}) {
  return (
    <div className="flex flex-col gap-3 py-8">
      <p className="t-body">
        Nothing needs you right now
        {typeof matterCount === "number"
          ? `. ${matterCount} matters in flight, all inside their promised windows.`
          : "."}
      </p>
      {next && (
        <div className="flex items-center gap-3">
          <span className="t-eyebrow text-muted-foreground">next due</span>
          {next.deadlineKind && <StatusBadge variant={next.deadlineKind} />}
          <span className="t-detail" style={{ color: "var(--ink-2)" }}>
            {next.name} · {next.client}, {dayLabel(next.deadlineOffsetMs ?? 0)}{" "}
            {clockTime(next.deadlineOffsetMs ?? 0)}
          </span>
        </div>
      )}
    </div>
  );
}
