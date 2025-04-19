CREATE TABLE "exploration_results" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "method" text NOT NULL,
  "results" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "exploration_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
); 