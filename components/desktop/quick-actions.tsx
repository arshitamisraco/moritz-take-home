"use client";

import { Plus, Search, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

/**
 * The efficiency criterion: compact, always-reachable actions rather than
 * a dedicated card. Two route to the live workflows this ledger already
 * supports (reassigning load, the deadline queue); the other two are the
 * entry points to flows this single-page demo doesn't implement, so they
 * open the one universal entry point — search — rather than pretend to
 * file a matter or a report.
 */
export function QuickActions({ onOpenPalette }: { onOpenPalette: () => void }) {
  const actions = [
    { label: "New matter", icon: Plus, onClick: onOpenPalette },
    { label: "Reassign work", icon: Users, onClick: () => scrollToSection("workload") },
    { label: "View deadlines", icon: FileText, onClick: () => scrollToSection("workload") },
    { label: "Generate report", icon: Search, onClick: onOpenPalette },
  ];

  return (
    <section aria-label="Quick actions" className="mt-8 flex flex-col pb-16">
      <p className="t-eyebrow text-muted-foreground">Quick actions</p>
      <Separator className="mt-6" />
      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant="ghost"
            onClick={a.onClick}
            data-icon="inline-start"
          >
            <a.icon className="size-3.5" aria-hidden="true" />
            {a.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
