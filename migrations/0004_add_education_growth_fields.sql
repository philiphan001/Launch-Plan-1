-- Add new columns for growth assumptions
ALTER TABLE milestones 
ADD COLUMN income_growth_rate real DEFAULT 0.03,
ADD COLUMN cost_of_living_growth_rate real DEFAULT 0.02,
ADD COLUMN education_cost_growth_rate real DEFAULT 0.04,
ADD COLUMN inflation_rate real DEFAULT 0.02;

-- Add new columns for education details
ALTER TABLE milestones
ADD COLUMN education_pathway_type text,
ADD COLUMN education_scholarships integer DEFAULT 0,
ADD COLUMN education_grants integer DEFAULT 0,
ADD COLUMN education_savings_used integer DEFAULT 0,
ADD COLUMN education_loan_interest_rate real DEFAULT 0.05,
ADD COLUMN education_loan_term_years integer DEFAULT 10;

-- Create an enum type for education types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE education_type_enum AS ENUM (
        '4year_college',
        '2year_college',
        'vocational',
        'masters',
        'doctorate',
        'professional'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Modify the education_type column to use the enum
ALTER TABLE milestones 
ALTER COLUMN education_type TYPE education_type_enum 
USING education_type::education_type_enum;

-- Add a check constraint to ensure valid education types
ALTER TABLE milestones
ADD CONSTRAINT valid_education_type 
CHECK (
    (type != 'education') OR 
    (type = 'education' AND education_type IN (
        '4year_college',
        '2year_college',
        'vocational',
        'masters',
        'doctorate',
        'professional'
    ))
);

-- Add a check constraint for growth rates
ALTER TABLE milestones
ADD CONSTRAINT valid_growth_rates
CHECK (
    income_growth_rate >= 0 AND income_growth_rate <= 0.10 AND
    cost_of_living_growth_rate >= 0 AND cost_of_living_growth_rate <= 0.08 AND
    education_cost_growth_rate >= 0 AND education_cost_growth_rate <= 0.10 AND
    inflation_rate >= 0 AND inflation_rate <= 0.08
);

-- Add a check constraint for education loan terms
ALTER TABLE milestones
ADD CONSTRAINT valid_education_loan_term
CHECK (
    (type != 'education') OR
    (type = 'education' AND education_loan_term_years >= 5 AND education_loan_term_years <= 30)
);

-- Add a check constraint for education loan interest rates
ALTER TABLE milestones
ADD CONSTRAINT valid_education_loan_rate
CHECK (
    (type != 'education') OR
    (type = 'education' AND education_loan_interest_rate >= 0 AND education_loan_interest_rate <= 0.12)
);

-- Update existing education milestones to use the new enum type
UPDATE milestones
SET education_type = '4year_college'
WHERE type = 'education' AND education_type = '4year';

UPDATE milestones
SET education_type = '2year_college'
WHERE type = 'education' AND education_type = '2year';

-- Add comments to the new columns
COMMENT ON COLUMN milestones.income_growth_rate IS 'Annual growth rate for income (default: 3%)';
COMMENT ON COLUMN milestones.cost_of_living_growth_rate IS 'Annual growth rate for cost of living (default: 2%)';
COMMENT ON COLUMN milestones.education_cost_growth_rate IS 'Annual growth rate for education costs (default: 4%)';
COMMENT ON COLUMN milestones.inflation_rate IS 'General inflation rate (default: 2%)';
COMMENT ON COLUMN milestones.education_pathway_type IS 'Type of education pathway (e.g., traditional, accelerated, part-time)';
COMMENT ON COLUMN milestones.education_scholarships IS 'Amount of scholarships received';
COMMENT ON COLUMN milestones.education_grants IS 'Amount of grants received';
COMMENT ON COLUMN milestones.education_savings_used IS 'Amount of savings used for education';
COMMENT ON COLUMN milestones.education_loan_interest_rate IS 'Interest rate for education loans (default: 5%)';
COMMENT ON COLUMN milestones.education_loan_term_years IS 'Term length for education loans in years (default: 10)'; 