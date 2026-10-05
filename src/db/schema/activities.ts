import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { goals } from "./goals";
import { activityStatusEnum } from "./enums";

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id),

    title: text("title").notNull(),

    status: activityStatusEnum("status").default("ACTIVE").notNull(),

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
    goalStatusIdx: index("activities_goal_status_idx").on(
      table.goalId,
      table.status,
    ),
  }),
);
