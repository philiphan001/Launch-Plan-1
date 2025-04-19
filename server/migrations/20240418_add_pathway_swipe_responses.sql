-- Create pathway_swipe_responses table
CREATE TABLE IF NOT EXISTS pathway_swipe_responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_id UUID NOT NULL,
    card_id VARCHAR(50) NOT NULL,
    card_title TEXT NOT NULL,
    card_category VARCHAR(50) NOT NULL,
    response BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_pathway_swipe_responses_user_id ON pathway_swipe_responses(user_id);

-- Create index on session_id for faster session-based queries
CREATE INDEX IF NOT EXISTS idx_pathway_swipe_responses_session_id ON pathway_swipe_responses(session_id); 