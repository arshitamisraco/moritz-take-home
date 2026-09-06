"use client";

import { Plus, Search } from "lucide-react";

export function MobileHeader({
  onOpenPalette,
  onNewMatter,
}: {
  onOpenPalette: () => void;
  onNewMatter: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <p className="font-serif text-xl font-bold tracking-tight text-foreground">Mysil</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Search"
          className="rounded-sm p-2 text-muted-foreground focus-ring"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onNewMatter}
          aria-label="New matter"
          className="rounded-sm p-2 text-muted-foreground focus-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
