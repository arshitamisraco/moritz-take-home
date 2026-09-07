"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { PRESS } from "@/components/motion/reveal";

/**
 * A 2px rule across the very top that fills as the page scrolls. The
 * dashboard is four long sections deep; this is the only indicator of how
 * much is left, and it costs no layout. Spring-damped so a trackpad
 * flick reads as travel rather than a jump.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-foreground/60"
    />
  );
}

/** Appears once the page has been scrolled past a screen, and returns to
 * the top on click. Hidden entirely until it's useful. */
export function BackToTop() {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShown(y > 800));

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          whileHover={{ y: -2 }}
          {...PRESS}
          className="fixed bottom-6 right-6 z-40 flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-wash hover:bg-accent hover:text-foreground focus-ring"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
