import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One matter as a name/client line with a right-aligned figure. A flat,
 * read-only presentational row — no dispatch, no action slot. Desktop and
 * mobile financial both render the below-floor list from this; the caller
 * passes the type scale (t-body on desktop, t-detail on mobile) via
 * `className` rather than the row branching on surface.
 *
 * The action-bearing sibling is components/ledger/bench-matter-row.tsx,
 * whose right slot is wired to the reassign/locked decision — not reusable
 * for a standing figure.
 */
export function MatterRow({
  name,
  client,
  right,
  className,
}: {
  name: string;
  client: string;
  right: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("flex items-center justify-between gap-4 py-3", className)}>
      <p className="min-w-0 truncate">
        {name} <span className="text-muted-foreground">· {client}</span>
      </p>
      <span className="shrink-0 tabular-nums">{right}</span>
    </li>
  );
}
