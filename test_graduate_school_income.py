"""
Test graduate school income calculation specifically focusing on the 'not working' option.
We need to verify that income is correctly set to zero during education years.
"""

import sys
import os
import json
from datetime import datetime

# Add the server/python directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
server_python_dir = os.path.join(current_dir, "server", "python")
sys.path.append(server_python_dir)

print(f"Adding path to sys.path: {server_python_dir}")
print(f"Current sys.path: {sys.path}")

# Import the FinancialCalculator class from the updated module
try:
    from server.python.financial_updated import FinancialCalculator
    print("Successfully imported financial_updated module")
except ImportError as e:
    print(f"Error importing financial_updated: {e}")
    # Try alternative import path
    try:
        # Fall back to direct import if package import fails
        sys.path.append(current_dir)  # Add the current directory to the path
        from financial_updated import FinancialCalculator
        print("Successfully imported financial_updated module using fallback method")
    except ImportError as e2:
        print(f"Error importing with fallback method: {e2}")
        print(f"All sys.path entries: {sys.path}")
        # List files in server/python directory to debug
        try:
            print(f"Files in server/python directory: {os.listdir(server_python_dir)}")
        except Exception as list_err:
            print(f"Error listing files: {list_err}")
        sys.exit(1)

def create_graduate_school_test_input():
    """Create a test input with graduate school milestone and 'not working' setting."""
    return {
        "startAge": 25,
        "yearsToProject": 10,
        "pathType": "baseline",
        "costOfLivingFactor": 1.0,
        "emergencyFundAmount": 10000,
        "personalLoanTermYears": 5,
        "personalLoanInterestRate": 8,
        "retirementContributionRate": 0.05,
        "retirementGrowthRate": 0.07,
        "assets": [
            {
                "type": "investment",
                "name": "Savings",
                "initialValue": 10000,
                "growthRate": 0.03
            }
        ],
        "liabilities": [],
        "incomes": [
            {
                "type": "salary",
                "name": "Primary Salary",
                "amount": 60000,
                "annualGrowthRate": 0.03,
                "startYear": 0,
                "endYear": 10
            }
        ],
        "expenditures": [],
        "milestones": [
            {
                "type": "education",
                "educationType": "masters",
                "yearsAway": 2,
                "targetOccupation": "Software Engineer",
                "returnToSameProfession": False,
                "workStatus": "no",
                "tuition": 30000,
                "years": 2,
                "scholarships": 0,
                "educationLoans": 30000,
                "savingsUsed": 0
            }
        ]
    }

def test_graduate_school_income():
    """Test if income is correctly set to zero during graduate school years with 'not working' setting."""
    # Create test input
    input_data = create_graduate_school_test_input()
    
    # Create calculator instance
    calculator = FinancialCalculator.from_input_data(input_data)
    
    # Run calculation
    results = calculator.calculate_projection()
    
    # Get income data
    income_yearly = results.get("income", [])
    
    if not income_yearly:
        print("ERROR: Income yearly data not found in results")
        return False
    
    # Check income values for years 2 and 3 (graduate school years)
    # We're doing graduate school in years 2-3, starting at age 27
    print("\nIncome values by year:")
    for year, income in enumerate(income_yearly):
        in_school = (year == 2 or year == 3)
        status = "DURING EDUCATION" if in_school else "PRE/POST EDUCATION"
        expected = "SHOULD BE 0" if in_school else ""
        print(f"Year {year} (age {input_data['startAge'] + year}): ${income} - {status} {expected}")
    
    # Check if income is properly zeroed during education years
    has_issue = income_yearly[2] != 0 or income_yearly[3] != 0
    
    if has_issue:
        print("\nISSUE DETECTED: Income is not properly zeroed during education years")
        print(f"Year 2 income: ${income_yearly[2]} (should be 0)")
        print(f"Year 3 income: ${income_yearly[3]} (should be 0)")
    else:
        print("\nNo issues found - income is correctly set to 0 during education years")
    
    # Also check post-graduation salary
    if len(income_yearly) > 4:
        post_grad_income = income_yearly[4]
        print(f"Post-graduation income (year 4): ${post_grad_income}")
    
    # Return test result (True = passed, False = failed)
    return not has_issue

if __name__ == "__main__":
    print("Starting graduate school income test...")
    
    result = test_graduate_school_income()
    
    # Output final result
    if result:
        print("\nTEST PASSED: Graduate school income calculation is working correctly")
    else:
        print("\nTEST FAILED: Graduate school income calculation is not working correctly")
    
    # Output result in JSON format for automated testing
    result_json = {
        "test_passed": result,
        "timestamp": datetime.now().isoformat()
    }
    
    print(f"\nResult JSON: {json.dumps(result_json, indent=2)}")