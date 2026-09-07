"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * A chart caption with an info affordance beside it. Charts here encode a
 * firm-specific rule — a dollar target, a margin floor — that the axes
 * alone can't say out loud, so the hint carries the plain-language read:
 * what one mark is, which direction is good, what the dashed line means.
 * Same Tooltip primitive the pillar cards use, so the two read as one
 * gesture rather than two explanation systems.
 */
export function ChartHeading({ title, hint }: { title: string; hint: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="t-subhead">{title}</p>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={`How to read: ${title}`}
              className="inline-flex cursor-help rounded-full text-ink-3 transition-wash hover:text-foreground focus-ring"
            >
              <Info className="size-3.5" aria-hidden />
            </button>
          }
        />
        <TooltipContent
          side="top"
          align="start"
          className="t-detail block max-w-64 py-2 text-left leading-relaxed normal-case"
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
