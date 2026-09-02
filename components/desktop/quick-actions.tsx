"use client";

import { Plus, Search, FileText, Users } from "lucide-react";
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
    <section aria-label="Quick actions" className="flex flex-col pb-16">
      <p className="t-eyebrow text-muted-foreground">Quick actions</p>
      <Separator className="mt-4" />
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="flex items-center gap-1.5 t-detail text-foreground hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
          >
            <a.icon className="size-3.5" aria-hidden="true" />
            {a.label}
          </button>
        ))}
      </div>
    </section>
  );
}
