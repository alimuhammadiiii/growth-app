import { versionEffectiveOn } from "../derive";
import type { GoalOverview } from "../types";
import { DAY_ORDER, type DashboardScope } from "./shared";

/**
 * Active goals with their activities and the current schedule summary
 * (days + expected duration from the version effective today). This is
 * plan info for the dashboard overview — separate from the goals page.
 */
export function deriveGoalsOverview(scope: DashboardScope): GoalOverview[] {
  const { today, goalsWithActivities, versions } = scope;

  return goalsWithActivities.map(({ goal, activities }) => ({
    id: goal.id,
    title: goal.title,
    activities: activities.map((activity) => {
      const current = versionEffectiveOn(versions, activity.id, today);
      return {
        id: activity.id,
        title: activity.title,
        days: current
          ? [...current.days].sort(
              (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
            )
          : [],
        expectedDurationMinutes: current?.expectedDurationMinutes ?? null,
      };
    }),
  }));
}
