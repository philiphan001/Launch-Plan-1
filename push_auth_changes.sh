#!/bin/bash
# Script to push authentication changes to GitHub
# Created on May 3, 2025

# Enable error reporting
set -e

# Print commands and their arguments as they are executed
set -x

echo "Starting GitHub push process for authentication fixes..."

# Ensure we're in the right directory
cd "$(dirname "$0")"
echo "Working in directory: $(pwd)"

# Set up git configuration if needed
echo "Configuring git user..."
git config user.name "Philip Han" || echo "Warning: Could not set git user name"
git config user.email "philip@launchplan.dev" || echo "Warning: Could not set git user email"

# Add the specific files we modified for the authentication fix
echo "Adding modified authentication files..."
git add client/src/App.tsx
git add client/src/pages/LoginPage.tsx
git add client/src/pages/SignupPage.tsx
git add server/routes/auth-routes.ts
git add server/session.ts

# Get current commit status
echo "Checking commit status..."
git status

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "Authentication fix has been pushed to GitHub successfully!"