import sys
import os
import json

# Add the server/python directory to the Python path
sys.path.append(os.path.join(os.getcwd(), 'server', 'python'))

try:
    from server.python.financial_updated import FinancialCalculator
    from server.python.models.asset import Investment
    from server.python.models.income import Income
    
    # Create a basic financial calculation to check for errors
    calculator = FinancialCalculator(
        start_age=27,
        years_to_project=10
    )
    
    # Add assets, incomes, and other components
    savings_asset = Investment(name="Savings", initial_value=10000, growth_rate=0.03)
    calculator.add_asset(savings_asset)
    calculator.add_income(Income(name="Salary", annual_amount=50000, growth_rate=0.03))
    
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