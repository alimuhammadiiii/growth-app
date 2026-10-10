import dotenv from "dotenv";
import { and, asc, eq } from "drizzle-orm";

import { activities } from "./schema/activities";
import { executions } from "./schema/executions";
import { goals } from "./schema/goals";
import { scheduleVersionDays, scheduleVersions } from "./schema/schedules";
import { users } from "./schema/users";

dotenv.config({ path: ".env.local" });
dotenv.config();

const EXPECTED_DAYS = ["MONDAY", "WEDNESDAY", "FRIDAY"];
const EXPECTED_EXECUTIONS = [
  { date: "2026-10-05", status: "COMPLETED", note: null },
  { date: "2026-10-07", status: "PARTIAL", note: "Only had 20 minutes" },
] as const;

class VerificationAbort extends Error {}

async function main(): Promise<void> {
  const { db } = await import("./index");

  const failures: string[] = [];

  function check(name: string, ok: boolean, detail = ""): void {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
    if (!ok) {
      failures.push(name);
    }
  }

  function requireRecord<T>(record: T | undefined, name: string): T {
    if (record === undefined) {
      check(name, false);
      throw new VerificationAbort();
    }
    return record;
  }

  try {
    console.log("Verifying seeded graph...\n");

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.timezone, "Asia/Tehran"));
    check(
      "user exists with timezone Asia/Tehran",
      userRows.length === 1,
      `found ${userRows.length}`,
    );
    const user = requireRecord(userRows[0], "user exists with timezone Asia/Tehran");
    check(
      `user name is "Dev User"`,
      user.name === "Dev User",
      `name=${user.name}`,
    );
    check(
      "user password is stored as a hash, not plaintext",
      user.passwordHash.startsWith("scrypt$") && user.passwordHash !== "dev-password-123",
      `passwordHash=${user.passwordHash.slice(0, 20)}...`,
    );

    const goalRows = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, user.id), eq(goals.title, "Learn English")));
    check(
      "goal 'Learn English' exists",
      goalRows.length === 1,
      `found ${goalRows.length}`,
    );
    const goal = requireRecord(goalRows[0], "goal 'Learn English' exists");
    check(
      "goal belongs to user",
      goal.userId === user.id,
      `goal.userId=${goal.userId}, user.id=${user.id}`,
    );
    check("goal status is ACTIVE", goal.status === "ACTIVE", `status=${goal.status}`);

    const activityRows = await db
      .select()
      .from(activities)
      .where(
        and(eq(activities.goalId, goal.id), eq(activities.title, "Study vocabulary")),
      );
    check(
      "activity 'Study vocabulary' exists",
      activityRows.length === 1,
      `found ${activityRows.length}`,
    );
    const activity = requireRecord(
      activityRows[0],
      "activity 'Study vocabulary' exists",
    );
    check(
      "activity belongs to goal",
      activity.goalId === goal.id,
      `activity.goalId=${activity.goalId}, goal.id=${goal.id}`,
    );
    check(
      "activity status is ACTIVE",
      activity.status === "ACTIVE",
      `status=${activity.status}`,
    );

    const scheduleVersionRows = await db
      .select()
      .from(scheduleVersions)
      .where(
        and(
          eq(scheduleVersions.activityId, activity.id),
          eq(scheduleVersions.effectiveStartDate, "2026-10-05"),
        ),
      );
    check(
      "schedule version with startDate 2026-10-05 exists",
      scheduleVersionRows.length === 1,
      `found ${scheduleVersionRows.length}`,
    );
    const scheduleVersion = requireRecord(
      scheduleVersionRows[0],
      "schedule version with startDate 2026-10-05 exists",
    );
    check(
      "schedule version belongs to activity",
      scheduleVersion.activityId === activity.id,
      `version.activityId=${scheduleVersion.activityId}, activity.id=${activity.id}`,
    );
    check(
      "schedule version endDate is null (open-ended)",
      scheduleVersion.effectiveEndDate === null,
      `endDate=${scheduleVersion.effectiveEndDate ?? "null"}`,
    );

    const dayRows = await db
      .select()
      .from(scheduleVersionDays)
      .where(eq(scheduleVersionDays.scheduleVersionId, scheduleVersion.id));
    const actualDays = dayRows
      .map((row) => row.dayOfWeek)
      .sort()
      .join(",");
    const expectedDays = [...EXPECTED_DAYS].sort().join(",");
    check(
      "schedule version has exactly the days MONDAY, WEDNESDAY, FRIDAY",
      dayRows.length === 3 && actualDays === expectedDays,
      `days=[${actualDays}]`,
    );

    const executionRows = await db
      .select()
      .from(executions)
      .where(eq(executions.activityId, activity.id))
      .orderBy(asc(executions.date));
    check(
      "activity has exactly 2 executions",
      executionRows.length === 2,
      `found ${executionRows.length}`,
    );

    for (const row of executionRows) {
      check(
        `execution ${row.date} belongs to activity`,
        row.activityId === activity.id,
        `execution.activityId=${row.activityId}, activity.id=${activity.id}`,
      );
    }

    for (const expected of EXPECTED_EXECUTIONS) {
      const row = executionRows.find((candidate) => candidate.date === expected.date);
      if (!row) {
        check(`execution on ${expected.date} exists`, false, "missing");
        continue;
      }
      check(
        `execution on ${expected.date} has status ${expected.status}`,
        row.status === expected.status,
        `status=${row.status}`,
      );
      check(
        `execution on ${expected.date} note is ${expected.note === null ? "null" : `"${expected.note}"`}`,
        row.note === expected.note,
        `note=${row.note === null ? "null" : `"${row.note}"`}`,
      );
    }

    if (user && goal && activity && scheduleVersion) {
      console.log("\nGraph:");
      console.log(`  user       ${user.id}  ${user.name} (${user.timezone})`);
      console.log(`  goal       ${goal.id}  ${goal.title} (${goal.status})`);
      console.log(`  activity   ${activity.id}  ${activity.title} (${activity.status})`);
      console.log(
        `  schedule   ${scheduleVersion.id}  [${scheduleVersion.effectiveStartDate}, ${scheduleVersion.effectiveEndDate ?? "null"})`,
      );
      console.log(`    days     ${dayRows.map((row) => row.dayOfWeek).join(", ")}`);
      for (const row of executionRows) {
        console.log(
          `  execution  ${row.date}  ${row.status}${row.note ? ` — "${row.note}"` : " — no note"}`,
        );
      }
    }
  } catch (error) {
    if (!(error instanceof VerificationAbort)) {
      console.error("Unexpected error:", error);
      failures.push("unexpected error");
    }
  } finally {
    await db.$client.end();
  }

  console.log("");
  if (failures.length > 0) {
    console.log(`Verification FAILED — ${failures.length} check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log("Verification PASSED — all checks succeeded.");
  }
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exitCode = 1;
});
