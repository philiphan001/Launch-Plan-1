#!/bin/bash

# Script to import all CSV data in a specific order
echo "Starting data import process..."

# Import colleges
echo "Importing colleges..."
node scripts/import-csv-colleges.js

# Import careers
echo "Importing careers..."
node scripts/import-csv-careers.js

# Import career paths
echo "Importing career paths..."
node scripts/import-csv-career-paths.js

# Import location cost of living
echo "Importing location cost of living..."
node scripts/import-csv-location-cost-of-living.js

# Import zip code income
echo "Importing zip code income..."
node scripts/import-csv-zip-code-income.js

echo "All data import completed!"