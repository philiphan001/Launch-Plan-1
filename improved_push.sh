#!/bin/bash

# Get GitHub credentials from environment variables
username="${GITHUB_USERNAME}"
token="${GITHUB_TOKEN}"

# Verify that the credentials are available
if [ -z "$username" ] || [ -z "$token" ]; then
  echo "Error: GitHub credentials not found in environment variables."
  exit 1
fi

echo "Pushing to GitHub as user: $username"

# Check if our remote is already set up correctly
remote_url=$(git remote get-url origin 2>/dev/null || echo "")
expected_url="https://github.com/philiphan001/FP---React.git"

if [ "$remote_url" != "$expected_url" ]; then
  echo "Fixing remote repository URL..."
  git remote remove origin 2>/dev/null || true
  git remote add origin "$expected_url"
fi

# Make sure we're on the main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "Switching to main branch..."
  git checkout main
fi

# Push to GitHub using credentials
echo "Attempting to push to GitHub repository: $expected_url"
echo "This may take a moment..."

# Use the credentials to push
git push "https://$username:$token@github.com/philiphan001/FP---React.git" main

if [ $? -eq 0 ]; then
  echo "Success! Your code has been pushed to GitHub."
  echo "Visit https://github.com/philiphan001/FP---React to see your repository."
else
  echo "Push failed. Please check your username and token."
  echo "Error details:"
  # Try to get more information about the error
  git push "https://$username:$token@github.com/philiphan001/FP---React.git" main --verbose 2>&1 | grep -v "$token"
fi