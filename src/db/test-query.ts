import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "./index";
import { DEV_PASSWORD, resolveSeedGraph, SEED } from "./seed-data";
import {
  accounts,
  activities,
  executions,
  goals,
  scheduleVersionDays,
  scheduleVersions,
  users,
} from "./schema";

class VerificationAbort extends Error {}

async function main(): Promise<void> {
  const failures: string[] = [];

  function check(name: string, ok: boolean, detail = ""): void {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
    if (!ok) {
      failures.push(name);
    }
  }

  try {
    console.log("Verifying seeded graph...\n");

    const graph = await resolveSeedGraph();
    check(
      "seed graph resolves (user → goal → activity → schedule version)",
      graph !== null,
      graph
        ? `user=${graph.user.id}, goal=${graph.goal.id}, activity=${graph.activity.id}, schedule=${graph.scheduleVersion.id}`
        : "not found — run `pnpm run db:seed` first",
    );
    if (!graph) {
      throw new VerificationAbort();
    }

    const { user, goal, activity, scheduleVersion } = graph;

    const seedUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, SEED.user.email));
    check(
      "exactly one seed user matches (email)",
      seedUsers.length === 1,
      `found ${seedUsers.length}`,
    );

    const seedGoals = await db
      .select({ id: goals.id })
      .from(goals)
      .where(and(eq(goals.userId, user.id), eq(goals.title, SEED.goal.title)));
    check(
      `exactly one seed goal for the user`,
      seedGoals.length === 1,
      `found ${seedGoals.length}`,
    );

    const seedActivities = await db
      .select({ id: activities.id })
      .from(activities)
      .where(
        and(
          eq(activities.goalId, goal.id),
          eq(activities.title, SEED.activity.title),
        ),
      );
    check(
      `exactly one seed activity for the goal`,
      seedActivities.length === 1,
      `found ${seedActivities.length}`,
    );

    const seedVersions = await db
      .select({ id: scheduleVersions.id })
      .from(scheduleVersions)
      .where(
        and(
          eq(scheduleVersions.activityId, activity.id),
          eq(
            scheduleVersions.effectiveStartDate,
            SEED.scheduleVersion.effectiveStartDate,
          ),
          isNull(scheduleVersions.effectiveEndDate),
        ),
      );
    check(
      "exactly one open-ended seed schedule version for the activity",
      seedVersions.length === 1,
      `found ${seedVersions.length}`,
    );

    check(
      `user name is "${SEED.user.name}"`,
      user.name === SEED.user.name,
      `name=${user.name}`,
    );
    check(
      `user timezone is ${SEED.user.timezone}`,
      user.timezone === SEED.user.timezone,
      `timezone=${user.timezone}`,
    );
    check(
      `user email is ${SEED.user.email}`,
      user.email === SEED.user.email,
      `email=${user.email}`,
    );

    const credentialAccounts = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, user.id), eq(accounts.providerId, "credential")));
    check(
      "user has exactly one credential account",
      credentialAccounts.length === 1,
      `found ${credentialAccounts.length}`,
    );
    const storedPassword = credentialAccounts[0]?.password ?? "";
    check(
      "credential password is stored as a salted scrypt hash (salt:key hex), not plaintext",
      /^[0-9a-f]{32}:[0-9a-f]{128}$/.test(storedPassword) &&
        storedPassword !== DEV_PASSWORD,
      `password=${storedPassword.slice(0, 12)}...`,
    );

    check(
      "goal belongs to user",
      goal.userId === user.id,
      `goal.userId=${goal.userId}, user.id=${user.id}`,
    );
    check(
      `goal status is ${SEED.goal.status}`,
      goal.status === SEED.goal.status,
      `status=${goal.status}`,
    );

    check(
      "activity belongs to goal",
      activity.goalId === goal.id,
      `activity.goalId=${activity.goalId}, goal.id=${goal.id}`,
    );
    check(
      `activity status is ${SEED.activity.status}`,
      activity.status === SEED.activity.status,
      `status=${activity.status}`,
    );

    check(
      "schedule version belongs to activity",
      scheduleVersion.activityId === activity.id,
      `version.activityId=${scheduleVersion.activityId}, activity.id=${activity.id}`,
    );
    check(
      `schedule version startDate is ${SEED.scheduleVersion.effectiveStartDate}`,
      scheduleVersion.effectiveStartDate === SEED.scheduleVersion.effectiveStartDate,
      `startDate=${scheduleVersion.effectiveStartDate}`,
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
    const expectedDays = [...SEED.days].sort().join(",");
    check(
      "schedule version has exactly the planned days",
      dayRows.length === SEED.days.length && actualDays === expectedDays,
      `days=[${actualDays}]`,
    );

    const executionRows = await db
      .select()
      .from(executions)
      .where(eq(executions.activityId, activity.id))
      .orderBy(asc(executions.date));
    check(
      `activity has exactly ${SEED.executions.length} executions`,
      executionRows.length === SEED.executions.length,
      `found ${executionRows.length}`,
    );

    for (const row of executionRows) {
      check(
        `execution ${row.date} belongs to activity`,
        row.activityId === activity.id,
        `execution.activityId=${row.activityId}, activity.id=${activity.id}`,
      );
    }

    for (const expected of SEED.executions) {
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

main();
