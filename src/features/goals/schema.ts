import { z } from "zod";

import type { CalendarDate } from "@/features/dashboard/date-utils";

export const GOAL_TITLE_MIN = 1;
export const GOAL_TITLE_MAX = 80;

const CALENDAR_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const calendarDateMessage = "Enter a valid date (YYYY-MM-DD)";

export const goalTitleSchema = z
  .string()
  .trim()
  .min(GOAL_TITLE_MIN, "Goal title is required")
  .max(GOAL_TITLE_MAX, `Goal title must be at most ${GOAL_TITLE_MAX} characters`);

export const goalCalendarDateSchema = z
  .string()
  .regex(CALENDAR_DATE_REGEX, calendarDateMessage);

/**
 * Shared validation for creating a goal. The schema is built around
 * "today" in the user's stored timezone so the client and the server
 * enforce exactly the same rule with their own notion of today.
 */
export function createGoalSchema(today: CalendarDate) {
  return z
    .object({
      title: goalTitleSchema,
      startDate: goalCalendarDateSchema.refine(
        (date) => date >= today,
        "Start date must be today or in the future",
      ),
      endDate: goalCalendarDateSchema.nullable().optional(),
    })
    .refine((data) => data.endDate == null || data.endDate >= data.startDate, {
      message: "End date must be on or after the start date",
      path: ["endDate"],
    });
}

export type CreateGoalValues = z.infer<ReturnType<typeof createGoalSchema>>;

export type CreateGoalFieldErrors = {
  title?: string;
  startDate?: string;
  endDate?: string;
  form?: string;
};

/** Maps Zod issues to a per-field error record for the form UI. */
export function createGoalFieldErrors(
  error: z.ZodError,
): CreateGoalFieldErrors {
  const fieldErrors: CreateGoalFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      (key === "title" || key === "startDate" || key === "endDate") &&
      !fieldErrors[key]
    ) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}
