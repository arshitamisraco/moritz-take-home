"use client";

import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { EffectiveFixture } from "@/lib/derive/apply-overlay";

const SECTIONS = [
  { id: "pillars", mobileId: "m-top", label: "Pillars" },
  { id: "attention", mobileId: "m-attention", label: "Attention" },
  { id: "bench", mobileId: "m-bench", label: "Bench" },
  { id: "financial", mobileId: null, label: "Financial" },
  { id: "activity", mobileId: "m-activity", label: "Activity" },
];

/** Both trees are mounted at once (desktop hidden on mobile viewports and
 * vice versa via CSS), so ids can't be shared — this jumps to whichever
 * one is actually visible, falling back to the other when only one exists. */
function scrollToSection(id: string, mobileId: string | null) {
  const desktopEl = document.getElementById(id);
  if (desktopEl && desktopEl.offsetParent !== null) {
    desktopEl.scrollIntoView({ block: "start" });
    return;
  }
  const mobileEl = mobileId ? document.getElementById(mobileId) : null;
  if (mobileEl) {
    mobileEl.scrollIntoView({ block: "start" });
    return;
  }
  desktopEl?.scrollIntoView({ block: "start" });
}

export function CommandPalette({
  fx,
  open,
  onOpenChange,
  onOpenMatter,
}: {
  fx: EffectiveFixture;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenMatter: (matterId: string) => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} className="rounded-sm">
      <Command>
        <CommandInput placeholder="Jump to a matter, lawyer or section" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Sections">
            {SECTIONS.map((s) => (
              <CommandItem
                key={s.id}
                onSelect={() => {
                  onOpenChange(false);
                  scrollToSection(s.id, s.mobileId);
                }}
                className="rounded-sm"
              >
                {s.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Matters">
            {fx.matters.slice(0, 40).map((m) => (
              <CommandItem
                key={m.id}
                value={`${m.name} ${m.client}`}
                onSelect={() => {
                  onOpenChange(false);
                  onOpenMatter(m.id);
                }}
                className="rounded-sm"
              >
                {m.name} · {m.client}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Lawyers">
            {fx.lawyers
              .filter((l) => l.committedMatters > 0)
              .slice(0, 20)
              .map((l) => (
                <CommandItem
                  key={l.id}
                  value={l.name}
                  onSelect={() => {
                    onOpenChange(false);
                    scrollToSection("bench", "m-bench");
                  }}
                  className="rounded-sm"
                >
                  {l.name} · {l.office}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function useCommandPaletteState() {
  return useState(false);
}
