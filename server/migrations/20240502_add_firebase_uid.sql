-- Add firebaseUid column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
