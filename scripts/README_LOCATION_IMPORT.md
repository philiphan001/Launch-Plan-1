# Location Cost of Living Data Import Guide

## Overview

This guide explains how to import the full location cost of living dataset with about 44,238 records into the database.

## Important Facts

- Total Records: 44,238
- Unique Zip Codes: 37,923 
- Duplicate Zip Codes: 6,315 (these won't be imported due to the UNIQUE constraint)
- CSV Format: Properly handled with various key formats for zip code detection

## Import Process

The import script is designed to process the dataset in batches with resume capability, making it resilient to timeouts or interruptions.

### How the Import Works

1. The script reads and parses the CSV file in memory
2. It processes records in batches (configurable batch size)
3. For each batch, it:
   - Transforms the data for database insertion
   - Filters out records with duplicate zip codes (within the batch)
   - Inserts records with the ON CONFLICT DO NOTHING clause to handle duplicates
4. Progress is tracked in `.location_import_progress.json`
5. After all regular data is imported, it updates major city data with accurate values

### Import Commands

Use the `import-location-data.sh` script with the following parameters:

```bash
# Format
./scripts/import-location-data.sh [batch_size] [mode]

# Examples:
# Import with larger batch size (5000)
./scripts/import-location-data.sh 5000 truncate

# Resume from last position with batch size 5000
./scripts/import-location-data.sh 5000 resume
```

## Recommended Approach

Since the script will time out when attempting to process all 44,238 records in one run, you'll need to run it multiple times using the "resume" mode:

1. Run initial import:
   ```bash
   ./scripts/import-location-data.sh 5000 truncate
   ```

2. Run resume operations until all data is imported:
   ```bash
   ./scripts/import-location-data.sh 5000 resume
   ```

3. After completing, verify the data:
   ```bash
   # Count total records
   echo "SELECT COUNT(*) FROM location_cost_of_living;" | npx tsx scripts/execute-sql.js
   
   # Sample random records
   echo "SELECT * FROM location_cost_of_living ORDER BY RANDOM() LIMIT 5;" | npx tsx scripts/execute-sql.js
   ```

## Troubleshooting

If you encounter issues:

1. Check the progress file: `.location_import_progress.json`
2. Use `scripts/analyze-location-dataset.js` to examine the CSV data
3. If something goes wrong, you can start over with `truncate` mode

## Explanation of Limited Records

The import will never reach exactly 44,238 records in the database because:

1. There are only 37,923 unique zip codes in the source data
2. The database has a UNIQUE constraint on the zip_code column
3. When the script encounters a duplicate zip code, it skips it (using ON CONFLICT DO NOTHING)

This behavior is intentional - we only want one record per zip code in the database.