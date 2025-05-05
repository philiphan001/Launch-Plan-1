-- Create favorite_colleges table
CREATE TABLE IF NOT EXISTS favorite_colleges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    college_id INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, college_id)
);

-- Create favorite_careers table
CREATE TABLE IF NOT EXISTS favorite_careers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_id INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, career_id)
);

-- Create favorite_locations table
CREATE TABLE IF NOT EXISTS favorite_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zip_code VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, zip_code)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_favorite_colleges_user_id ON favorite_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_careers_user_id ON favorite_careers(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_locations_user_id ON favorite_locations(user_id);