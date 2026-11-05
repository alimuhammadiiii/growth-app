"use server";

import { headers } from "next/headers";

import { localDateInTimezone } from "@/features/dashboard/date-utils";
import {
  createGoal as createGoalRecord,
  goalTitleExists,
} from "@/db/repositories/goals";
import { auth } from "@/lib/auth";

import { createGoal } from "./create-goal";
import { SESSION_EXPIRED_MESSAGE } from "./constants";
import { goalTitleSchema, type CreateGoalFieldErrors, type CreateGoalValues } from "./schema";

/**
 * Returns whether an ACTIVE goal title is available for the signed-in
 * user, or null when the input is invalid (UI stays silent).
 */
export async function checkGoalTitleAvailability(
  title: string,
): Promise<boolean | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return null;
  }

  const parsed = goalTitleSchema.safeParse(title);
  if (!parsed.success) {
    return null;
  }

  return !(await goalTitleExists(session.user.id, parsed.data));
}

/**
 * Creates a goal for the signed-in user. Re-validates everything on the
 * server and enforces the business rules in the use case; "today" is
 * derived from the user's stored timezone.
 */
export async function createGoalAction(
  input: CreateGoalValues,
): Promise<{ ok: true } | { ok: false; fieldErrors: CreateGoalFieldErrors }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { ok: false, fieldErrors: { form: SESSION_EXPIRED_MESSAGE } };
  }

  const today = localDateInTimezone(session.user.timezone);

  return createGoal(session.user.id, input, today, {
    goalTitleExists,
    createGoal: createGoalRecord,
  });
}
