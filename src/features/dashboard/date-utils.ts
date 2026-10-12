import { dayOfWeekEnum } from "@/db/schema/enums";

export type DayOfWeek = (typeof dayOfWeekEnum.enumValues)[number];

/**
 * A local calendar date in "YYYY-MM-DD" form.
 * Calendar-domain concept — never convert to a UTC timestamp.
 */
export type CalendarDate = string;

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const satisfies readonly DayOfWeek[];

function toUtcDate(date: CalendarDate): Date {
  return new Date(`${date}T00:00:00Z`);
}

/** Current calendar date in the given IANA timezone, as "YYYY-MM-DD". */
export function localDateInTimezone(
  timeZone: string,
  at: Date = new Date(),
): CalendarDate {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(at);
}

/** Current hour (0–23) in the given IANA timezone. */
export function localHourInTimezone(timeZone: string, at: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone, hour: "numeric", hour12: false }).format(at),
  );
}

/** Day-of-week domain enum for a calendar date. */
export function dayOfWeekEnumFor(date: CalendarDate): DayOfWeek {
  return DAY_NAMES[toUtcDate(date).getUTCDay()];
}

/** Adds (or subtracts) days from a calendar date. Pure string-in/string-out. */
export function addDays(date: CalendarDate, days: number): CalendarDate {
  const utc = toUtcDate(date);
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

/** Start of the ISO week (Monday) containing the given calendar date. */
export function weekStart(date: CalendarDate): CalendarDate {
  const dayIndex = DAY_NAMES.indexOf(dayOfWeekEnumFor(date));
  return addDays(date, -((dayIndex + 6) % 7));
}

/** Inclusive list of calendar dates from `from` to `to`. */
export function rangeOfDates(from: CalendarDate, to: CalendarDate): CalendarDate[] {
  if (from > to) {
    return [];
  }

  const dates: CalendarDate[] = [];
  for (let current = from; current <= to; current = addDays(current, 1)) {
    dates.push(current);
  }
  return dates;
}
