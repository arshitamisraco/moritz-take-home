import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The shell a top-level dashboard section wears on the paper ground — the
 * structural role <Card> used to play for Workload / Pulse / Financial,
 * minus the ring and the raised fill. Owns the scroll-anchor id, the
 * heading row (serif title + optional right-aligned meta), and the break
 * from the section above: a full-bleed hairline over standing space.
 *
 * <NeedsAttention> keeps its own markup — it's the one block that still
 * earns a card, three of them now, one per urgent count.
 */
export function Section({
  id,
  title,
  meta,
  children,
  className,
}: {
  id: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={cn("mt-16 border-t border-border pt-10", className)}
    >
      <div className="flex items-baseline justify-between gap-6">
        <h2 className="t-section">{title}</h2>
        {meta != null && (
          <div className="t-detail tabular-nums text-muted-foreground">{meta}</div>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
