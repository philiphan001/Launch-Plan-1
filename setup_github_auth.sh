#!/bin/bash

# Script to set up GitHub authentication with a Personal Access Token
# Created: May 5, 2025

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== GitHub Authentication Setup =====${NC}"
echo -e "${YELLOW}This script will help you set up GitHub authentication using a Personal Access Token${NC}"

# Ask for GitHub username
echo -e "${YELLOW}Enter your GitHub username:${NC}"
read GITHUB_USERNAME

# Ask for Personal Access Token
echo -e "${YELLOW}Enter your GitHub Personal Access Token:${NC}"
read -s GITHUB_TOKEN
echo ""

# Configure credential helper based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use osxkeychain
    echo -e "${BLUE}Setting up credential helper for macOS...${NC}"
    git config --global credential.helper osxkeychain
    
    # Store the credentials
    echo -e "${BLUE}Storing your GitHub credentials in the keychain...${NC}"
    echo "protocol=https
host=github.com
username=$GITHUB_USERNAME
password=$GITHUB_TOKEN" | git credential-osxkeychain store
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - use cache
    echo -e "${BLUE}Setting up credential helper for Linux...${NC}"
    git config --global credential.helper 'cache --timeout=86400'
    
    # Store the credentials (will be cached)
    echo -e "${BLUE}Caching your GitHub credentials...${NC}"
    echo "url=https://github.com
username=$GITHUB_USERNAME
password=$GITHUB_TOKEN" | git credential approve
    
else
    # Windows or other OS
    echo -e "${BLUE}Setting up credential helper...${NC}"
    git config --global credential.helper store
    
    # This will store credentials in plaintext, warn the user
    echo -e "${RED}Warning: This will store your GitHub token in plaintext in your home directory.${NC}"
    echo -e "${YELLOW}If you prefer more security, cancel and use the token manually when prompted.${NC}"
    echo -e "${YELLOW}Continue? (y/n)${NC}"
    read CONTINUE
    
    if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
        echo -e "${RED}Setup canceled.${NC}"
        exit 1
    fi
    
    # Store the credentials
    echo "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com" > ~/.git-credentials
    chmod 600 ~/.git-credentials
fi

# Verify configuration
echo -e "${GREEN}GitHub authentication setup complete!${NC}"
echo -e "${GREEN}You should now be able to push to GitHub without entering credentials each time.${NC}"
echo ""
echo -e "${BLUE}Current Git credential helper:${NC} $(git config --global credential.helper)"
echo ""
echo -e "${YELLOW}To push your code to GitHub, run:${NC}"
echo -e "${NC}    ./push_to_github.sh${NC}"
echo ""
echo -e "${BLUE}===== Setup complete =====${NC}"