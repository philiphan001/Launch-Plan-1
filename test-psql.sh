#!/bin/bash

# Load environment variables
source .env

# Export PGPASSWORD
export PGPASSWORD=$AWS_RDS_PASSWORD

# Try to connect using psql
psql \
  -h $AWS_RDS_HOST \
  -p $AWS_RDS_PORT \
  -U $AWS_RDS_USERNAME \
  -d $AWS_RDS_DATABASE \
  -c "SELECT version();" 