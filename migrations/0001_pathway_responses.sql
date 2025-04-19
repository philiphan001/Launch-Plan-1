CREATE TABLE "pathway_responses" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "category" text NOT NULL,
  "question" text NOT NULL,
  "response" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "pathway_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
);

--> statement-breakpoint

-- Add an index on user_id for faster lookups
CREATE INDEX "pathway_responses_user_id_idx" ON "pathway_responses" ("user_id");

-- Add a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_pathway_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pathway_responses_updated_at
    BEFORE UPDATE ON "pathway_responses"
    FOR EACH ROW
    EXECUTE FUNCTION update_pathway_responses_updated_at(); 