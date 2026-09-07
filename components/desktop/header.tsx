"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({
  onOpenPalette,
  onNewMatter,
}: {
  onOpenPalette: () => void;
  onNewMatter: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-border bg-background py-4">
      <p className="px-2 py-3 t-wordmark text-foreground">Mysil</p>

      <nav className="flex items-center gap-2 px-2 py-3">
        <Button
          variant="ghost"
          onClick={onOpenPalette}
          className="text-muted-foreground hover:text-foreground"
        >
          <Search className="size-3.5" aria-hidden="true" />
          Search
        </Button>
        <Button onClick={onNewMatter}>
          <Plus className="size-3.5" aria-hidden="true" />
          New matter
        </Button>
      </nav>
    </header>
  );
}
