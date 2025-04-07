"""
Test the inflation adjustment for salaries in the financial calculator.
This test uses the financial_updated.py module directly from the server directory.
"""

import os
import sys
import json

# Get the absolute path to the server directory
server_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server', 'python')
sys.path.append(server_dir)

# Now we can import from the server/python directory
from financial_updated import FinancialCalculator

def test_inflation_adjustment():
    print("Testing salary inflation adjustment...")
    
    # Create a basic test dataset
    input_data = {
        "assets": [
            {"name": "Savings", "type": "savings", "value": 50000, "growth_rate": 0.01}
        ],
        "liabilities": [],
        "income": [
            {"name": "Job", "type": "salary", "amount": 80000, "growth_rate": 0.03}
        ],
        "expenses": [
            {"name": "Living", "amount": 3000, "frequency": "monthly", "type": "living", "growth_rate": 0.02}
        ],
        "milestones": [
            {
                "type": "education",
                "title": "MBA Program",
                "yearsAway": 2,
                "tuition": 60000,
                "program_length": 2,
                "loan_percentage": 50,
                "target_occupation": "Financial Manager",
                "expense_coverage": 0,
                "work_status": "none",
                "return_to_same_profession": False
            }
        ],
        "costOfLivingFactor": 1.0
    }
    
    # Mock careers database
    careers_db = [
        {
            "title": "Financial Manager",
            "salaryMedian": 100000,
            "education": "masters",
            "category": "Business"
        }
    ]
    
    # Set up the calculator
    calculator = FinancialCalculator(start_age=25, years_to_project=15)
    calculator._careers_db = careers_db  # Inject the careers database
    
    # Calculate the projection
    calculator = calculator.from_input_data(input_data)
    result = calculator.calculate_projection()
    
    # Print the raw result to a file for review
    with open('inflation_test_result.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    # Print raw yearly_data to debug
    yearly_data = result.get('yearly_data', {})
    print("\nYearly data keys:", yearly_data.keys() if yearly_data else "No yearly data found")
    
    # Print raw income_yearly to debug
    income_yearly = yearly_data.get('income_yearly', {})
    print("\nIncome yearly keys:", income_yearly.keys() if income_yearly else "No income yearly data found")
    
    # Also check the milestones to make sure our education milestone was processed
    milestones = result.get('milestones', [])
    print("\nMilestones processed:", len(milestones))
    for m in milestones:
        print(f"  - {m.get('type', 'unknown')} milestone: {m.get('title', 'untitled')}")
        print(f"    Target occupation: {m.get('target_occupation', 'None')}")
    
    print("\nIncome progression by year:")
    for year in range(15):
        year_str = str(year)
        if year_str in income_yearly:
            print(f"Year {year} (Age {25+year}): ${income_yearly[year_str]}")
    
    # Year 4 should have the inflation-adjusted salary for Financial Manager
    # Base salary of $100,000 with 4 years of inflation at 3% should be around $112,550
    year_4_income = income_yearly.get('4', 0)
    base_salary = 100000
    inflation_years = 4
    inflation_rate = 0.03
    expected_salary = int(base_salary * ((1 + inflation_rate) ** inflation_years))
    
    print(f"\nYear 4 (graduation year) analysis:")
    print(f"Base salary (current value): ${base_salary}")
    print(f"Years of inflation: {inflation_years}")
    print(f"Inflation rate: {inflation_rate*100}%")
    print(f"Expected inflation-adjusted salary: ${expected_salary}")
    print(f"Actual calculated salary: ${year_4_income}")
    
    percentage_diff = ((year_4_income / base_salary) - 1) * 100
    print(f"Percentage increase from base: {percentage_diff:.1f}%")
    
    # Success criteria: within 2% of the expected value
    if abs(year_4_income - expected_salary) < (expected_salary * 0.02):
        print("\n✅ SUCCESS: Year 4 salary shows correct inflation adjustment")
    else:
        print("\n❌ FAILURE: Year 4 salary does not show expected inflation adjustment")
    
    # Check the logs for inflation mentions
    try:
        with open('healthcare_debug.log', 'r') as f:
            log_content = f.read()
            inflation_logs = [line for line in log_content.split('\n') if 'inflation' in line.lower()]
            if inflation_logs:
                print("\nFound inflation calculation logs:")
                for line in inflation_logs:
                    print(f"  {line}")
            else:
                print("No detailed inflation logs found.")
    except Exception as e:
        print(f"Error reading log file: {e}")

if __name__ == "__main__":
    test_inflation_adjustment()