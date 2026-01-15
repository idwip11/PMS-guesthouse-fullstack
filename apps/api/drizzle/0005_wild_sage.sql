CREATE TABLE IF NOT EXISTS "loyalty_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"member_id" text NOT NULL,
	"points_balance" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now(),
	CONSTRAINT "loyalty_members_member_id_unique" UNIQUE("member_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operational_budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"projected_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "member_id" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "member_id" text;