"""
Test script for verifying the 'not working during education' functionality.
This test focuses on graduate school milestone with workStatus="no" to ensure 
income is properly zeroed during education years.
"""

import json
import sys
from pathlib import Path

# Make sure we can import from the server/python directory
server_path = Path("server/python")
sys.path.append(str(server_path.absolute()))

from calculator import create_baseline_projection

def test_graduate_school_not_working():
    """Test if income is correctly set to zero during grad school with workStatus='no'."""
    # Create a test input with graduate school milestone and explicit workStatus="no"
    input_data = {
        "startAge": 28,
        "yearsToProject": 15,
        "initialSavings": 20000,
        "initialIncome": 70000,
        "incomeGrowthRate": 0.03,
        "retirementContributionRate": 0.05,
        "taxFilingStatus": "single",
        # Add initial income source to make sure we start with non-zero income
        "incomes": [
            {
                "name": "Salary",
                "amount": 70000,
                "growthRate": 0.03,
                "startYear": 0,
                "endYear": 15
            }
        ],
        # Add career data for the target occupation
        "careersData": [
            {
                "id": "business-manager",
                "title": "Business Manager",
                "salary": 95000,
                "salaryMedian": 95000,
                "median_salary": 95000
            }
        ],
        # Add initial career milestone
        "milestones": [
            {
                "type": "job",
                "title": "Start current job",
                "year": 0,
                "income_change": 70000
            },
            {
                "type": "education",
                "subtype": "graduate",
                "title": "Get MBA",
                "year": 2,
                "duration": 2,
                "educationAnnualCost": 40000,
                "educationAnnualLoan": 25000,
                "workStatus": "no",  # This is the critical value we're testing
                "partTimeIncome": 20000,
                "targetOccupation": "Business Manager"
            }
        ]
    }
    
    # Create a projection
    projection = create_baseline_projection(input_data)
    
    # Print the keys in the projection for debugging
    print("Projection keys:", list(projection.keys()))
    
    # Check if the projection was successful
    assert "error" not in projection, f"Projection failed with error: {projection.get('error')}"
    
    # In the actual calculator output, the data is not in yearlyData but separate arrays
    # We're mainly interested in the income array
    income_data = projection.get('income', [])
    assert len(income_data) > 0, "No income data in projection"
    
    print(f"Income data length: {len(income_data)}")
    
    # The milestone is at year 2, so years 2 and 3 should have zero income
    education_year_1_income = income_data[2]
    education_year_2_income = income_data[3]
    
    # Also check how the milestone is recorded
    milestones = projection.get('milestones', [])
    print(f"Milestones: {milestones}")
    
    # Check if income is zero during education years
    assert education_year_1_income == 0, f"Income not zero in education year 1: {education_year_1_income}"
    assert education_year_2_income == 0, f"Income not zero in education year 2: {education_year_2_income}"
    
    # Print the income values for verification
    print("=== TEST RESULTS ===")
    print(f"Year 0 (Pre-education): ${income_data[0]}")
    print(f"Year 1 (Pre-education): ${income_data[1]}")
    print(f"Year 2 (Education Year 1): ${income_data[2]}")
    print(f"Year 3 (Education Year 2): ${income_data[3]}")
    print(f"Year 4 (Post-education): ${income_data[4]}")
    
    print("\nTest passed! Income is correctly zeroed during graduate school years.")

if __name__ == "__main__":
    test_graduate_school_not_working()