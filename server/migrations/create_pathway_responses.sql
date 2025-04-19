-- Create pathway_swipe_responses table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'pathway_swipe_responses') THEN
        CREATE TABLE pathway_swipe_responses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            session_id UUID NOT NULL,
            card_id VARCHAR(50) NOT NULL,
            card_title TEXT NOT NULL,
            card_category VARCHAR(50) NOT NULL,
            response BOOLEAN NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indices for better query performance
        CREATE INDEX idx_pathway_swipe_responses_user_id ON pathway_swipe_responses(user_id);
        CREATE INDEX idx_pathway_swipe_responses_session_id ON pathway_swipe_responses(session_id);
    END IF;
END $$; 

CREATE TABLE IF NOT EXISTS pathway_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  question_id TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id)
); 