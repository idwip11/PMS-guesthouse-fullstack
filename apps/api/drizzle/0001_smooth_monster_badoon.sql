CREATE TABLE IF NOT EXISTS "cleaning_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"room_area" text NOT NULL,
	"scheduled_date" date NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_assignees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "type" text DEFAULT 'Payment';--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "breakfast_cost" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "laundry_cost" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "massage_cost" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "assigned_user_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rooms" ADD CONSTRAINT "rooms_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_cleaning_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "cleaning_tasks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
