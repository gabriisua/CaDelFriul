import {
  addDays,
  differenceInDays,
  eachDayOfInterval,
  format,
} from "date-fns";

/** Format a Date to a canonical local "yyyy-MM-dd" key (TZ-proof for Set comparisons and reservation payloads). */
export function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Number of nights between two dates; 0 when `to <= from`. */
export function computeNights(from: Date, to: Date): number {
  return Math.max(0, differenceInDays(to, from));
}

/**
 * First blocked date key strictly BETWEEN `from` and `to` (booked or past),
 * or `null` when the interior is clean. Endpoints are excluded by design:
 * react-day-picker already disables them.
 */
export function findBlockedDate(
  from: Date,
  to: Date,
  blockedKeys: ReadonlySet<string>,
  todayKey: string
): string | null {
  const interior = eachDayOfInterval({
    start: addDays(from, 1),
    end: addDays(to, -1),
  });
  for (const d of interior) {
    const key = toDateKey(d);
    if (blockedKeys.has(key) || key < todayKey) return key;
  }
  return null;
}
