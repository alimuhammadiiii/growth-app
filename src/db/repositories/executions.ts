import { and, asc, between, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { activities } from "@/db/schema/activities";
import { executions } from "@/db/schema/executions";
import { goals } from "@/db/schema/goals";

export async function findExecutionsInRange(
  userId: string,
  activityIds: string[],
  dateFrom: string,
  dateTo: string,
): Promise<(typeof executions.$inferSelect)[]> {
  if (activityIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(executions)
    .where(
      and(
        inArray(
          executions.activityId,
          db
            .select({ id: activities.id })
            .from(activities)
            .innerJoin(goals, eq(activities.goalId, goals.id))
            .where(eq(goals.userId, userId)),
        ),
        inArray(executions.activityId, activityIds),
        between(executions.date, dateFrom, dateTo),
      ),
    )
    .orderBy(asc(executions.date));
}
