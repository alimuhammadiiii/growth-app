import type { executionStatusEnum } from "@/db/schema/enums";

import type { CalendarDate, DayOfWeek } from "./date-utils";

export type ExecutionStatus = (typeof executionStatusEnum.enumValues)[number];

/**
 * Recorded outcomes come from executions.
 * "UNRECORDED" is a distinct derived state: a scheduled activity with no
 * execution record. It must never be collapsed into NOT_COMPLETED.
 */
export type OutcomeStatus = ExecutionStatus | "UNRECORDED";

export type TodayActivityItem = {
  activityId: string;
  activityTitle: string;
  goalTitle: string;
  status: OutcomeStatus;
  note: string | null;
  expectedDurationMinutes: number | null;
};

export type WeekCounts = {
  expected: number;
  completed: number;
  partial: number;
  notCompleted: number;
  unrecorded: number;
};

export type ChartDay = {
  date: CalendarDate;
  dayLabel: string;
  completed: number;
  partial: number;
  notCompleted: number;
  unrecorded: number;
};

export type GoalOverviewActivity = {
  id: string;
  title: string;
  days: DayOfWeek[];
  expectedDurationMinutes: number | null;
};

export type GoalOverview = {
  id: string;
  title: string;
  activities: GoalOverviewActivity[];
};
