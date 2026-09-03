"use client";

import { Search } from "lucide-react";

export function MobileHeader({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-5">
      <p className="t-section">Mysil</p>
      <button
        type="button"
        onClick={onOpenPalette}
        aria-label="search"
        className="rounded-sm p-1.5 text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Search className="size-4" aria-hidden="true" />
      </button>
    </header>
  );
}
