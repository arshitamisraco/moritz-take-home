import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge — the system-logic component.
 *
 * Never edits components/ui/badge.tsx. Wraps the shadcn Badge and overrides
 * its variant classes with our own cva so "state" reads as a first-class
 * concept in the codebase rather than a one-off className.
 *
 * Two families share one shape (swatch + word, 2px radius, no other badge
 * anywhere on the page uses a rounded pill):
 *   - severity: steady / straining / breaking — computed pillar and matter
 *     state. Steady and straining are pale tints with dark ink. Breaking is
 *     the only solid fill with white text on the entire screen — that
 *     contrast reversal is the signal, so it is never reused for anything
 *     that isn't actually Breaking.
 *   - kind: statutory / closing / promise — the deadline's kind, not its
 *     severity. Neutral ink on a hairline border; colour carries no
 *     meaning here because there is none to carry.
 * Colour never stands alone: every variant renders a swatch AND a word.
 */

const statusBadgeVariants = cva(
  "gap-1.5 rounded-[2px] border px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-[0.08em] uppercase",
  {
    variants: {
      variant: {
        steady: "border-transparent bg-steady text-steady-foreground",
        straining: "border-transparent bg-straining text-straining-foreground",
        breaking: "border-transparent bg-breaking text-breaking-foreground",
        statutory: "border-border bg-transparent text-foreground",
        closing: "border-border bg-transparent text-foreground",
        promise: "border-border bg-transparent text-foreground",
      },
    },
  }
);

const swatchVariants = cva("inline-block size-1.5 shrink-0", {
  variants: {
    variant: {
      steady: "rounded-full bg-steady-foreground",
      straining: "rounded-full bg-straining-foreground",
      breaking: "rounded-full bg-breaking-foreground",
      statutory: "rounded-[1px] bg-foreground",
      closing: "rounded-[1px] bg-foreground",
      promise: "rounded-[1px] bg-foreground",
    },
  },
});

const LABEL: Record<NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>, string> = {
  steady: "steady",
  straining: "straining",
  breaking: "breaking",
  statutory: "statutory",
  closing: "closing",
  promise: "promise",
};

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
  /** Override the rendered word; defaults to the variant name. */
  label?: string;
}

export function StatusBadge({ variant, className, label }: StatusBadgeProps) {
  const v = variant ?? "steady";
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ variant: v }), className)}
    >
      <span aria-hidden="true" className={swatchVariants({ variant: v })} />
      {label ?? LABEL[v]}
    </Badge>
  );
}
