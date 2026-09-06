"use client";

import { Plus, FileText, Search, Users } from "lucide-react";

function scrollToWorkload() {
  document.getElementById("m-workload")?.scrollIntoView({ block: "start" });
}

export function MobileQuickActions({ onOpenPalette }: { onOpenPalette: () => void }) {
  const actions = [
    { label: "New matter", icon: Plus, onClick: onOpenPalette },
    { label: "Reassign", icon: Users, onClick: scrollToWorkload },
    { label: "Deadlines", icon: FileText, onClick: scrollToWorkload },
    { label: "Search", icon: Search, onClick: onOpenPalette },
  ];

  return (
    <section id="m-actions" className="grid grid-cols-4 divide-x divide-border border-b border-border pb-8">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={a.onClick}
          className="flex flex-col items-center gap-2 px-2 py-6 text-foreground transition-wash hover:bg-accent active:bg-surface-active focus-ring-inset"
        >
          <a.icon className="size-4" aria-hidden="true" />
          <span className="t-eyebrow-plain text-center text-muted-foreground">{a.label}</span>
        </button>
      ))}
    </section>
  );
}
