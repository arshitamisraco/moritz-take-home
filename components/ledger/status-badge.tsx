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
 * One family, one axis: steady / straining / breaking — the computed pillar
 * and matter state, and the only thing on the page that is a badge. Steady
 * and straining are pale tints with dark ink. Breaking is the only solid
 * fill with white text on the entire screen — that contrast reversal is the
 * signal, so it is never reused for anything that isn't actually Breaking.
 *
 * Deadline kind (statutory / closing / promise) used to render here as a
 * second, colourless family. It was removed: the matter name and the
 * time-bucket header already carry it, and a colourless badge sharing this
 * shape read as a muted severity rather than a separate axis. The kind
 * still exists in the data and still drives copy in lib/derive/detail.ts.
 *
 * Colour never stands alone: every variant renders a swatch AND a word.
 */

const statusBadgeVariants = cva(
  "gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[12px] font-medium tracking-[0.08em] uppercase",
  {
    variants: {
      variant: {
        steady: "border-transparent bg-steady text-steady-foreground",
        straining: "border-transparent bg-straining text-straining-foreground",
        breaking: "border-transparent bg-breaking text-breaking-foreground",
      },
    },
  }
);

const swatchVariants = cva("inline-block size-1.5 shrink-0 rounded-full", {
  variants: {
    variant: {
      steady: "bg-steady-foreground",
      straining: "bg-straining-foreground",
      breaking: "bg-breaking-foreground",
    },
  },
});

const LABEL: Record<NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>, string> = {
  steady: "steady",
  straining: "straining",
  breaking: "breaking",
};

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
}

export function StatusBadge({ variant, className }: StatusBadgeProps) {
  const v = variant ?? "steady";
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ variant: v }), className)}
    >
      <span aria-hidden="true" className={swatchVariants({ variant: v })} />
      {LABEL[v]}
    </Badge>
  );
}
