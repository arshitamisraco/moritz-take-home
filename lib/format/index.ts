import { DAY, HOUR, offsetToDate } from "@/lib/fixture/clock";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "14:00" — always from the fixed UTC clock, so server and client agree
 * regardless of machine timezone. */
export function clockTime(offsetMs: number): string {
  const d = offsetToDate(offsetMs);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** "today" / "yesterday" / "tomorrow" / weekday name / "Sep 12" — the
 * calendar label for an offset, always derived, never typed in per-row. */
export function dayLabel(offsetMs: number): string {
  const d = offsetToDate(offsetMs);
  const now = offsetToDate(0);
  const dUtcDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const nowUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.round((dUtcDay - nowUtcDay) / DAY);
  if (diffDays === 0) return "today";
  if (diffDays === -1) return "yesterday";
  if (diffDays === 1) return "tomorrow";
  if (diffDays > 1 && diffDays <= 6) return WEEKDAYS[d.getUTCDay()];
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/**
 * "Today · Mon 7 Sep" / "Yesterday · Sun 6 Sep" / "Fri 4 Sep" — a calendar
 * label for a day inside a backward-looking window. dayLabel only names
 * weekdays for forward offsets ("tomorrow", "Wednesday"), so it can't label
 * the pulse's trailing 7 days.
 */
export function pastDayLabel(offsetMs: number): string {
  const d = offsetToDate(offsetMs);
  const now = offsetToDate(0);
  const dUtcDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const nowUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.round((dUtcDay - nowUtcDay) / DAY);
  const stamp = `${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  if (diffDays === 0) return `Today · ${stamp}`;
  if (diffDays === -1) return `Yesterday · ${stamp}`;
  return stamp;
}

export function formatPct(value: number): string {
  return value < 0 ? `−${Math.abs(value)}%` : `${value}%`;
}

export function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatUsdCompact(value: number): string {
  if (Math.abs(value) >= 1000) {
    const k = value / 1000;
    return `$${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return formatUsd(value);
}

export function hoursSince(offsetMs: number): number {
  return Math.round(-offsetMs / HOUR);
}

/** "Sep 7" — today's calendar date, read off the fixed demo clock rather
 * than typed into the header. */
export function todayDateLabel(): string {
  const d = offsetToDate(0);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "morning" / "afternoon" / "evening", from the demo clock's hour — the
 * header greeting is never hardcoded to match whatever DEMO_NOW says. */
export function greetingWord(): string {
  const h = offsetToDate(0).getUTCHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

const UNPLACED_REASON_LABEL: Record<string, string> = {
  no_capacity: "no lawyer with capacity",
  no_expertise_match: "no expertise match",
  conflicts_pending: "conflicts pending",
};

export function unplacedReasonLabel(reason: string | null): string {
  if (!reason) return "";
  return UNPLACED_REASON_LABEL[reason] ?? reason;
}
