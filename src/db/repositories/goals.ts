import { and, asc, eq, inArray, sql } from "drizzle-orm";

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

export type CreateGoalRecord = {
  title: string;
  startDate: string;
  endDate: string | null;
};

export type CreateGoalRecordResult =
  | { ok: true; goal: typeof goals.$inferSelect }
  | { ok: false; code: "DUPLICATE_TITLE" };

/**
 * Whether the user already has an ACTIVE goal with this title, compared
 * case-insensitively. Archived titles are intentionally reusable.
 */
export async function goalTitleExists(
  userId: string,
  title: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: goals.id })
    .from(goals)
    .where(
      and(
        eq(goals.userId, userId),
        eq(goals.status, "ACTIVE"),
        sql`lower(${goals.title}) = ${title.toLowerCase()}`,
      ),
    )
    .limit(1);

  return rows.length > 0;
}

/**
 * Inserts a goal. The partial unique index makes duplicate ACTIVE titles
 * (case-insensitive) impossible even under concurrency
 * (23505 → DUPLICATE_TITLE).
 */
export async function createGoal(
  userId: string,
  record: CreateGoalRecord,
): Promise<CreateGoalRecordResult> {
  try {
    const [goal] = await db
      .insert(goals)
      .values({ userId, ...record })
      .returning();

    return { ok: true, goal };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, code: "DUPLICATE_TITLE" };
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}
