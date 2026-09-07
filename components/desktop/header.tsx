"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Button } from "@/components/ui/button";
import { EASE } from "@/components/motion/reveal";
import { todayLongLabel } from "@/lib/format";

const OFFICES = "Oslo · London · SF";

/** The header condenses once the page moves: the standing space around the
 * wordmark halves, so a scrolled page reads as scrolled without the bar
 * ever leaving. It sits above <main> (not inside its centered column) so
 * its background covers the full viewport edge to edge, with the
 * wordmark/nav re-centered to the same 1200px column inside it. */
export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setCondensed(y > 24));

  return (
    <motion.header
      className="sticky top-0 z-20 border-b border-border bg-background"
      animate={{
        paddingTop: condensed ? 6 : 16,
        paddingBottom: condensed ? 6 : 16,
      }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6">
        <div className="flex items-baseline gap-3 px-2 py-3">
          <p className="t-wordmark text-foreground">Mysil</p>
          <motion.p
            className="t-detail text-muted-foreground"
            animate={{ opacity: condensed ? 0.65 : 1 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {todayLongLabel()} · {OFFICES}
          </motion.p>
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
      </div>
    </motion.header>
  );
}
