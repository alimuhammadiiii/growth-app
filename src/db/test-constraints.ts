import dotenv from "dotenv";
import { and, eq } from "drizzle-orm";

import { activities } from "./schema/activities";
import { executions } from "./schema/executions";
import { goals } from "./schema/goals";
import { users } from "./schema/users";

dotenv.config({ path: ".env.local" });
dotenv.config();

function pgErrorCode(error: unknown): string | null {
  let current: unknown = error;
  while (current && typeof current === "object") {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") {
      return code;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

async function main(): Promise<void> {
  const { db } = await import("./index");

  type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

  async function expectInsertRejection(
    label: string,
    expectedCode: string,
    attempt: (tx: Tx) => Promise<unknown>,
  ): Promise<boolean> {
    let insertSucceeded = false;
    let actualCode: string | null = null;

    try {
      await db.transaction(async (tx) => {
        await attempt(tx);
        insertSucceeded = true;
        throw new Error(
          "constraint did not reject the insert — rolling back to keep data clean",
        );
      });
    } catch (error) {
      if (!insertSucceeded) {
        actualCode = pgErrorCode(error);
      }
    }

    if (insertSucceeded) {
      console.log(
        `FAIL  ${label} — insert unexpectedly succeeded (transaction rolled back, no residue)`,
      );
      return false;
    }

    const ok = actualCode === expectedCode;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${label} — rejected with code ${actualCode ?? "unknown"}${ok ? "" : `, expected ${expectedCode}`}`,
    );
    return ok;
  }

  let allPassed = false;

  try {
    console.log("Verifying database integrity constraints...\n");

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.timezone, "Asia/Tehran"));
    const goalRows = userRows[0]
      ? await db
          .select()
          .from(goals)
          .where(
            and(eq(goals.userId, userRows[0].id), eq(goals.title, "Learn English")),
          )
      : [];
    const activityRows = goalRows[0]
      ? await db
          .select()
          .from(activities)
          .where(
            and(
              eq(activities.goalId, goalRows[0].id),
              eq(activities.title, "Study vocabulary"),
            ),
          )
      : [];

    const activity = activityRows[0];
    if (!activity) {
      console.error(
        "Seed data not found — run `npm run db:seed` before this script.",
      );
      process.exitCode = 1;
      return;
    }

    const executionsBefore = await db
      .select({ id: executions.id })
      .from(executions)
      .where(eq(executions.activityId, activity.id));
    if (executionsBefore.length !== 2) {
      console.error(
        `Unexpected seed state — expected 2 executions for the activity, found ${executionsBefore.length}. Run \`npm run db:seed\`.`,
      );
      process.exitCode = 1;
      return;
    }

    const duplicateRejected = await expectInsertRejection(
      "duplicate execution rejected (UNIQUE activity_id + date)",
      "23505",
      (tx) =>
        tx.insert(executions).values({
          activityId: activity.id,
          date: "2026-10-05",
          status: "PARTIAL",
          note: "This should fail",
        }),
    );

    const foreignKeyRejected = await expectInsertRejection(
      "execution with non-existent activity rejected (FOREIGN KEY)",
      "23503",
      (tx) =>
        tx.insert(executions).values({
          activityId: crypto.randomUUID(),
          date: "2026-10-06",
          status: "COMPLETED",
          note: null,
        }),
    );

    const executionsAfter = await db
      .select({ id: executions.id })
      .from(executions)
      .where(eq(executions.activityId, activity.id));
    const noResidue = executionsAfter.length === executionsBefore.length;
    console.log(
      `${noResidue ? "PASS" : "FAIL"}  no residual rows — execution count unchanged (${executionsAfter.length})`,
    );

    allPassed = duplicateRejected && foreignKeyRejected && noResidue;
  } catch (error) {
    console.error("Unexpected error:", error);
  } finally {
    await db.$client.end();
  }

  console.log("");
  if (allPassed) {
    console.log("Constraint verification PASSED.");
  } else {
    console.log("Constraint verification FAILED.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Constraint verification failed:", error);
  process.exitCode = 1;
});
