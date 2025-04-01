#!/bin/bash

# Script to run the full dataset import in chunks
# This script can be executed multiple times until the full dataset is imported

echo "Starting location cost of living database import"
echo "This script can be run multiple times to continue the import process"
echo "=====================================================================\n"

# Check if the import is already in progress
node scripts/import-full-dataset-batched.js --check

echo "\nStarting/continuing the import process..."
NODE_ENV=development node scripts/import-full-dataset-batched.js

# Check progress again after this run
echo "\nCurrent import progress:"
node scripts/import-full-dataset-batched.js --check

echo "\nImport process complete for this run. If the percentage is less than 100%,"
echo "please run this script again to continue the import process."