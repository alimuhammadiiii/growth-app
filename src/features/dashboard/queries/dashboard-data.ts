import { addDays } from "../date-utils";
import type { ChartDay, GoalOverview, TodayActivityItem, WeekCounts } from "../types";
import { deriveGoalsOverview } from "./goals-overview";
import { loadDashboardScope } from "./shared";
import { deriveTodayActivities } from "./today-activities";
import { deriveWeekCounts } from "./week-summary";
import { deriveChartDays } from "./weekly-chart";

export type DashboardData = {
  todayActivities: TodayActivityItem[];
  week: WeekCounts;
  chart: ChartDay[];
  goals: GoalOverview[];
};

/**
 * Loads the dashboard scope once and derives every dashboard section from
 * it. The scope uses the widest range the sections need (last 7 days);
 * each derivation filters versions and executions per date, so the
 * superset is safe for the today-only views.
 */
export async function getDashboardData(
  userId: string,
  timezone: string,
): Promise<DashboardData> {
  const scope = await loadDashboardScope(
    userId,
    timezone,
    (t) => addDays(t, -6),
  );

  return {
    todayActivities: deriveTodayActivities(scope),
    week: deriveWeekCounts(scope),
    chart: deriveChartDays(scope),
    goals: deriveGoalsOverview(scope),
  };
}
