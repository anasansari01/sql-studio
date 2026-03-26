ALTER TABLE "attempts" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."attempts" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."result_status";--> statement-breakpoint
CREATE TYPE "public"."result_status" AS ENUM('correct', 'wrong', 'error', 'empty');--> statement-breakpoint
ALTER TABLE "public"."attempts" ALTER COLUMN "status" SET DATA TYPE "public"."result_status" USING "status"::"public"."result_status";