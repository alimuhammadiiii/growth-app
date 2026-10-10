ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
UPDATE "users" SET "name" = 'Dev User', "password_hash" = 'scrypt$f5ffd58aef10c308277157401e14ebc2$0dd514c800913c7192d0b88777f704463f0b308810a4faef3db0883f6d187376a04ca834f53b90b90d2c8c82abadb9787b0907dd59365c7374d098832ac4908a' WHERE "name" IS NULL OR "password_hash" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
