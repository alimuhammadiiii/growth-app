import { randomBytes, scryptSync } from "node:crypto";

import dotenv from "dotenv";
import { and, asc, eq, isNull } from "drizzle-orm";

import { activities } from "./schema/activities";
import { executions } from "./schema/executions";
import { goals } from "./schema/goals";
import { scheduleVersionDays, scheduleVersions } from "./schema/schedules";
import { users } from "./schema/users";

dotenv.config({ path: ".env.local" });
dotenv.config();

const DEV_PASSWORD = "dev-password-123";

function hashDevPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

const SEED = {
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

async function main(): Promise<void> {
  const { db } = await import("./index");

  type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

  async function findOrCreateUser(tx: Tx) {
    const existing = await tx
      .select()
      .from(users)
      .where(eq(users.timezone, SEED.user.timezone))
      .orderBy(asc(users.createdAt))
      .limit(1);

    if (existing[0]) {
      return { record: existing[0], created: false };
    }

    const inserted = await tx
      .insert(users)
      .values({
        name: SEED.user.name,
        passwordHash: hashDevPassword(DEV_PASSWORD),
        timezone: SEED.user.timezone,
      })
      .returning();

    return { record: inserted[0], created: true };
  }

  async function findOrCreateGoal(tx: Tx, userId: string) {
    const existing = await tx
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.title, SEED.goal.title)))
      .orderBy(asc(goals.createdAt))
      .limit(1);

    if (existing[0]) {
      return { record: existing[0], created: false };
    }

    const inserted = await tx
      .insert(goals)
      .values({ userId, title: SEED.goal.title, status: SEED.goal.status })
      .returning();

    return { record: inserted[0], created: true };
  }

  async function findOrCreateActivity(tx: Tx, goalId: string) {
    const existing = await tx
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

    if (existing[0]) {
      return { record: existing[0], created: false };
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

  async function findOrCreateScheduleVersion(tx: Tx, activityId: string) {
    const existing = await tx
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

    if (existing[0]) {
      return { record: existing[0], created: false };
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
  ) {
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
    await db.transaction(async (tx) => {
      const user = await findOrCreateUser(tx);
      console.log(
        `user        ${user.created ? "created" : "reused   "} ${user.record.id} (name: ${user.record.name}, timezone: ${user.record.timezone})`,
      );

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
