import { pgEnum } from "drizzle-orm/pg-core";

export const goalStatusEnum = pgEnum("goal_status", ["ACTIVE", "ARCHIVED"]);

export const activityStatusEnum = pgEnum("activity_status", [
  "ACTIVE",
  "ARCHIVED",
]);

export const executionStatusEnum = pgEnum("execution_status", [
  "COMPLETED",
  "PARTIAL",
  "NOT_COMPLETED",
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);
