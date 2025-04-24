#!/bin/bash

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Create the certificates directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/certificates"

# Download the AWS RDS root certificate
curl -o "$PROJECT_ROOT/certificates/rds-ca-2019-root.pem" https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

echo "AWS RDS root certificate downloaded successfully to $PROJECT_ROOT/certificates/rds-ca-2019-root.pem" 