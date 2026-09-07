"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { cn } from "@/lib/utils"

function Collapsible({ className, ...props }: CollapsiblePrimitive.Root.Props) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={className}
      {...props}
    />
  )
}

/**
 * The row that opens the panel. Carries `group/collapsible` so a call site
 * can react to open state — e.g. rotate a chevron with
 * `group-data-[panel-open]/collapsible:rotate-90`.
 */
function CollapsibleTrigger({ className, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn("group/collapsible", className)}
      {...props}
    />
  )
}

/**
 * Height-animated contents. Base UI writes the natural height into
 * `--collapsible-panel-height`; we transition to and from 0 on the
 * starting / ending frames. The panel unmounts once closed, so nothing is
 * read by AT or found by page search while hidden.
 */
function CollapsiblePanel({ className, ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-panel"
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out",
        "data-[starting-style]:h-0 data-[ending-style]:h-0",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
  // shadcn-style alias for the same part
  CollapsiblePanel as CollapsibleContent,
}
