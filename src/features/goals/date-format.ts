import { format } from "date-fns";

/**
 * Calendar-domain helpers shared by the goals feature UI. Values are
 * "YYYY-MM-DD" local calendar dates — converted to local-midnight Dates
 * only for display, never stored as instants.
 */
export function fromCalendarString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatCalendarDate(
  value: string,
  pattern = "MMM d, yyyy",
): string {
  return format(fromCalendarString(value), pattern);
}
