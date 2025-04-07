"""
Test script to debug income calculation during education.
This will focus on the "not working" option for graduate school.
"""

import json
import sys
import os

# Add the server/python directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'server', 'python'))

# Import the financial calculator
from financial_updated import FinancialCalculator

def test_education_not_working():
    """Test if income is correctly set to zero during graduate school when not working."""
    
    # Create a test input with graduate school and "not working" status
    test_input = {
        "profileData": {
            "age": 25,
            "income": 75000,  # Set a specific income that's easier to track
            "location": "New York, NY",
            "savings": 20000,
            "otherAssets": 5000,
            "retirementSavings": 10000,
            "debt": 20000,
            "expenses": 3000
        },
        "assumptions": {
            "inflation": 0.03,
            "investmentReturn": 0.07,
            "taxRate": 0.25,
            "retirementContributionRate": 0.05,
            "rentExpensePercent": 0.3,
            "foodExpensePercent": 0.15,
            "transportationExpensePercent": 0.10,
            "healthcareExpensePercent": 0.05,
            "otherExpensePercent": 0.15
        },
        "debtItems": [
            {
                "type": "student",
                "balance": 20000,
                "interestRate": 0.05,
                "minimumPayment": 200,
                "term": 10
            }
        ],
        "milestones": [
            {
                "type": "education",
                "educationType": "masters",
                "yearsAway": 2,
                "targetOccupation": "Software Engineer",
                "returnToSameProfession": False,
                "workStatus": "no",  # Not working during education
                "tuition": 30000,
                "years": 2,
                "scholarships": 0,
                "educationLoans": 30000,
                "savingsUsed": 0
            }
        ],
        "careersData": [
            {
                "id": "software-engineer",
                "title": "Software Engineer",
                "category": "Technology",
                "medianSalary": 105000,
                "salaryRange": {
                    "entry": 80000,
                    "mid": 115000,
                    "senior": 150000
                }
            }
        ]
    }
    
    # Create output file for debugging
    with open('education_income_debug.log', 'w') as f:
        f.write("Starting education income debug test...\n")
        
    # Create the calculator using the from_input_data class method
    calculator = FinancialCalculator.from_input_data(test_input)
    result = calculator.calculate_projection()
    
    # Log all the keys in the result for debugging
    with open('education_income_debug.log', 'a') as f:
        f.write("\nResult keys available:\n")
        for key in result.keys():
            f.write(f"- {key}\n")
            
        # For debugging nested structure
        f.write("\nDetailed result structure:\n")
        for key, value in result.items():
            if isinstance(value, list):
                f.write(f"{key}: List with {len(value)} items\n")
                if len(value) > 0:
                    f.write(f"  First item: {value[0]}\n")
            elif isinstance(value, dict):
                f.write(f"{key}: Dict with {len(value)} keys\n")
                if len(value) > 0:
                    f.write(f"  Keys: {', '.join(value.keys())}\n")
            else:
                f.write(f"{key}: {value}\n")
    
    # Find the income yearly data
    income_yearly = None
    if "income_yearly" in result:
        income_yearly = result["income_yearly"]
    elif "incomeYearly" in result:
        income_yearly = result["incomeYearly"]
    elif "income" in result and isinstance(result["income"], list):
        income_yearly = result["income"]
    
    # Print income yearly for debugging
    milestone_year = test_input['milestones'][0]['yearsAway']
    education_years = test_input['milestones'][0]['years']
    
    with open('education_income_debug.log', 'a') as f:
        f.write("\nIncome yearly after calculation:\n")
        if income_yearly:
            # Loop through each year in the result
            for year, income in enumerate(income_yearly):
                status = ""
                if year >= milestone_year and year < milestone_year + education_years:
                    status = "** DURING EDUCATION (should be 0) **"
                elif year >= milestone_year + education_years:
                    status = "** POST-GRADUATION **"
                    
                f.write(f"Year {year}: ${income} {status}\n")
        else:
            f.write("Could not find income yearly data in the result\n")
    
    # Print where we found the issue
    with open('education_income_debug.log', 'a') as f:
        f.write("\nChecking for issues:\n")
        
        # Check if income during education is not zero
        has_issue = False
        if income_yearly:
            for year in range(milestone_year, milestone_year + education_years):
                if year < len(income_yearly) and income_yearly[year] != 0:
                    has_issue = True
                    f.write(f"ISSUE: Year {year} should have $0 income but has ${income_yearly[year]}\n")
            
            if not has_issue:
                f.write("No issues found - income is correctly set to 0 during education years\n")
        else:
            f.write("Cannot check issues - income_yearly data not found\n")
            has_issue = True
    
    # Calculate graduation year
    graduation_year = milestone_year + education_years
    
    # Return results for verification
    return {
        "has_issue": has_issue,
        "income_yearly_found": income_yearly is not None,
        "income_during_education": [income_yearly[year] for year in range(milestone_year, milestone_year + education_years) 
                                   if income_yearly and year < len(income_yearly)] if income_yearly else [],
        "income_after_education": income_yearly[graduation_year] if income_yearly and graduation_year < len(income_yearly) else "Not available"
    }

if __name__ == "__main__":
    result = test_education_not_working()
    print(json.dumps(result, indent=2))
    
    with open('education_income_debug.log', 'a') as f:
        f.write("\nTest complete.\n")