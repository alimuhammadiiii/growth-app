ALTER TABLE "goals" ADD COLUMN "start_date" date;--> statement-breakpoint
UPDATE "goals" SET "start_date" = ("goals"."created_at" AT TIME ZONE COALESCE((SELECT "users"."timezone" FROM "users" WHERE "users"."id" = "goals"."user_id"), 'UTC'))::date WHERE "start_date" IS NULL;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "end_date" date;--> statement-breakpoint
CREATE UNIQUE INDEX "goals_user_title_active_unique" ON "goals" USING btree ("user_id",lower("title")) WHERE status = 'ACTIVE';
