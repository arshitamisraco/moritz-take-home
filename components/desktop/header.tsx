"use client";

import { Search } from "lucide-react";

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-border py-4">
      <p className="t-section">Mysil</p>
      <button
        type="button"
        onClick={onOpenPalette}
        className="flex items-center gap-2 rounded-sm border border-border px-2.5 py-1.5 text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Search className="size-3.5" aria-hidden="true" />
        <span className="t-detail">search</span>
        <span className="t-eyebrow text-muted-foreground">⌘K</span>
      </button>
    </header>
  );
}
