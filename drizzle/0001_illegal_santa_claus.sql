CREATE TYPE "public"."catering_style" AS ENUM('buffet', 'plated', 'potluck', 'snacks_only', 'none');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "catering_style" "catering_style";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "menu_details" text;