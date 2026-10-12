import { findExecutionsInRange } from "@/db/repositories/executions";
import {
  findActiveGoalsWithActivities,
  type GoalWithActivities,
} from "@/db/repositories/goals";
import { findVersionsEffectiveInRange } from "@/db/repositories/schedules";

import { localDateInTimezone, type CalendarDate } from "../date-utils";
import type { ExecutionInput, ScheduleVersionInput } from "../derive";

type ActivityRow = GoalWithActivities["activities"][number];

export const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export function toVersionInputs(
  rows: Awaited<ReturnType<typeof findVersionsEffectiveInRange>>,
): ScheduleVersionInput[] {
  return rows.map(({ version, days }) => ({
    activityId: version.activityId,
    effectiveStartDate: version.effectiveStartDate,
    effectiveEndDate: version.effectiveEndDate,
    expectedDurationMinutes: version.expectedDurationMinutes,
    days: days.map((day) => day.dayOfWeek),
  }));
}

export function toExecutionInputs(
  rows: Awaited<ReturnType<typeof findExecutionsInRange>>,
): ExecutionInput[] {
  return rows.map((row) => ({
    activityId: row.activityId,
    date: row.date,
    status: row.status,
    note: row.note,
  }));
}

export function dayLabel(date: CalendarDate): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

export type DashboardScope = {
  today: CalendarDate;
  goalsWithActivities: GoalWithActivities[];
  versions: ScheduleVersionInput[];
  executions: ExecutionInput[];
  activityById: Map<string, ActivityRow>;
  goalById: Map<string, GoalWithActivities["goal"]>;
};

/**
 * Shared loading step for dashboard queries. getDashboardData loads the
 * scope once with the widest range the sections need; the per-section
 * derive functions are pure over the resulting DashboardScope.
 */
export async function loadDashboardScope(
  userId: string,
  timezone: string,
  rangeFrom: (today: CalendarDate) => CalendarDate,
): Promise<DashboardScope> {
  const goalsWithActivities = await findActiveGoalsWithActivities(userId);
  const today = localDateInTimezone(timezone);
  const rangeStartDate = rangeFrom(today);

  const activityRows = goalsWithActivities.flatMap((entry) => entry.activities);
  const activityIds = activityRows.map((activity) => activity.id);

  const [versionRows, executionRows] =
    activityIds.length > 0
      ? await Promise.all([
          findVersionsEffectiveInRange(userId, activityIds, rangeStartDate, today),
          findExecutionsInRange(userId, activityIds, rangeStartDate, today),
        ])
      : [[], []];

  return {
    today,
    goalsWithActivities,
    versions: toVersionInputs(versionRows),
    executions: toExecutionInputs(executionRows),
    activityById: new Map(activityRows.map((activity) => [activity.id, activity])),
    goalById: new Map(
      goalsWithActivities.map((entry) => [entry.goal.id, entry.goal]),
    ),
  };
}
