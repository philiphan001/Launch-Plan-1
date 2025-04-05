import sys
import json
import os

# Ensure the server/python directory is in the path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'server/python'))

try:
    # Direct imports first
    from server.python.financial_updated import FinancialCalculator
except ImportError:
    # Try relative imports
    from financial_updated import FinancialCalculator

# Create a simple test case
def test_expense_calculation():
    try:
        start_age = 25
        years_to_project = 10
        
        # Create calculator directly for debugging
        calculator = FinancialCalculator(start_age=start_age, years_to_project=years_to_project)
        
        # Import models using the same path pattern as FinancialCalculator
        try:
            # Direct imports
            from server.python.models.income import Income
            from server.python.models.expenditure import Expenditure
            from server.python.models.asset import Asset
        except ImportError:
            # Relative imports
            from models.income import Income
            from models.expenditure import Expenditure
            from models.asset import Asset
            
        # Add income
        income = Income(name="Salary", annual_amount=100000, growth_rate=0.02)
        calculator.add_income(income)
        
        # Add expenses
        calculator.add_expenditure(Expenditure(name="Housing", annual_amount=30000, inflation_rate=0.03))
        calculator.add_expenditure(Expenditure(name="Transportation", annual_amount=15000, inflation_rate=0.03))
        calculator.add_expenditure(Expenditure(name="Food", annual_amount=15000, inflation_rate=0.02))
        calculator.add_expenditure(Expenditure(name="Healthcare", annual_amount=10000, inflation_rate=0.04))
        
        # Add investment asset (for savings)
        try:
            from server.python.models.asset import Investment
        except ImportError:
            from models.asset import Investment
            
        asset = Investment(name="Savings", initial_value=10000, growth_rate=0.03)
        calculator.add_asset(asset)
        
        # Calculate projection
        result = calculator.calculate_projection()
        
        # Extract the expenses array and the individual expense components
        expenses_yearly = result.get('expenses', [])
        housing_expenses = result.get('housing', [])
        transportation_expenses = result.get('transportation', [])
        food_expenses = result.get('food', [])
        healthcare_expenses = result.get('healthcare', [])
        
        # Debug the expenses calculation
        print("=== EXPENSE CALCULATION DEBUG ===")
        print(f"Total expenses yearly: {expenses_yearly}")
        
        # Print each individual expense component for comparison
        print("\nExpense Components by Year:")
        for i in range(len(expenses_yearly)):
            if i >= len(housing_expenses):
                continue  # Skip if index out of range
            
            print(f"\nYear {i}:")
            component_sum = 0
            
            # Add housing expenses
            if i < len(housing_expenses):
                component_sum += housing_expenses[i]
                print(f"  Housing: ${housing_expenses[i]}")
            
            # Add transportation expenses
            if i < len(transportation_expenses):
                component_sum += transportation_expenses[i]
                print(f"  Transportation: ${transportation_expenses[i]}")
            
            # Add food expenses
            if i < len(food_expenses):
                component_sum += food_expenses[i]
                print(f"  Food: ${food_expenses[i]}")
            
            # Add healthcare expenses
            if i < len(healthcare_expenses):
                component_sum += healthcare_expenses[i]
                print(f"  Healthcare: ${healthcare_expenses[i]}")
            
            # We should add other expense components here if needed
            
            # Add any other components from the result
            other_components = ['personalInsurance', 'apparel', 'services', 'entertainment', 
                               'other', 'education', 'childcare', 'debt', 'discretionary',
                               'taxes', 'retirementContribution']
            
            for component in other_components:
                if component in result and i < len(result[component]):
                    value = result[component][i]
                    component_sum += value
                    print(f"  {component}: ${value}")
            
            # Calculate the difference between sum and reported total
            difference = expenses_yearly[i] - component_sum
            print(f"\n  Component Sum: ${component_sum}")
            print(f"  Reported Total: ${expenses_yearly[i]}")
            print(f"  Difference: ${difference}")
            
        # Print complete expenses calculation breakdown
        if 'taxes' in result and 'retirementContribution' in result:
            tax_expenses = result['taxes']
            retirement_contribution = result['retirementContribution']
            
            print("\n=== EXPENSES BREAKDOWN ===")
            for i in range(1, min(len(tax_expenses), len(retirement_contribution), len(expenses_yearly))):
                print(f"\nYear {i}:")
                print(f"  Housing: ${housing_expenses[i]}")
                print(f"  Transportation: ${transportation_expenses[i]}")
                print(f"  Food: ${food_expenses[i]}")
                print(f"  Healthcare: ${healthcare_expenses[i]}")
                print(f"  Taxes: ${tax_expenses[i]}")
                print(f"  Retirement: ${retirement_contribution[i]}")
                print(f"  Total expenses: ${expenses_yearly[i]}")
                print(f"  Component sum: ${housing_expenses[i] + transportation_expenses[i] + food_expenses[i] + healthcare_expenses[i] + tax_expenses[i] + retirement_contribution[i]}")
        
        print("\n=== FULL RESULT KEYS ===")
        print(list(result.keys()))
            
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_expense_calculation()