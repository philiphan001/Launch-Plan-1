-- Add age adjustment fields to financial_projections table
ALTER TABLE financial_projections
ADD COLUMN original_starting_age integer,
ADD COLUMN age_adjustment_years integer,
ADD COLUMN education_type text;

-- Add comments to explain the new columns
COMMENT ON COLUMN financial_projections.original_starting_age IS 'The original starting age before any education-based adjustment';
COMMENT ON COLUMN financial_projections.age_adjustment_years IS 'Number of years added to starting age based on education path';
COMMENT ON COLUMN financial_projections.education_type IS 'Type of education that caused the age adjustment (e.g., 4year_college, 2year_college)';

-- Update existing records to set original_starting_age equal to starting_age
-- and age_adjustment_years to 0 (no adjustment)
UPDATE financial_projections
SET original_starting_age = starting_age,
    age_adjustment_years = 0,
    education_type = 'none'
WHERE original_starting_age IS NULL; 