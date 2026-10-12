import { addDays, rangeOfDates } from "../date-utils";
import { deriveDateOutcomes } from "../derive";
import type { ChartDay } from "../types";
import { dayLabel, type DashboardScope } from "./shared";

/**
 * Per-day outcome counts for the last 7 days (today inclusive), for the
 * stacked chart. Each day counts only activities expected on that date
 * under the schedule version effective at the time.
 */
export function deriveChartDays(scope: DashboardScope): ChartDay[] {
  const { today, versions, executions } = scope;

  return rangeOfDates(addDays(today, -6), today).map((date) => {
    const counts = { completed: 0, partial: 0, notCompleted: 0, unrecorded: 0 };
    for (const outcome of deriveDateOutcomes(date, versions, executions)) {
      if (outcome.status === "COMPLETED") counts.completed += 1;
      else if (outcome.status === "PARTIAL") counts.partial += 1;
      else if (outcome.status === "NOT_COMPLETED") counts.notCompleted += 1;
      else counts.unrecorded += 1;
    }
    return { date, dayLabel: dayLabel(date), ...counts };
  });
}
