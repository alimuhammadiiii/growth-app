import { and, asc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";

import { db } from "@/db";
import { activities } from "@/db/schema/activities";
import { goals } from "@/db/schema/goals";
import { scheduleVersionDays, scheduleVersions } from "@/db/schema/schedules";

export type ScheduleVersionWithDays = {
  version: typeof scheduleVersions.$inferSelect;
  days: (typeof scheduleVersionDays.$inferSelect)[];
};

/**
 * Finds schedule versions whose effective period overlaps the inclusive
 * date range [dateFrom, dateTo], together with their day-of-week rules.
 * Per-date effectiveness is resolved by the caller (derive layer).
 * Ownership is enforced at the query level: only activities belonging to
 * the user's goals are considered.
 */
export async function findVersionsEffectiveInRange(
  userId: string,
  activityIds: string[],
  dateFrom: string,
  dateTo: string,
): Promise<ScheduleVersionWithDays[]> {
  if (activityIds.length === 0) {
    return [];
  }

  const versions = await db
    .select()
    .from(scheduleVersions)
    .where(
      and(
        inArray(
          scheduleVersions.activityId,
          db
            .select({ id: activities.id })
            .from(activities)
            .innerJoin(goals, eq(activities.goalId, goals.id))
            .where(eq(goals.userId, userId)),
        ),
        inArray(scheduleVersions.activityId, activityIds),
        lte(scheduleVersions.effectiveStartDate, dateTo),
        or(
          isNull(scheduleVersions.effectiveEndDate),
          gte(scheduleVersions.effectiveEndDate, dateFrom),
        ),
      ),
    )
    .orderBy(asc(scheduleVersions.effectiveStartDate));

  if (versions.length === 0) {
    return [];
  }

  const days = await db
    .select()
    .from(scheduleVersionDays)
    .where(
      inArray(
        scheduleVersionDays.scheduleVersionId,
        versions.map((version) => version.id),
      ),
    );

  return versions.map((version) => ({
    version,
    days: days.filter((day) => day.scheduleVersionId === version.id),
  }));
}
