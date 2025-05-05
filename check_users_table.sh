#!/bin/bash

# Load environment variables
source .env

# Check table structure
echo "=== Users Table Structure ==="
psql $DATABASE_URL -c "\d users"

# Get sample user data
echo -e "\n=== Sample User Data ==="
psql $DATABASE_URL -c "SELECT id, username, 
       CASE WHEN email IS NOT NULL THEN 'has-email' ELSE NULL END as email_status,
       CASE WHEN firebase_uid IS NOT NULL THEN 'has-firebase-uid' ELSE NULL END as firebase_status,
       created_at
FROM users LIMIT 5;"

# List column names and types
echo -e "\n=== Users Table Columns ==="
psql $DATABASE_URL -c "SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;"

# Count total users
echo -e "\n=== Total User Count ==="
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"