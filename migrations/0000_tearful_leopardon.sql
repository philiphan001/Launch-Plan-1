CREATE TABLE "assumptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"value" real NOT NULL,
	"default_value" real NOT NULL,
	"min_value" real NOT NULL,
	"max_value" real NOT NULL,
	"step_value" real DEFAULT 1 NOT NULL,
	"unit" text DEFAULT '',
	"is_enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_calculations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"career_id" integer NOT NULL,
	"projected_salary" integer NOT NULL,
	"start_year" integer,
	"education" text,
	"entry_level_salary" integer,
	"mid_career_salary" integer,
	"experienced_salary" integer,
	"additional_notes" text,
	"calculation_date" timestamp DEFAULT now(),
	"included_in_projection" boolean DEFAULT false,
	"location_zip" text,
	"adjusted_for_location" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "career_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_of_study" text,
	"career_title" text NOT NULL,
	"option_rank" integer
);
--> statement-breakpoint
CREATE TABLE "careers" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"salary" integer,
	"growth_rate" text,
	"education" text,
	"category" text,
	"alias1" text,
	"alias2" text,
	"alias3" text,
	"alias4" text,
	"alias5" text,
	"salary_pct_10" integer,
	"salary_pct_25" integer,
	"salary_median" integer,
	"salary_pct_75" integer,
	"salary_pct_90" integer
);
--> statement-breakpoint
CREATE TABLE "college_calculations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"college_id" integer NOT NULL,
	"net_price" integer NOT NULL,
	"in_state" boolean DEFAULT true,
	"family_contribution" integer,
	"work_study" integer,
	"student_loan_amount" integer,
	"financial_aid" integer,
	"household_income" integer,
	"household_size" integer,
	"zip" text,
	"tuition_used" integer,
	"room_and_board_used" integer,
	"on_campus_housing" boolean DEFAULT true,
	"total_cost" integer,
	"calculation_date" timestamp DEFAULT now(),
	"notes" text,
	"included_in_projection" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"state" text,
	"type" text,
	"tuition" integer,
	"room_and_board" integer,
	"acceptance_rate" real,
	"rating" real,
	"size" text,
	"rank" integer,
	"fees_by_income" jsonb,
	"us_news_top_150" integer,
	"best_liberal_arts_colleges" integer,
	"tuition_doubled" real,
	"degrees_awarded_predominant" integer,
	"degrees_awarded_highest" integer,
	"admission_rate_overall" real,
	"sat_scores_average_overall" integer,
	"pell_grant_rate" real,
	"completion_rate_4yr_150nt" real,
	"median_debt_completers_overall" integer,
	"median_debt_noncompleters" integer,
	"demographics_median_family_income" real,
	"median_earnings_10yrs_after_entry" integer
);
--> statement-breakpoint
CREATE TABLE "favorite_careers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"career_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorite_colleges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"college_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorite_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"zip_code" text NOT NULL,
	"city" text,
	"state" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"household_income" integer,
	"household_size" integer,
	"savings_amount" integer,
	"student_loan_amount" integer,
	"other_debt_amount" integer,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_projections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"projection_data" jsonb NOT NULL,
	"timeframe" integer,
	"starting_age" integer,
	"starting_savings" integer,
	"income" integer,
	"expenses" integer,
	"income_growth" real,
	"student_loan_debt" integer,
	"includes_college_calculation" boolean,
	"includes_career_calculation" boolean,
	"college_calculation_id" integer,
	"career_calculation_id" integer,
	"location_adjusted" boolean,
	"location_zip_code" text,
	"cost_of_living_index" real,
	"income_adjustment_factor" real,
	"emergency_fund_amount" integer,
	"personal_loan_term_years" integer,
	"personal_loan_interest_rate" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "location_cost_of_living" (
	"id" serial PRIMARY KEY NOT NULL,
	"zip_code" text NOT NULL,
	"city" text,
	"state" text,
	"housing" integer,
	"transportation" integer,
	"food" integer,
	"healthcare" integer,
	"personal_insurance" integer,
	"apparel" integer,
	"services" integer,
	"entertainment" integer,
	"other" integer,
	"monthly_expense" integer,
	"income_adjustment_factor" real
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"date" text,
	"years_away" integer,
	"financial_impact" integer,
	"spouse_occupation" text,
	"spouse_income" integer,
	"spouse_assets" integer,
	"spouse_liabilities" integer,
	"home_value" integer,
	"home_down_payment" integer,
	"home_monthly_payment" integer,
	"car_value" integer,
	"car_down_payment" integer,
	"car_monthly_payment" integer,
	"education_cost" integer,
	"education_type" text,
	"education_years" integer,
	"education_annual_cost" integer,
	"education_annual_loan" integer,
	"target_occupation" text,
	"education_field" text,
	"target_career" text,
	"work_status" text,
	"part_time_income" integer,
	"return_to_same_profession" boolean,
	"children_count" integer,
	"children_expense_per_year" integer,
	"active" boolean DEFAULT true,
	"completed" boolean DEFAULT false,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"financial_alerts" boolean DEFAULT true,
	"career_updates" boolean DEFAULT true,
	"scholarship_alerts" boolean DEFAULT true,
	"data_collection" boolean DEFAULT true,
	"share_anonymous_data" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"location" text,
	"zip_code" text,
	"birth_year" integer,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "zip_code_income" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" text,
	"zip_code" text NOT NULL,
	"mean_income" integer,
	"estimated_investments" integer,
	"home_value" integer
);
--> statement-breakpoint
CREATE TABLE "exploration_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"method" text NOT NULL,
	"results" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "exploration_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX "idx_exploration_results_user_id" ON "exploration_results" ("user_id");
--> statement-breakpoint
ALTER TABLE "career_calculations" ADD CONSTRAINT "career_calculations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_calculations" ADD CONSTRAINT "career_calculations_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "college_calculations" ADD CONSTRAINT "college_calculations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "college_calculations" ADD CONSTRAINT "college_calculations_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_careers" ADD CONSTRAINT "favorite_careers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_careers" ADD CONSTRAINT "favorite_careers_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_colleges" ADD CONSTRAINT "favorite_colleges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_colleges" ADD CONSTRAINT "favorite_colleges_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_locations" ADD CONSTRAINT "favorite_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_profiles" ADD CONSTRAINT "financial_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_projections" ADD CONSTRAINT "financial_projections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;