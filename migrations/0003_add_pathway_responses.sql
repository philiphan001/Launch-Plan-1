-- Create pathway_responses table with improved structure
CREATE TABLE IF NOT EXISTS pathway_responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL CHECK (response_data IS NOT NULL AND jsonb_typeof(response_data) = 'object'),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS pathway_responses_user_id_idx ON pathway_responses(user_id);
CREATE INDEX IF NOT EXISTS pathway_responses_created_at_idx ON pathway_responses(created_at);
CREATE INDEX IF NOT EXISTS pathway_responses_deleted_at_idx ON pathway_responses(deleted_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pathway_responses_updated_at
    BEFORE UPDATE ON pathway_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE pathway_responses IS 'Stores user responses to pathway questions';
COMMENT ON COLUMN pathway_responses.response_data IS 'JSON structure containing the user''s responses';
COMMENT ON COLUMN pathway_responses.version IS 'Schema version of the response data';
COMMENT ON COLUMN pathway_responses.deleted_at IS 'Timestamp of soft deletion, NULL if not deleted'; 