#!/bin/bash

# Check if arguments are provided
if [ "$#" -eq 2 ]; then
  username=$1
  token=$2
else
  echo "Pushing to GitHub..."
  echo "Please enter your GitHub username:"
  read username
  echo "Please enter your GitHub Personal Access Token (it won't be displayed):"
  read -s token
fi

# Fix remote setup
git remote remove origin
git remote add origin https://github.com/philiphan001/FP---React.git

# Push to GitHub using credentials
echo "Attempting to push to GitHub repository: https://github.com/philiphan001/FP---React.git"
echo "This may take a moment..."
git push https://$username:$token@github.com/philiphan001/FP---React.git main

if [ $? -eq 0 ]; then
  echo "Success! Your code has been pushed to GitHub."
  echo "Visit https://github.com/philiphan001/FP---React to see your repository."
else
  echo "Push failed. Please check your username and token."
  echo "If problems persist, you may need to use GitHub Desktop or another method."
fi
