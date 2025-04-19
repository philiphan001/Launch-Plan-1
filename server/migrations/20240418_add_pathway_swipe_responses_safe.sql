DO $$ 
BEGIN
    -- Create the table if it doesn't exist
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

    -- Create indices only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'pathway_swipe_responses' 
        AND indexname = 'idx_pathway_swipe_responses_user_id'
    ) THEN
        CREATE INDEX idx_pathway_swipe_responses_user_id 
        ON pathway_swipe_responses(user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'pathway_swipe_responses' 
        AND indexname = 'idx_pathway_swipe_responses_session_id'
    ) THEN
        CREATE INDEX idx_pathway_swipe_responses_session_id 
        ON pathway_swipe_responses(session_id);
    END IF;

END $$; 