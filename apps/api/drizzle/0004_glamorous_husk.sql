CREATE TABLE IF NOT EXISTS "marketing_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"description" text,
	"discount_details" text NOT NULL,
	"target_audience" text DEFAULT 'All Guests',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'Active',
	"created_at" timestamp DEFAULT now() NOT NULL
);
