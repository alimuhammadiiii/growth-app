import { eq } from "drizzle-orm";

import { db } from "./index";
import { resolveSeedGraph, SEED, type Tx } from "./seed-data";
import { executions, scheduleVersions } from "./schema";

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

function shiftDate(date: string, days: number): string {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

type InsertAttemptResult = { accepted: boolean; code: string | null };

async function attemptInsert(
  attempt: (tx: Tx) => Promise<unknown>,
): Promise<InsertAttemptResult> {
  let accepted = false;
  let code: string | null = null;

  try {
    await db.transaction(async (tx) => {
      await attempt(tx);
      accepted = true;
      throw new Error(
        "attempt reached — rolling back to keep data clean",
      );
    });
  } catch (error) {
    if (!accepted) {
      code = pgErrorCode(error);
    }
  }

  return { accepted, code };
}

function reportRejection(
  label: string,
  expectedCode: string,
  result: InsertAttemptResult,
): boolean {
  if (result.accepted) {
    console.log(
      `FAIL  ${label} — insert unexpectedly succeeded (transaction rolled back, no residue)`,
    );
    return false;
  }

  const ok = result.code === expectedCode;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label} — rejected with code ${result.code ?? "unknown"}${ok ? "" : `, expected ${expectedCode}`}`,
  );
  return ok;
}

function reportAcceptance(
  label: string,
  result: InsertAttemptResult,
): boolean {
  const ok = result.accepted;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${ok ? " — accepted, rolled back" : ` — unexpectedly rejected with code ${result.code ?? "unknown"}`}`,
  );
  return ok;
}

class VerificationAbort extends Error {}

async function main(): Promise<void> {
  const seedStartDate = SEED.scheduleVersion.effectiveStartDate;

  let allPassed = false;

  try {
    console.log("Verifying database integrity constraints...\n");

    const graph = await resolveSeedGraph();
    if (!graph) {
      console.error(
        "Seed data not found — run `pnpm run db:seed` before this script.",
      );
      process.exitCode = 1;
      throw new VerificationAbort();
    }
    const { activity } = graph;

    const executionsBefore = await db
      .select({ id: executions.id })
      .from(executions)
      .where(eq(executions.activityId, activity.id));
    if (executionsBefore.length !== SEED.executions.length) {
      console.error(
        `Unexpected seed state — expected ${SEED.executions.length} executions for the activity, found ${executionsBefore.length}. Run \`pnpm run db:seed\`.`,
      );
      process.exitCode = 1;
      throw new VerificationAbort();
    }

    const versionsBefore = await db
      .select({ id: scheduleVersions.id })
      .from(scheduleVersions)
      .where(eq(scheduleVersions.activityId, activity.id));
    if (versionsBefore.length !== 1) {
      console.error(
        `Unexpected seed state — expected 1 schedule version for the activity, found ${versionsBefore.length}. Run \`pnpm run db:seed\`.`,
      );
      process.exitCode = 1;
      throw new VerificationAbort();
    }

    const duplicateExecution = reportRejection(
      "duplicate execution rejected (UNIQUE activity_id + date)",
      "23505",
      await attemptInsert((tx) =>
        tx.insert(executions).values({
          activityId: activity.id,
          date: SEED.executions[0].date,
          status: "PARTIAL",
          note: "This should fail",
        }),
      ),
    );

    const foreignKey = reportRejection(
      "execution with non-existent activity rejected (FOREIGN KEY)",
      "23503",
      await attemptInsert((tx) =>
        tx.insert(executions).values({
          activityId: crypto.randomUUID(),
          date: SEED.executions[1].date,
          status: "COMPLETED",
          note: null,
        }),
      ),
    );

    const boundedOverlap = reportRejection(
      "overlapping schedule version rejected (EXCLUDE activity + daterange)",
      "23P01",
      await attemptInsert((tx) =>
        tx.insert(scheduleVersions).values({
          activityId: activity.id,
          effectiveStartDate: shiftDate(seedStartDate, 10),
          effectiveEndDate: shiftDate(seedStartDate, 27),
        }),
      ),
    );

    const openOverlap = reportRejection(
      "second open-ended schedule version rejected (overlaps the seed's open-ended version)",
      "23P01",
      await attemptInsert((tx) =>
        tx.insert(scheduleVersions).values({
          activityId: activity.id,
          effectiveStartDate: shiftDate(seedStartDate, 57),
          effectiveEndDate: null,
        }),
      ),
    );

    const historicalAdjacent = reportAcceptance(
      "non-overlapping historical schedule version accepted (ends exactly at the seed version's start)",
      await attemptInsert((tx) =>
        tx.insert(scheduleVersions).values({
          activityId: activity.id,
          effectiveStartDate: shiftDate(seedStartDate, -34),
          effectiveEndDate: seedStartDate,
        }),
      ),
    );

    const executionsAfter = await db
      .select({ id: executions.id })
      .from(executions)
      .where(eq(executions.activityId, activity.id));
    const noExecutionResidue = executionsAfter.length === executionsBefore.length;
    console.log(
      `${noExecutionResidue ? "PASS" : "FAIL"}  no residual executions — count unchanged (${executionsAfter.length})`,
    );

    const versionsAfter = await db
      .select({ id: scheduleVersions.id })
      .from(scheduleVersions)
      .where(eq(scheduleVersions.activityId, activity.id));
    const noVersionResidue = versionsAfter.length === versionsBefore.length;
    console.log(
      `${noVersionResidue ? "PASS" : "FAIL"}  no residual schedule versions — count unchanged (${versionsAfter.length})`,
    );

    allPassed =
      duplicateExecution &&
      foreignKey &&
      boundedOverlap &&
      openOverlap &&
      historicalAdjacent &&
      noExecutionResidue &&
      noVersionResidue;
  } catch (error) {
    if (!(error instanceof VerificationAbort)) {
      console.error("Unexpected error:", error);
    }
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

main();
