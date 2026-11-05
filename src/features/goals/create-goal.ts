import type { CalendarDate } from "@/features/dashboard/date-utils";

import { GOAL_TITLE_TAKEN_MESSAGE } from "./constants";
import {
  createGoalFieldErrors,
  createGoalSchema,
  type CreateGoalFieldErrors,
  type CreateGoalValues,
} from "./schema";

type CreateGoalDeps = {
  goalTitleExists: (userId: string, title: string) => Promise<boolean>;
  createGoal: (
    userId: string,
    record: { title: string; startDate: string; endDate: string | null },
  ) => Promise<{ ok: true } | { ok: false; code: "DUPLICATE_TITLE" }>;
};

export type CreateGoalResult =
  | { ok: true }
  | { ok: false; fieldErrors: CreateGoalFieldErrors };

/**
 * CreateGoal use case. Structural validation via Zod, then business
 * rules: unique ACTIVE title per user, start date not in the past
 * (relative to today in the user's stored timezone), and an optional
 * end date on or after the start date. Ownership is always taken from
 * the authenticated user, never from the input.
 */
export async function createGoal(
  userId: string,
  input: CreateGoalValues,
  today: CalendarDate,
  deps: CreateGoalDeps,
): Promise<CreateGoalResult> {
  const parsed = createGoalSchema(today).safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: createGoalFieldErrors(parsed.error) };
  }

  const { title, startDate, endDate } = parsed.data;

  if (await deps.goalTitleExists(userId, title)) {
    return { ok: false, fieldErrors: { title: GOAL_TITLE_TAKEN_MESSAGE } };
  }

  const result = await deps.createGoal(userId, {
    title,
    startDate,
    endDate: endDate ?? null,
  });

  if (!result.ok) {
    // Race-safe duplicate: the partial unique index rejected a concurrent
    // insert with the same title.
    return { ok: false, fieldErrors: { title: GOAL_TITLE_TAKEN_MESSAGE } };
  }

  return { ok: true };
}
