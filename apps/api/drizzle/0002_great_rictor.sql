CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"promo_code" text,
	"discount_description" text,
	"target_audience" text DEFAULT 'All Guests',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"terms_conditions" text,
	"image_url" text,
	"max_redemptions" integer,
	"current_redemptions" integer DEFAULT 0,
	"status" text DEFAULT 'Draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_promo_code_unique" UNIQUE("promo_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"target_amount" numeric(15, 2) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"tier" text DEFAULT 'Silver',
	"points_balance" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp,
	CONSTRAINT "loyalty_members_guest_id_unique" UNIQUE("guest_id")
);
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "order_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "order_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "notes" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "loyalty_members" ADD CONSTRAINT "loyalty_members_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
