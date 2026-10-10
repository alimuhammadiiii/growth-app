-- Hand-written: drizzle-kit cannot model exclusion constraints.
-- This constraint is intentionally absent from the drizzle schema and
-- meta snapshots; `drizzle-kit generate` will not see it, and
-- `drizzle-kit push` leaves it alone (tested against drizzle-kit
-- 0.31.11 on a scratch database).
CREATE EXTENSION IF NOT EXISTS "btree_gist";--> statement-breakpoint
ALTER TABLE "schedule_versions" ADD CONSTRAINT "schedule_versions_no_overlap" EXCLUDE USING gist ("activity_id" WITH =, daterange("effective_start_date", "effective_end_date") WITH &&);