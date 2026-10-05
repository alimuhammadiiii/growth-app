import {
  date,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { activities } from "./activities";
import { dayOfWeekEnum } from "./enums";

export const scheduleVersions = pgTable(
  "schedule_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),

    effectiveStartDate: date("effective_start_date").notNull(),

    effectiveEndDate: date("effective_end_date"),

    expectedDurationMinutes: integer("expected_duration_minutes"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    activityStartDateIdx: index(
      "schedule_versions_activity_start_date_idx",
    ).on(table.activityId, table.effectiveStartDate),
  }),
);

export const scheduleVersionDays = pgTable(
  "schedule_version_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    scheduleVersionId: uuid("schedule_version_id")
      .notNull()
      .references(() => scheduleVersions.id),

    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  },
  (table) => ({
    versionDayUnique: unique("schedule_version_days_unique").on(
      table.scheduleVersionId,
      table.dayOfWeek,
    ),
  }),
);
