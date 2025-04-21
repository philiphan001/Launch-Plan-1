-- Add spouse_base_income column to milestones table
ALTER TABLE milestones ADD COLUMN spouse_base_income integer;

-- Update existing records to set base_income same as adjusted income
UPDATE milestones 
SET spouse_base_income = spouse_income 
WHERE type = 'marriage' AND spouse_income IS NOT NULL; 