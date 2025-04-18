-- Add onboarding_completed column to users table
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have onboarding_completed set to true
UPDATE users SET onboarding_completed = TRUE; 