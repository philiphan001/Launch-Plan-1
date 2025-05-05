#!/bin/bash

# Super simple GitHub save script
# Created: May 5, 2025

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=== SIMPLIFIED GITHUB SAVE TOOL ==="
echo "This script will help you save your code to GitHub with minimal effort"

# Ask for repository URL if not provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Enter your GitHub repository URL:${NC}"
  echo -e "(Example: https://github.com/username/Launch-Plan-1.git)"
  read REPO_URL
else
  REPO_URL=$1
fi

# Ask for GitHub credentials
echo -e "${YELLOW}Enter your GitHub username:${NC}"
read GITHUB_USERNAME

echo -e "${YELLOW}Enter your GitHub personal access token (will be hidden):${NC}"
read -s GITHUB_TOKEN
echo ""

# Configure credential helper for macOS
git config --global credential.helper osxkeychain

# Save credentials to keychain
echo "protocol=https
host=github.com
username=$GITHUB_USERNAME
password=$GITHUB_TOKEN" | git credential-osxkeychain store

# Set up the remote
if git remote | grep -q "origin"; then
  echo "Remote 'origin' exists. Updating URL..."
  git remote set-url origin "$REPO_URL"
else
  echo "Adding GitHub as remote 'origin'..."
  git remote add origin "$REPO_URL"
fi

# Commit all changes
echo "Committing all changes..."
git add .
git commit -m "Auto-commit from simplified GitHub save script - $(date)"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin $(git rev-parse --abbrev-ref HEAD)

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Success! Your code has been saved to GitHub.${NC}"
else
  echo -e "${RED}Push failed. Most common issues:${NC}"
  echo "1. Invalid repository URL"
  echo "2. Invalid personal access token"
  echo "3. Repository doesn't exist on GitHub"
  echo ""
  echo "Make sure you've created the repository on GitHub first!"
  echo "URL: https://github.com/new"
fi

echo "=== DONE ==="