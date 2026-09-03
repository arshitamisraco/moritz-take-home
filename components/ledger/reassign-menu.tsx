"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
 * reassign — the most important interaction on the page. Secondary tier: a
 * 1px-bordered trigger with its own caret (the caret is a disclosure
 * affordance, not a row icon). Populated only from lawyers with headroom,
 * so picking a name is the whole fix.
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
        Reassign
      </span>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button variant="outline" size="sm" data-icon="inline-end">
            Reassign
            <ChevronDown className="size-3" aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56 rounded-[2px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="t-eyebrow text-muted-foreground">
            headroom
          </DropdownMenuLabel>
          {candidates.map(({ lawyer }) => (
            <DropdownMenuItem
              key={lawyer.id}
              onClick={() => onPick(lawyer.id, lawyer.name)}
              className="flex items-center justify-between gap-3 rounded-[2px]"
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
