ALTER TYPE "public"."theme_color" ADD VALUE 'custom';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "custom_color_hex" text;