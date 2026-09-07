"use client";

import { ChevronDown } from "lucide-react";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/**
 * The trigger row for a Collapsible list item — one flat hover wash, a
 * trailing chevron that rotates open. Shared by the bench (desktop and
 * mobile) and Firm pulse's day rows so every disclosure in the product
 * animates and washes the same way.
 */
export function DisclosureRow({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger>) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group/collapsible flex w-full cursor-pointer items-center gap-6 rounded-sm -mx-2 px-2 py-3 text-left transition-wash hover:bg-accent focus-ring",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/collapsible:rotate-180"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  );
}
