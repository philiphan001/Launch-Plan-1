import sys
import os
import json

# Add the server/python directory to the Python path
sys.path.append(os.path.join(os.getcwd(), 'server', 'python'))

try:
    from server.python.financial_updated import FinancialCalculator
    from server.python.models.asset import Investment
    from server.python.models.income import Income
    
    # Create a basic financial calculation to check for errors with custom emergency fund and loan settings
    calculator = FinancialCalculator(
        start_age=27,
        years_to_project=10,
        emergency_fund_months=6,  # Set to 6 months (higher than default)
        personal_loan_term_years=5,  # Set to 5 years
        personal_loan_interest_rate=0.07  # Set to 7%
    )
    
    # Add assets, incomes, and other components - much lower income to ensure negative cash flow
    savings_asset = Investment(name="Savings", initial_value=10000, growth_rate=0.03)
    calculator.add_asset(savings_asset)
    # ULTRA low income - practically nothing
    calculator.add_income(Income(name="Salary", annual_amount=100, growth_rate=0.02))
    
    # Add a large expense to create a negative cash flow situation
    from server.python.models.expenditure import Expenditure, Housing, Transportation, Living
    
    # Create enough expenses to generate negative cash flow
    calculator.add_expenditure(Housing(name="Housing", annual_amount=30000, inflation_rate=0.03))
    calculator.add_expenditure(Transportation(name="Transportation", annual_amount=15000, inflation_rate=0.03))
    calculator.add_expenditure(Living(name="Food", annual_amount=15000, inflation_rate=0.02))
    calculator.add_expenditure(Living(name="Healthcare", annual_amount=10000, inflation_rate=0.04))
    calculator.add_expenditure(Living(name="Personal Insurance", annual_amount=5000, inflation_rate=0.02))
    calculator.add_expenditure(Living(name="Apparel", annual_amount=3000, inflation_rate=0.02))
    calculator.add_expenditure(Living(name="Services", annual_amount=7000, inflation_rate=0.02))
    calculator.add_expenditure(Living(name="Entertainment", annual_amount=8000, inflation_rate=0.02))
    calculator.add_expenditure(Living(name="Other", annual_amount=5000, inflation_rate=0.02))
    
    # Add education expenses
    calculator.add_expenditure(Living(name="Education", annual_amount=4000, inflation_rate=0.04))
    
    # Debug the savings asset initial state
    print("Initial savings asset state:")
    print(f"  Name: {savings_asset.name}")
    print(f"  Initial value: {savings_asset.initial_value}")
    print(f"  Growth rate: {savings_asset.growth_rate}")
    print(f"  Value history: {savings_asset.value_history}")
    print(f"  Contributions: {savings_asset.contributions}")
    
    # Run the calculation
    result = calculator.calculate_projection()
    print("\nFinancial calculation completed successfully")
    print(f"Result keys: {list(result.keys())}")
    
    # Check for net worth and cash flow values
    if 'netWorth' in result:
        print(f"Net worth yearly: {result['netWorth']}")
    else:
        print("Net worth not found in result")
        
    if 'cashFlow' in result:
        print(f"Cash flow yearly: {result['cashFlow']}")
    else:
        print("Cash flow not found in result")
        
    # Check for assets breakdown
    if 'savingsValue' in result:
        print(f"Savings value: {result['savingsValue']}")
    else:
        print("Savings value not found in result")
    
    # Debug the savings asset final state after calculations
    print("\nFinal savings asset state:")
    print(f"  Value history: {savings_asset.value_history}")
    print(f"  Contributions: {savings_asset.contributions}")
    
    # Check values directly from the asset object
    print("\nDirectly checking savings values:")
    for year in range(11):  # 0 to 10 years
        print(f"  Year {year}: ${savings_asset.get_value(year)}")
    
    # Test cash flow contributions
    print("\nTesting cash flow contributions:")
    test_year = 3
    old_value = savings_asset.get_value(test_year)
    cash_flow = result['cashFlow'][test_year]
    print(f"  Before: Year {test_year} value = ${old_value}")
    print(f"  Adding cash flow of ${cash_flow}")
    # Manually add contribution
    savings_asset.add_contribution(cash_flow, test_year)
    new_value = savings_asset.get_value(test_year)
    print(f"  After: Year {test_year} value = ${new_value}")
    print(f"  Difference: ${new_value - old_value}")
    print(f"  Cash flow: ${cash_flow}")
    
    # Look at the healthcare_debug.log file
    print("\nContents of healthcare_debug.log:")
    try:
        with open('healthcare_debug.log', 'r') as f:
            log_content = f.read()
            # Show only last 20 lines to avoid overwhelming output
            log_lines = log_content.splitlines()
            if len(log_lines) > 20:
                print(f"  ...showing last 20 of {len(log_lines)} lines...")
                print('\n  '.join(log_lines[-20:]))
            else:
                print(f"  {log_content}")
    except Exception as e:
        print(f"  Could not read log file: {e}")
    
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
    sys.exit(1)