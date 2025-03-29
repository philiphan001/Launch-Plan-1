-- Sample data loading SQL script
-- Run this with: psql $DATABASE_URL -f server/data/load-sample-data.sql

-- Clear existing data if needed
-- TRUNCATE TABLE users, financial_profiles, colleges, careers CASCADE;

-- Insert sample colleges if not exists
INSERT INTO colleges (name, location, state, type, tuition, room_and_board, acceptance_rate, rating, size, rank, fees_by_income)
VALUES 
  ('University of Washington', 'Seattle, WA', 'WA', 'Public Research', 11465, 13485, 70, 4.5, 'large', 58, '{"0-30000": 4000, "30001-48000": 6000, "48001-75000": 9000, "75001-110000": 15000, "110001+": 24950}'),
  ('Stanford University', 'Stanford, CA', 'CA', 'Private Research', 56169, 17255, 5, 4.8, 'medium', 3, '{"0-30000": 5000, "30001-48000": 7500, "48001-75000": 12000, "75001-110000": 20000, "110001+": 73424}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample careers if not exists
INSERT INTO careers (title, description, salary, growth_rate, education, category)
VALUES 
  ('Software Developer', 'Design, develop, and test software applications', 107510, 'fast', 'Bachelor''s', 'Technology'),
  ('Financial Analyst', 'Analyze financial data and market trends', 83660, 'stable', 'Bachelor''s', 'Finance')
ON CONFLICT (id) DO NOTHING;

-- NOTE: Add more sample data as needed
