#!/bin/bash

# Script to push Launch-Plan-1 to a new GitHub repository
# Created: May 5, 2025

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Launch-Plan-1 GitHub Push Tool =====${NC}"

# Check if repository URL is provided as argument
if [ -z "$1" ]; then
  echo -e "${YELLOW}Please enter your GitHub repository URL:${NC}"
  read REPO_URL
else
  REPO_URL=$1
fi

# Validate repository URL format
if [[ ! $REPO_URL =~ ^https://github.com/.+/.+\.git$ ]] && [[ ! $REPO_URL =~ ^git@github\.com:.+/.+\.git$ ]]; then
  echo -e "${YELLOW}The URL format doesn't look like a standard GitHub repository URL.${NC}"
  echo -e "${YELLOW}Expected format: https://github.com/username/repository.git OR git@github.com:username/repository.git${NC}"
  echo -e "${YELLOW}Do you want to continue anyway? (y/n)${NC}"
  read CONTINUE
  if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
    echo -e "${RED}Exiting...${NC}"
    exit 1
  fi
fi

# Check current git status
echo -e "${BLUE}Checking Git status...${NC}"
git status

echo -e "${YELLOW}Do you want to commit all changes before pushing? (y/n)${NC}"
read COMMIT_CHANGES

if [[ $COMMIT_CHANGES == "y" || $COMMIT_CHANGES == "Y" ]]; then
  echo -e "${YELLOW}Enter commit message:${NC}"
  read COMMIT_MESSAGE
  
  # Stage all files
  echo -e "${BLUE}Staging all files...${NC}"
  git add .
  
  # Commit changes
  echo -e "${BLUE}Committing changes...${NC}"
  git commit -m "$COMMIT_MESSAGE"
fi

# Check if remote already exists
if git remote | grep -q "^github$"; then
  echo -e "${YELLOW}Remote 'github' already exists. Do you want to update it? (y/n)${NC}"
  read UPDATE_REMOTE
  if [[ $UPDATE_REMOTE == "y" || $UPDATE_REMOTE == "Y" ]]; then
    git remote set-url github "$REPO_URL"
    echo -e "${GREEN}Remote 'github' updated to $REPO_URL${NC}"
  fi
else
  # Add the GitHub repository as a remote
  echo -e "${BLUE}Adding GitHub as a remote...${NC}"
  git remote add github "$REPO_URL"
  echo -e "${GREEN}Remote 'github' added${NC}"
fi

# Ask which branch to push
echo -e "${BLUE}Current branches:${NC}"
git branch

echo -e "${YELLOW}Enter the branch name you want to push (default: current branch):${NC}"
read BRANCH_NAME

if [ -z "$BRANCH_NAME" ]; then
  BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
fi

# Confirm before pushing
echo -e "${YELLOW}Ready to push branch '$BRANCH_NAME' to $REPO_URL. Continue? (y/n)${NC}"
read CONFIRM_PUSH

if [[ $CONFIRM_PUSH == "y" || $CONFIRM_PUSH == "Y" ]]; then
  echo -e "${BLUE}Pushing to GitHub...${NC}"
  git push -u github "$BRANCH_NAME"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Success! Your code has been pushed to GitHub.${NC}"
    echo -e "${GREEN}Repository URL: $REPO_URL${NC}"
  else
    echo -e "${RED}Push failed. Please check your repository URL and credentials.${NC}"
    echo -e "${YELLOW}You might need to set up SSH keys or use a personal access token.${NC}"
    echo -e "${BLUE}For more information, visit: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token${NC}"
  fi
else
  echo -e "${RED}Push canceled.${NC}"
fi

echo -e "${BLUE}===== Script completed =====${NC}"
