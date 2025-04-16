#!/bin/bash

# Use environment variables for GitHub credentials
username=$GITHUB_USERNAME
token=$GITHUB_TOKEN

echo "Preparing to push code to GitHub..."

# Configure Git
git config --global user.name "$username"
git config --global user.email "$username@users.noreply.github.com"

# Make sure we have all changes added
git add .
git status

# Commit changes with a descriptive message
echo "Committing changes..."
git commit -m "Fix attempt for financial projections loading issue"

# Setup or fix the remote
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$username/FP---React.git"

# Push to GitHub using credentials
echo "Pushing to GitHub repository: https://github.com/$username/FP---React.git"
echo "This may take a moment..."
git push -u "https://$username:$token@github.com/$username/FP---React.git" main

if [ $? -eq 0 ]; then
  echo "Success! Your code has been pushed to GitHub."
  echo "Visit https://github.com/$username/FP---React to see your repository."
else
  # Try with master branch if main fails
  echo "Trying with 'master' branch instead of 'main'..."
  git push -u "https://$username:$token@github.com/$username/FP---React.git" master
  
  if [ $? -eq 0 ]; then
    echo "Success! Your code has been pushed to GitHub."
    echo "Visit https://github.com/$username/FP---React to see your repository."
  else
    echo "Push failed. Please check your repository settings or access permissions."
    echo "If problems persist, you may need to create a new repository first."
  fi
fi
