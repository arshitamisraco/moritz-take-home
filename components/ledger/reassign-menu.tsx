"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadRatio } from "@/components/ledger/load-ratio";
import type { LawyerLoad } from "@/lib/derive/bench";

/**
 * reassign — the most important interaction on the page. Populated only
 * from lawyers with headroom, so picking a name is the whole fix.
 */
export function ReassignMenu({
  candidates,
  onPick,
  disabled,
}: {
  candidates: LawyerLoad[];
  onPick: (lawyerId: string, lawyerName: string) => void;
  disabled?: boolean;
}) {
  if (candidates.length === 0) {
    return (
      <span className="t-detail text-muted-foreground" aria-disabled="true">
        reassign
      </span>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="inline-flex items-center gap-0.5 t-detail text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
      >
        reassign
        <ChevronDown className="size-3" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 rounded-sm">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="t-eyebrow text-muted-foreground">
            headroom
          </DropdownMenuLabel>
          {candidates.map(({ lawyer }) => (
            <DropdownMenuItem
              key={lawyer.id}
              onClick={() => onPick(lawyer.id, lawyer.name)}
              className="flex items-center justify-between gap-3 rounded-sm"
            >
              <span className="t-body text-[14px]">{lawyer.name}</span>
              <LoadRatio committed={lawyer.committedMatters} declared={lawyer.declaredAvailability} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
