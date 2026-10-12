import { dayOfWeekEnumFor, type CalendarDate, type DayOfWeek } from "./date-utils";
import type { ExecutionStatus } from "./types";

export type ScheduleVersionInput = {
  activityId: string;
  effectiveStartDate: CalendarDate;
  effectiveEndDate: CalendarDate | null;
  expectedDurationMinutes: number | null;
  days: DayOfWeek[];
};

export type ExecutionInput = {
  activityId: string;
  date: CalendarDate;
  status: ExecutionStatus;
  note: string | null;
};

function isEffectiveOn(version: ScheduleVersionInput, date: CalendarDate): boolean {
  if (version.effectiveStartDate > date) {
    return false;
  }
  if (version.effectiveEndDate !== null && version.effectiveEndDate < date) {
    return false;
  }
  return true;
}

/**
 * The schedule version that governs an activity on a date.
 * When versions overlap, the latest effective start date wins so that at
 * most one active plan per activity is considered.
 */
export function versionEffectiveOn(
  versions: ScheduleVersionInput[],
  activityId: string,
  date: CalendarDate,
): ScheduleVersionInput | null {
  let best: ScheduleVersionInput | null = null;

  for (const version of versions) {
    if (version.activityId !== activityId || !isEffectiveOn(version, date)) {
      continue;
    }
    if (best === null || best.effectiveStartDate < version.effectiveStartDate) {
      best = version;
    }
  }

  return best;
}

/**
 * Activities expected on a calendar date, derived from the schedule
 * version effective on that date. History is interpreted with the plan
 * that was in effect at the time — never the current plan.
 */
export function expectedActivityIdsOnDate(
  versions: ScheduleVersionInput[],
  date: CalendarDate,
): string[] {
  const day = dayOfWeekEnumFor(date);
  const expected = new Set<string>();

  for (const version of versions) {
    if (!isEffectiveOn(version, date)) {
      continue;
    }

    const governing = versionEffectiveOn(versions, version.activityId, date);
    if (governing && governing.days.includes(day)) {
      expected.add(version.activityId);
    }
  }

  return [...expected].sort();
}

export type ExpectedOutcome = {
  activityId: string;
  status: ExecutionStatus | "UNRECORDED";
  note: string | null;
  expectedDurationMinutes: number | null;
};

/**
 * Derives the outcome of every activity expected on a date.
 * A missing execution record yields "UNRECORDED" — absence of data is
 * not a confirmed NOT_COMPLETED.
 */
export function deriveDateOutcomes(
  date: CalendarDate,
  versions: ScheduleVersionInput[],
  executions: ExecutionInput[],
): ExpectedOutcome[] {
  const executionsByActivity = new Map<string, ExecutionInput>();
  for (const execution of executions) {
    if (execution.date === date) {
      executionsByActivity.set(execution.activityId, execution);
    }
  }

  return expectedActivityIdsOnDate(versions, date).map((activityId) => {
    const execution = executionsByActivity.get(activityId);
    return {
      activityId,
      status: execution ? execution.status : "UNRECORDED",
      note: execution?.note ?? null,
      expectedDurationMinutes:
        versionEffectiveOn(versions, activityId, date)?.expectedDurationMinutes ?? null,
    };
  });
}
