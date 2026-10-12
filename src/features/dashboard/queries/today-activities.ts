import { deriveDateOutcomes } from "../derive";
import type { TodayActivityItem } from "../types";
import { type DashboardScope } from "./shared";

/**
 * Today's expected activities with their recorded (or unrecorded) outcome.
 * Derived at read time from the schedule version effective today — never
 * from the current plan retroactively.
 */
export function deriveTodayActivities(
  scope: DashboardScope,
): TodayActivityItem[] {
  const { today, versions, executions, activityById, goalById } = scope;

  return deriveDateOutcomes(today, versions, executions)
    .map((outcome) => {
      const activity = activityById.get(outcome.activityId);
      if (!activity) {
        return null;
      }
      return {
        activityId: activity.id,
        activityTitle: activity.title,
        goalTitle: goalById.get(activity.goalId)?.title ?? "",
        status: outcome.status,
        note: outcome.note,
        expectedDurationMinutes: outcome.expectedDurationMinutes,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
