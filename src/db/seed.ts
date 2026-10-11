import { and, eq } from "drizzle-orm";

import { auth } from "../lib/auth";
import { db } from "./index";
import {
  DEV_PASSWORD,
  findSeedActivity,
  findSeedGoal,
  findSeedScheduleVersion,
  SEED,
  type Tx,
} from "./seed-data";
import { activities } from "./schema/activities";
import { executions } from "./schema/executions";
import { goals } from "./schema/goals";
import { scheduleVersionDays, scheduleVersions } from "./schema/schedules";
import { users } from "./schema/users";

type FindOrCreateResult<T> = { record: T; created: boolean };

async function main(): Promise<void> {
  async function findOrCreateUser(): Promise<FindOrCreateResult<typeof users.$inferSelect>> {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, SEED.user.email))
      .limit(1);
    if (existing[0]) {
      return { record: existing[0], created: false };
    }

    // Better Auth creates the user and its credential account atomically.
    await auth.api.signUpEmail({
      body: {
        name: SEED.user.name,
        email: SEED.user.email,
        username: SEED.user.username,
        password: DEV_PASSWORD,
        timezone: SEED.user.timezone,
      },
    });

    const created = await db
      .select()
      .from(users)
      .where(eq(users.email, SEED.user.email))
      .limit(1);
    if (!created[0]) {
      throw new Error("seed user missing after signUpEmail");
    }
    return { record: created[0], created: true };
  }

  async function findOrCreateGoal(tx: Tx, userId: string): Promise<FindOrCreateResult<typeof goals.$inferSelect>> {
    const existing = await findSeedGoal(tx, userId);
    if (existing) {
      return { record: existing, created: false };
    }

    const inserted = await tx
      .insert(goals)
      .values({ userId, title: SEED.goal.title, status: SEED.goal.status })
      .returning();

    return { record: inserted[0], created: true };
  }

  async function findOrCreateActivity(tx: Tx, goalId: string): Promise<FindOrCreateResult<typeof activities.$inferSelect>> {
    const existing = await findSeedActivity(tx, goalId);
    if (existing) {
      return { record: existing, created: false };
    }

    const inserted = await tx
      .insert(activities)
      .values({
        goalId,
        title: SEED.activity.title,
        status: SEED.activity.status,
      })
      .returning();

    return { record: inserted[0], created: true };
  }

  async function findOrCreateScheduleVersion(tx: Tx, activityId: string): Promise<FindOrCreateResult<typeof scheduleVersions.$inferSelect>> {
    const existing = await findSeedScheduleVersion(tx, activityId);
    if (existing) {
      return { record: existing, created: false };
    }

    const inserted = await tx
      .insert(scheduleVersions)
      .values({
        activityId,
        effectiveStartDate: SEED.scheduleVersion.effectiveStartDate,
        effectiveEndDate: SEED.scheduleVersion.effectiveEndDate,
      })
      .returning();

    return { record: inserted[0], created: true };
  }

  async function ensureScheduleDays(tx: Tx, scheduleVersionId: string) {
    const existing = await tx
      .select({ dayOfWeek: scheduleVersionDays.dayOfWeek })
      .from(scheduleVersionDays)
      .where(eq(scheduleVersionDays.scheduleVersionId, scheduleVersionId));

    const existingDays = new Set(existing.map((row) => row.dayOfWeek));
    const missingDays = SEED.days.filter((day) => !existingDays.has(day));

    if (missingDays.length > 0) {
      await tx.insert(scheduleVersionDays).values(
        missingDays.map((dayOfWeek) => ({
          scheduleVersionId,
          dayOfWeek,
        })),
      );
    }

    return { inserted: missingDays.length };
  }

  async function findOrCreateExecution(
    tx: Tx,
    activityId: string,
    execution: (typeof SEED.executions)[number],
  ): Promise<FindOrCreateResult<typeof executions.$inferSelect>> {
    const existing = await tx
      .select()
      .from(executions)
      .where(
        and(
          eq(executions.activityId, activityId),
          eq(executions.date, execution.date),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return { record: existing[0], created: false };
    }

    const inserted = await tx
      .insert(executions)
      .values({
        activityId,
        date: execution.date,
        status: execution.status,
        note: execution.note,
      })
      .returning();

    return { record: inserted[0], created: true };
  }

  try {
    const user = await findOrCreateUser();
    console.log(
      `user        ${user.created ? "created" : "reused   "} ${user.record.id} (name: ${user.record.name}, timezone: ${user.record.timezone})`,
    );

    await db.transaction(async (tx) => {
      const goal = await findOrCreateGoal(tx, user.record.id);
      console.log(
        `goal        ${goal.created ? "created" : "reused   "} ${goal.record.id} (title: ${goal.record.title})`,
      );

      const activity = await findOrCreateActivity(tx, goal.record.id);
      console.log(
        `activity    ${activity.created ? "created" : "reused   "} ${activity.record.id} (title: ${activity.record.title})`,
      );

      const scheduleVersion = await findOrCreateScheduleVersion(
        tx,
        activity.record.id,
      );
      console.log(
        `schedule    ${scheduleVersion.created ? "created" : "reused   "} ${scheduleVersion.record.id} [${scheduleVersion.record.effectiveStartDate}, ${scheduleVersion.record.effectiveEndDate ?? "null"})`,
      );

      const days = await ensureScheduleDays(tx, scheduleVersion.record.id);
      console.log(
        `days        inserted ${days.inserted} of ${SEED.days.length} (${SEED.days.join(", ")})`,
      );

      for (const execution of SEED.executions) {
        const result = await findOrCreateExecution(
          tx,
          activity.record.id,
          execution,
        );
        console.log(
          `execution   ${result.created ? "created" : "reused   "} ${result.record.id} (${result.record.date}, ${result.record.status}${result.record.note ? `, note: ${result.record.note}` : ", note: null"})`,
        );
      }
    });

    console.log("\nSeed complete.");
  } finally {
    await db.$client.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
