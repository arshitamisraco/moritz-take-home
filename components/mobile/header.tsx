"use client";

import { Search } from "lucide-react";
import { todayLongLabel } from "@/lib/format";

export function MobileHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex flex-col">
        <p className="t-wordmark text-foreground">Mysil</p>
        <p className="t-detail text-muted-foreground">{todayLongLabel()} · Oslo · London · SF</p>
      </div>
      <button
        type="button"
        onClick={onOpenPalette}
        aria-label="Search"
        className="rounded-sm p-2 text-muted-foreground focus-ring"
      >
        <Search className="size-4" aria-hidden="true" />
      </button>
    </header>
  );
}
