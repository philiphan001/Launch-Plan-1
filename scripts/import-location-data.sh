#!/bin/bash

# Script to import location cost of living data
# Usage: ./scripts/import-location-data.sh [batch_size] [truncate|resume]

# Default batch size
BATCH_SIZE="${1:-1000}"

# Operation mode (truncate or resume)
MODE="${2:-truncate}"

if [ "$MODE" == "truncate" ]; then
  echo "Starting FULL import process with truncate (will erase existing data)"
  node scripts/import-full-location-dataset.js "$BATCH_SIZE" truncate
elif [ "$MODE" == "resume" ]; then
  echo "Resuming import process from last position"
  node scripts/import-full-location-dataset.js "$BATCH_SIZE" resume
else
  echo "Unknown mode: $MODE"
  echo "Usage: ./scripts/import-location-data.sh [batch_size] [truncate|resume]"
  exit 1
fi

# Check record count after import
echo "Checking import results..."
echo "SELECT COUNT(*) FROM location_cost_of_living;" | npx tsx scripts/execute-sql.js