"""
Test script to debug income calculation during education.
This will focus on the "not working" option for graduate school.
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

def test_education_not_working():
    """Test if income is correctly set to zero during graduate school when not working."""
    # Create a test input with "no" work status for education milestone
    input_data = {
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
                "year": 2,  # Start in year 2
                "targetOccupation": "Software Engineer",
                "returnToSameProfession": False,
                "workStatus": "no",  # Not working during education
                "tuition": 30000,
                "years": 2,  # 2 years of education
                "scholarships": 0,
                "educationLoans": 30000,
                "savingsUsed": 0
            }
        ]
    }
    
    # Create a log file for tracking
    with open('education_income_debug.log', 'w') as f:
        f.write("Starting education income debug test...\n\n")
    
    # Create calculator instance from input data
    calculator = FinancialCalculator.from_input_data(input_data)
    
    # Run the calculation
    results = calculator.calculate_projection()
    
    # Print the available result keys to the log
    with open('education_income_debug.log', 'a') as f:
        f.write("Result keys available:\n")
        for key in results.keys():
            f.write(f"- {key}\n")
        
        f.write("\nDetailed result structure:\n")
        for key, value in results.items():
            if isinstance(value, list):
                f.write(f"{key}: List with {len(value)} items\n")
                if value:
                    f.write(f"  First item: {value[0]}\n")
            elif isinstance(value, dict):
                f.write(f"{key}: Dictionary with {len(value)} keys\n")
                if value:
                    first_key = list(value.keys())[0]
                    f.write(f"  First key: {first_key}, value: {value[first_key]}\n")
            else:
                f.write(f"{key}: {value}\n")
    
    # Extract income data from results
    income_yearly = results.get("income", [])
    
    # Log income data for each year
    with open('education_income_debug.log', 'a') as f:
        f.write("\nIncome yearly after calculation:\n")
        for year, income in enumerate(income_yearly):
            # Mark education years (year 2-3)
            if year == 2 or year == 3:
                f.write(f"Year {year}: ${income} ** DURING EDUCATION (should be 0) **\n")
            elif year >= 4:
                f.write(f"Year {year}: ${income} ** POST-GRADUATION **\n")
            else:
                f.write(f"Year {year}: ${income} \n")
        
        # Check if there are any issues with the income during education years
        has_issue = False
        f.write("\nChecking for issues:\n")
        if len(income_yearly) > 2 and income_yearly[2] != 0:
            has_issue = True
            f.write(f"ISSUE: Year 2 income is {income_yearly[2]}, should be 0\n")
        
        if len(income_yearly) > 3 and income_yearly[3] != 0:
            has_issue = True
            f.write(f"ISSUE: Year 3 income is {income_yearly[3]}, should be 0\n")
        
        if not has_issue:
            f.write("No issues found - income is correctly set to 0 during education years\n")
        
        f.write("\nTest complete.\n")
    
    print("Test completed. Results written to education_income_debug.log")

# Run the test
if __name__ == "__main__":
    test_education_not_working()