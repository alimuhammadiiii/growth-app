import {
  date,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { users } from "./users";
import { goalStatusEnum } from "./enums";

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    status: goalStatusEnum("status").default("ACTIVE").notNull(),

    // Informational pursuit horizon. Local calendar dates — never UTC
    // timestamps (calendar-domain values, see AI_DOMAIN_CONTEXT §32).
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),

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
    userStatusIdx: index("goals_user_status_idx").on(
      table.userId,
      table.status,
    ),

    // A user may not have two ACTIVE goals with the same title, compared
    // case-insensitively. Archived titles may be reused. Race-safe via
    // the partial unique index.
    userTitleActiveUnique: uniqueIndex("goals_user_title_active_unique")
      .on(table.userId, sql`lower(${table.title})`)
      .where(sql`status = 'ACTIVE'`),
  }),
);
