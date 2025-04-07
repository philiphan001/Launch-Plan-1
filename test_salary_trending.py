"""
Test the salary trending mechanism for career changes in the financial calculator.
"""

import sys
import os
import json

# Add the server/python directory to the path so we can import from it
sys.path.append(os.path.join(os.path.dirname(__file__), 'server', 'python'))

# Import the calculator
from server.python.financial_updated import FinancialCalculator

def test_career_salary_trending():
    """Test the trending of career salaries from current values to future start years."""
    print("Testing career salary trending mechanism...")
    
    # Create a basic input with a graduate school milestone that changes careers
    input_data = {
        "assets": [
            {
                "name": "Savings Account",
                "type": "savings",
                "value": 50000,
                "growth_rate": 0.01
            }
        ],
        "liabilities": [],
        "income": [
            {
                "name": "Job Salary",
                "type": "salary",
                "amount": 80000,
                "growth_rate": 0.03
            }
        ],
        "expenses": [
            {
                "name": "Basic Living Expenses",
                "amount": 3000,
                "frequency": "monthly",
                "type": "living",
                "growth_rate": 0.02
            }
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
    
    # Create a mock careers database for the calculator to use
    careers_db = [
        {
            "title": "Financial Manager",
            "salaryMedian": 100000,
            "education": "masters",
            "category": "Business"
        }
    ]
    
    # Create a log file for detailed debugging
    with open('salary_trending_test.log', 'w') as f:
        f.write("Starting salary trending test\n")
    
    # Create the calculator with default values
    calculator = FinancialCalculator(start_age=25, years_to_project=15)
    
    # Set the careers DB and then use from_input_data to configure the calculator
    calculator._careers_db = careers_db
    
    # Run the calculation using the input data
    result = calculator.from_input_data(input_data).calculate_projection()
    
    # Get the yearly data from the result
    yearly_data = result.get("yearly_data", {})
    income_yearly = yearly_data.get("income_yearly", {})
    
    # Print the result details
    print("\nYearly Income Progression:")
    for year, income in sorted({int(k): v for k, v in income_yearly.items()}.items()):
        print(f"Year {year} (Age {25+int(year)}): ${income}")
    
    # Analyze specific years in detail
    print("\nAnalyzing key years in detail:")
    
    # Year 0: Starting income
    year_0_income = income_yearly.get('0', 0)
    print(f"Year 0 (Age 25): ${year_0_income} - Starting income")
    
    # Year 1: Growth on starting income
    year_1_income = income_yearly.get('1', 0)
    expected_year_1 = int(80000 * 1.03)
    print(f"Year 1 (Age 26): ${year_1_income} - Expected: ~${expected_year_1} (with 3% growth)")
    
    # Years 2-3: Education period (should be 0 or reduced based on work_status)
    year_2_income = income_yearly.get('2', 0)
    year_3_income = income_yearly.get('3', 0)
    print(f"Year 2 (Age 27): ${year_2_income} - Education period (should be reduced/zero)")
    print(f"Year 3 (Age 28): ${year_3_income} - Education period (should be reduced/zero)")
    
    # Year 4: New career starting year (with inflation adjustment)
    year_4_income = income_yearly.get('4', 0)
    base_salary = 100000
    inflation_years = 4
    inflation_rate = 0.03
    inflation_factor = (1 + inflation_rate) ** inflation_years
    expected_year_4 = int(base_salary * inflation_factor)
    
    print(f"Year 4 (Age 29): ${year_4_income} - New career (Financial Manager)")
    print(f"  Base salary: ${base_salary}")
    print(f"  Years of inflation: {inflation_years}")
    print(f"  Inflation rate: {inflation_rate*100}%")
    print(f"  Inflation factor: {inflation_factor}")
    print(f"  Expected salary: ~${expected_year_4}")
    
    # Print inflation-adjusted career salary percentage
    if year_4_income > 0:
        percentage_increase = (year_4_income / base_salary - 1) * 100
        print(f"  Inflation adjustment: +{percentage_increase:.1f}% over base salary")
        
        # Check if the adjustment is reasonable
        expected_min = int(base_salary * 1.10)  # At least 10% increase
        expected_max = int(base_salary * 1.15)  # At most 15% increase
        
        if expected_min <= year_4_income <= expected_max:
            print(f"\n✅ SUCCESS: Year 4 salary (${year_4_income}) shows proper inflation trending")
            print(f"  Expected range: ${expected_min} to ${expected_max}")
        else:
            print(f"\n❌ FAILURE: Year 4 salary (${year_4_income}) does not match expected range")
            print(f"  Expected range: ${expected_min} to ${expected_max}")
    else:
        print("\n❌ FAILURE: Year 4 income is zero or not found")
    
    # Year 5: Continued growth on new career
    year_5_income = income_yearly.get('5', 0)
    if year_4_income > 0 and year_5_income > 0:
        growth_percentage = (year_5_income / year_4_income - 1) * 100
        print(f"\nYear 5 (Age 30): ${year_5_income}")
        print(f"  Growth from Year 4: +{growth_percentage:.1f}% (expected: ~3%)")
    
    # Check if detailed logs show our inflation calculation
    print("\nChecking logs for detailed inflation calculation...")
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
    
    return result

if __name__ == "__main__":
    result = test_career_salary_trending()
    
    # Save full result to a file for analysis
    with open('salary_trending_result.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    print("\nFull calculation result saved to 'salary_trending_result.json'")