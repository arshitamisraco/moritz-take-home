"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * A figure that counts to its value the first time it scrolls into view,
 * and re-counts from wherever it was whenever the ledger changes it —
 * so a number that moves because of an action is seen to move. The DOM
 * always holds the formatted final value under reduce-motion, and the
 * element is a plain <span> so tabular-nums and the type scale apply as
 * they would to static text.
 */
export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  className,
  duration = 0.9,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });
  const reduce = useReducedMotion();
  /** Where the next count starts — the last value the tween passed
   * through, so a value that changes mid-count carries on from there. */
  const from = useRef(0);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    if (reduce || !inView) {
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        from.current = n;
        setRunning(format(n));
      },
      onComplete: () => setRunning(null),
    });
    return () => controls.stop();
    // `format` is a call-site literal; re-running on its identity would
    // restart the count on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {running ?? format(value)}
    </span>
  );
}
