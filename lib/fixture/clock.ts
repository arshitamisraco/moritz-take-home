/**
 * DEMO_NOW — the one clock. Every deadline and every activity timestamp is
 * stored as an offset in ms from this instant, so moving this one line
 * moves the whole dataset. Declared in UTC explicitly so the server
 * (build/SSR) and the client resolve the same instant regardless of
 * machine timezone — nothing here ever calls `new Date()` for the current
 * time, and no header clock ticks.
 */
export const DEMO_NOW_MS = Date.UTC(2026, 8, 7, 10, 0, 0); // Mon 7 Sep 2026, 10:00

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

export function offsetToDate(offsetMs: number): Date {
  return new Date(DEMO_NOW_MS + offsetMs);
}
