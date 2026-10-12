import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { activities } from "@/db/schema/activities";
import { activityStatusEnum, goalStatusEnum } from "@/db/schema/enums";
import { goals } from "@/db/schema/goals";

export type GoalStatus = (typeof goalStatusEnum.enumValues)[number];
export type ActivityStatus = (typeof activityStatusEnum.enumValues)[number];

export type GoalWithActivities = {
  goal: typeof goals.$inferSelect;
  activities: (typeof activities.$inferSelect)[];
};

/**
 * Loads goals (filtered by status) together with their activities
 * (filtered by status), ordered by creation. Ownership is always scoped
 * to the authenticated user.
 */
export async function findGoalsWithActivities(
  userId: string,
  goalStatuses: GoalStatus[],
  activityStatuses: ActivityStatus[],
): Promise<GoalWithActivities[]> {
  const goalRows = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), inArray(goals.status, goalStatuses)))
    .orderBy(asc(goals.createdAt));

  if (goalRows.length === 0) {
    return [];
  }

  const activityRows = await db
    .select()
    .from(activities)
    .where(
      and(
        inArray(
          activities.goalId,
          goalRows.map((goal) => goal.id),
        ),
        inArray(activities.status, activityStatuses),
      ),
    )
    .orderBy(asc(activities.createdAt));

  return goalRows.map((goal) => ({
    goal,
    activities: activityRows.filter((activity) => activity.goalId === goal.id),
  }));
}

/** Active goals with their active activities (the working plan). */
export function findActiveGoalsWithActivities(userId: string) {
  return findGoalsWithActivities(userId, ["ACTIVE"], ["ACTIVE"]);
}

/** All goals with all their activities, including archived (history view). */
export function findAllGoalsWithActivities(userId: string) {
  return findGoalsWithActivities(
    userId,
    ["ACTIVE", "ARCHIVED"],
    ["ACTIVE", "ARCHIVED"],
  );
}
