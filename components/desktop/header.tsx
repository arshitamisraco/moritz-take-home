"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { todayLongLabel } from "@/lib/format";

const OFFICES = "Oslo · London · SF";

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-border bg-background py-4">
      <div className="flex items-baseline gap-3 px-2 py-3">
        <p className="t-wordmark text-foreground">Mysil</p>
        <p className="t-detail text-muted-foreground">
          {todayLongLabel()} · {OFFICES}
        </p>
      </div>

      <nav className="flex items-center gap-2 px-2 py-3">
        <Button
          variant="ghost"
          onClick={onOpenPalette}
          className="text-muted-foreground hover:text-foreground"
        >
          <Search className="size-3.5" aria-hidden="true" />
          Search
          <kbd aria-hidden="true" className="t-eyebrow text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
      </nav>
    </header>
  );
}
