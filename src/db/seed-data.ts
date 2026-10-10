import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "./index";
import { activities, goals, scheduleVersions, users } from "./schema";

export const DEV_PASSWORD = "dev-password-123";

export const SEED = {
  user: {
    name: "Dev User",
    timezone: "Asia/Tehran",
  },
  goal: {
    title: "Learn English",
    status: "ACTIVE",
  },
  activity: {
    title: "Study vocabulary",
    status: "ACTIVE",
  },
  scheduleVersion: {
    effectiveStartDate: "2026-10-05",
    effectiveEndDate: null,
  },
  days: ["MONDAY", "WEDNESDAY", "FRIDAY"],
  executions: [
    {
      date: "2026-10-05",
      status: "COMPLETED",
      note: null,
    },
    {
      date: "2026-10-07",
      status: "PARTIAL",
      note: "Only had 20 minutes",
    },
  ],
} as const;

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type SeedGraph = {
  user: typeof users.$inferSelect;
  goal: typeof goals.$inferSelect;
  activity: typeof activities.$inferSelect;
  scheduleVersion: typeof scheduleVersions.$inferSelect;
};

export async function findSeedUser(tx: Tx) {
  const rows = await tx
    .select()
    .from(users)
    .where(
      and(
        eq(users.name, SEED.user.name),
        eq(users.timezone, SEED.user.timezone),
      ),
    )
    .orderBy(asc(users.createdAt))
    .limit(1);
  return rows[0];
}

export async function findSeedGoal(tx: Tx, userId: string) {
  const rows = await tx
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.title, SEED.goal.title)))
    .orderBy(asc(goals.createdAt))
    .limit(1);
  return rows[0];
}

export async function findSeedActivity(tx: Tx, goalId: string) {
  const rows = await tx
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.goalId, goalId),
        eq(activities.title, SEED.activity.title),
      ),
    )
    .orderBy(asc(activities.createdAt))
    .limit(1);
  return rows[0];
}

export async function findSeedScheduleVersion(tx: Tx, activityId: string) {
  const rows = await tx
    .select()
    .from(scheduleVersions)
    .where(
      and(
        eq(scheduleVersions.activityId, activityId),
        eq(
          scheduleVersions.effectiveStartDate,
          SEED.scheduleVersion.effectiveStartDate,
        ),
        isNull(scheduleVersions.effectiveEndDate),
      ),
    )
    .orderBy(asc(scheduleVersions.createdAt))
    .limit(1);
  return rows[0];
}

export async function resolveSeedGraph(): Promise<SeedGraph | null> {
  return db.transaction(async (tx) => {
    const user = await findSeedUser(tx);
    if (!user) {
      return null;
    }

    const goal = await findSeedGoal(tx, user.id);
    if (!goal) {
      return null;
    }

    const activity = await findSeedActivity(tx, goal.id);
    if (!activity) {
      return null;
    }

    const scheduleVersion = await findSeedScheduleVersion(tx, activity.id);
    if (!scheduleVersion) {
      return null;
    }

    return { user, goal, activity, scheduleVersion };
  });
}
