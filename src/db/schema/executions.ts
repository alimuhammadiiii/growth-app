import {
  date,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { activities } from "./activities";
import { executionStatusEnum } from "./enums";

export const executions = pgTable(
  "executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),

    date: date("date").notNull(),

    status: executionStatusEnum("status").notNull(),

    note: text("note"),

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
    activityDateUnique: unique("executions_activity_date_unique").on(
      table.activityId,
      table.date,
    ),

    dateIdx: index("executions_date_idx").on(table.date),
  }),
);
