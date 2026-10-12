import { rangeOfDates, weekStart } from "../date-utils";
import { deriveDateOutcomes } from "../derive";
import type { WeekCounts } from "../types";
import { type DashboardScope } from "./shared";

/**
 * Outcome counts for the current week (Monday → today, inclusive).
 * Counts only — no percentages, so no denominator decision is implied.
 * Missing execution records count as "unrecorded", never as missed.
 */
export function deriveWeekCounts(scope: DashboardScope): WeekCounts {
  const { today, versions, executions } = scope;

  const week: WeekCounts = {
    expected: 0,
    completed: 0,
    partial: 0,
    notCompleted: 0,
    unrecorded: 0,
  };

  for (const date of rangeOfDates(weekStart(today), today)) {
    for (const outcome of deriveDateOutcomes(date, versions, executions)) {
      week.expected += 1;
      if (outcome.status === "COMPLETED") week.completed += 1;
      else if (outcome.status === "PARTIAL") week.partial += 1;
      else if (outcome.status === "NOT_COMPLETED") week.notCompleted += 1;
      else week.unrecorded += 1;
    }
  }

  return week;
}
