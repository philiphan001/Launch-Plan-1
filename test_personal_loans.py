"""
Test the personal loan creation algorithm with different scenarios.
"""
import sys
import json
import os
from server.python.financial_updated import FinancialCalculator

# Clear the log file before starting
with open('personal_loans_test.log', 'w') as f:
    f.write("Starting personal loan test\n")

def create_basic_test_input(initial_savings=10000):
    """Create a basic test input with specified initial savings."""
    return {
        "startAge": 25,
        "yearsToProject": 10,
        "emergencyFundAmount": 10000,
        "personalLoanTermYears": 5,
        "personalLoanInterestRate": 0.08,
        "retirementContributionRate": 0.05,
        "retirementGrowthRate": 0.07,
        "assets": [
            {
                "name": "Savings",
                "type": "investment",
                "initialValue": initial_savings,
                "growthRate": 0.02
            }
        ],
        "liabilities": [],
        "incomes": [
            {
                "name": "Regular Job",
                "type": "salary",
                "annualAmount": 40000,
                "growthRate": 0.03
            }
        ],
        "expenditures": [
            {
                "name": "Housing and Utilities",
                "type": "fixed",
                "annualAmount": 10000
            },
            {
                "name": "Food and Dining",
                "type": "fixed",
                "annualAmount": 5000
            },
            {
                "name": "Transportation",
                "type": "fixed",
                "annualAmount": 4000
            },
            {
                "name": "Healthcare",
                "type": "fixed",
                "annualAmount": 3000
            },
            {
                "name": "Discretionary",
                "type": "fixed",
                "annualAmount": 3000
            }
        ]
    }

def test_balanced_budget():
    """Test with a balanced budget - no loans should be created."""
    print("\n===== Testing Balanced Budget =====")
    data = create_basic_test_input(initial_savings=10000)
    # Income 40k, expenses 25k (balanced with room to spare)
    calculator = FinancialCalculator.from_input_data(data)
    results = calculator.calculate_projection()
    print(f"Starting savings: ${data['assets'][0]['initialValue']}")
    print(f"Income: ${data['incomes'][0]['annualAmount']}, Total expenses: $25,000")
    print(f"First year personal loans: ${results['personalLoans'][0]}")
    print(f"Last year personal loans: ${results['personalLoans'][-1]}")
    return results

def test_negative_cash_flow():
    """Test with expenses exceeding income - should create a cash flow loan."""
    print("\n===== Testing Negative Cash Flow =====")
    data = create_basic_test_input(initial_savings=10000)
    # Increase expenses to create negative cash flow
    data["expenditures"][0]["annualAmount"] = 30000  # Housing
    
    # Add debug log
    with open('personal_loans_test.log', 'a') as f:
        f.write("\n\n==== STARTING NEGATIVE CASH FLOW TEST ====\n")
        f.write(f"Initial savings: ${data['assets'][0]['initialValue']}\n")
        f.write(f"Income: ${data['incomes'][0]['annualAmount']}\n")
        f.write(f"Housing expense increased to: ${data['expenditures'][0]['annualAmount']}\n")
        f.write(f"Total expenses should be around: $45,000\n")
        f.write(f"Emergency fund threshold: ${data['emergencyFundAmount']}\n")
        f.write(f"Loan term years: {data['personalLoanTermYears']}\n")
        f.write(f"Loan interest rate: {data['personalLoanInterestRate']}\n\n")
        f.write(f"Expected behavior: Strong negative cash flow should create loans to cover the deficit.\n")
        f.write(f"Savings should remain at or above the emergency fund threshold.\n")
    
    # Enable very detailed debug mode for this test
    os.environ['FINANCIAL_DEBUG'] = 'TRACE'
    
    calculator = FinancialCalculator.from_input_data(data)
    results = calculator.calculate_projection()
    
    # Log detailed results
    with open('personal_loans_test.log', 'a') as f:
        f.write("\n==== NEGATIVE CASH FLOW TEST RESULTS ====\n")
        f.write(f"Personal loans by year:\n")
        for i, loan in enumerate(results['personalLoans']):
            f.write(f"Year {i}: ${loan}\n")
        f.write(f"\nCash flow by year:\n")
        for i, cf in enumerate(results['cashFlow']):
            f.write(f"Year {i}: ${cf}\n")
        f.write(f"\nSavings by year:\n")
        for i, savings in enumerate(results['savingsValue']):
            f.write(f"Year {i}: ${savings}\n")
        f.write(f"\nIncome by year:\n")
        for i, income in enumerate(results['income']):
            f.write(f"Year {i}: ${income}\n")
        f.write(f"\nExpenses by year:\n")
        for i, expense in enumerate(results['expenses']):
            f.write(f"Year {i}: ${expense}\n")
        
        # Income vs Expenses calculation
        f.write(f"\nIncome - Expenses comparison:\n")
        for i in range(len(results['income'])):
            income = results['income'][i] if i < len(results['income']) else 0
            expense = results['expenses'][i] if i < len(results['expenses']) else 0
            cf = income - expense
            actual_cf = results['cashFlow'][i] if i < len(results['cashFlow']) else 0
            taxes = results.get('taxesYearly', [0] * len(results['income']))[i] if i < len(results.get('taxesYearly', [])) else 0
            retirement = results.get('retirementContributionsYearly', [0] * len(results['income']))[i] if i < len(results.get('retirementContributionsYearly', [])) else 0
            
            f.write(f"Year {i}: Income ${income} - Expenses ${expense} = ${cf}, Actual CF: ${actual_cf}\n")
            f.write(f"    Taxes: ${taxes}, Retirement: ${retirement}\n")
        
        # Emergency fund verification
        f.write(f"\nEmergency Fund Verification:\n")
        emergency_threshold = data['emergencyFundAmount']
        for i, savings in enumerate(results['savingsValue']):
            status = "BELOW THRESHOLD" if savings < emergency_threshold else "OK"
            diff = savings - emergency_threshold
            f.write(f"Year {i}: Savings ${savings} vs Threshold ${emergency_threshold} | Diff: ${diff:.2f} | Status: {status}\n")
            
        # Personal loan creation analysis
        f.write(f"\nPersonal Loan Creation Analysis:\n")
        total_personal_loans = 0
        for i, loan in enumerate(results['personalLoans']):
            prev_total = total_personal_loans
            new_loan = loan - prev_total if i > 0 else loan
            total_personal_loans = loan
            
            savings = results['savingsValue'][i]
            income = results['income'][i] if i < len(results['income']) else 0
            expense = results['expenses'][i] if i < len(results['expenses']) else 0
            
            f.write(f"Year {i}: ${new_loan} new loan, ${loan} total loans | ")
            f.write(f"Income: ${income}, Expenses: ${expense}, ")
            f.write(f"CF: ${income - expense}, Savings: ${savings}\n")
        
        # Show yearly breakdown of expense components if available
        if 'housing' in results and 'food' in results:
            f.write(f"\nDetailed expense breakdown by category:\n")
            for i in range(len(results['expenses'])):
                f.write(f"Year {i} expenses (${results['expenses'][i]}):\n")
                f.write(f"  Housing: ${results['housing'][i] if i < len(results['housing']) else 'N/A'}\n")
                f.write(f"  Food: ${results['food'][i] if i < len(results['food']) else 'N/A'}\n")
                f.write(f"  Transportation: ${results['transportation'][i] if i < len(results['transportation']) else 'N/A'}\n")
                f.write(f"  Healthcare: ${results['healthcare'][i] if i < len(results['healthcare']) else 'N/A'}\n")
                f.write(f"  Debt payments: ${results['debt'][i] if i < len(results['debt']) else 'N/A'}\n")
                f.write(f"  Taxes: ${results['taxes'][i] if i < len(results['taxes']) else 'N/A'}\n")
    
    print(f"Starting savings: ${data['assets'][0]['initialValue']}")
    print(f"Income: ${data['incomes'][0]['annualAmount']}, Total expenses: $45,000")
    print(f"First year personal loans: ${results['personalLoans'][0]}")
    print(f"Last year personal loans: ${results['personalLoans'][-1]}")
    return results

def test_emergency_fund_depletion():
    """Test with positive cash flow but savings falling below threshold."""
    print("\n===== Testing Emergency Fund Depletion =====")
    data = create_basic_test_input(initial_savings=10500)
    
    # Create more challenging scenario with true emergency fund depletion
    # Increase expenses to create a stronger negative cash flow
    data["expenditures"][0]["annualAmount"] = 20000  # Housing (significant increase)
    data["expenditures"][1]["annualAmount"] = 8000   # Food (moderate increase)
    
    # One-time expense in year 2 that will deplete savings further
    data["oneTimeExpenses"] = [{
        "name": "Medical Emergency",
        "amount": 8000,
        "year": 2
    }]
    
    # Add debug log
    with open('personal_loans_test.log', 'a') as f:
        f.write("\n\n==== STARTING EMERGENCY FUND DEPLETION TEST ====\n")
        f.write(f"Initial savings: ${data['assets'][0]['initialValue']}\n")
        f.write(f"Income: ${data['incomes'][0]['annualAmount']}\n")
        f.write(f"Housing expense SIGNIFICANTLY increased to: ${data['expenditures'][0]['annualAmount']}\n")
        f.write(f"Food expense increased to: ${data['expenditures'][1]['annualAmount']}\n")
        f.write(f"Added one-time medical expense of $8000 in year 2\n")
        f.write(f"Emergency fund threshold: ${data['emergencyFundAmount']}\n")
        f.write(f"Total recurring expenses: ~$38,000 (negative cash flow scenario)\n\n")
        f.write(f"Expected behavior: Significant negative cash flow should rapidly deplete savings\n")
        f.write(f"and trigger both cash flow loans AND emergency protection loans.\n")
    
    # Set debug mode for this test
    os.environ['FINANCIAL_DEBUG'] = 'TRACE'
    
    calculator = FinancialCalculator.from_input_data(data)
    results = calculator.calculate_projection()
    
    # Log detailed results
    with open('personal_loans_test.log', 'a') as f:
        f.write("\n==== EMERGENCY FUND DEPLETION TEST RESULTS ====\n")
        f.write(f"Personal loans by year:\n")
        for i, loan in enumerate(results['personalLoans']):
            f.write(f"Year {i}: ${loan}\n")
        f.write(f"\nCash flow by year:\n")
        for i, cf in enumerate(results['cashFlow']):
            f.write(f"Year {i}: ${cf}\n")
        f.write(f"\nSavings by year:\n")
        for i, savings in enumerate(results['savingsValue']):
            f.write(f"Year {i}: ${savings}\n")
        f.write(f"\nIncome by year:\n")
        for i, income in enumerate(results['income']):
            f.write(f"Year {i}: ${income}\n")
        f.write(f"\nExpenses by year:\n")
        for i, expense in enumerate(results['expenses']):
            f.write(f"Year {i}: ${expense}\n")
        
        # Income vs Expenses calculation
        f.write(f"\nIncome - Expenses comparison:\n")
        for i in range(len(results['income'])):
            income = results['income'][i] if i < len(results['income']) else 0
            expense = results['expenses'][i] if i < len(results['expenses']) else 0
            cf = income - expense
            actual_cf = results['cashFlow'][i] if i < len(results['cashFlow']) else 0
            taxes = results.get('taxesYearly', [0] * len(results['income']))[i] if i < len(results.get('taxesYearly', [])) else 0
            retirement = results.get('retirementContributionsYearly', [0] * len(results['income']))[i] if i < len(results.get('retirementContributionsYearly', [])) else 0
            
            f.write(f"Year {i}: Income ${income} - Expenses ${expense} = ${cf}, Actual CF: ${actual_cf}\n")
            f.write(f"    Taxes: ${taxes}, Retirement: ${retirement}\n")
        
        # Emergency fund verification
        f.write(f"\nEmergency Fund Verification:\n")
        emergency_threshold = data['emergencyFundAmount']
        for i, savings in enumerate(results['savingsValue']):
            status = "BELOW THRESHOLD" if savings < emergency_threshold else "OK"
            diff = savings - emergency_threshold
            f.write(f"Year {i}: Savings ${savings} vs Threshold ${emergency_threshold} | Diff: ${diff:.2f} | Status: {status}\n")
            
        # Personal loan creation analysis
        f.write(f"\nPersonal Loan Creation Analysis:\n")
        total_personal_loans = 0
        for i, loan in enumerate(results['personalLoans']):
            prev_total = total_personal_loans
            new_loan = loan - prev_total if i > 0 else loan
            total_personal_loans = loan
            
            savings = results['savingsValue'][i]
            income = results['income'][i] if i < len(results['income']) else 0
            expense = results['expenses'][i] if i < len(results['expenses']) else 0
            
            f.write(f"Year {i}: ${new_loan} new loan, ${loan} total loans | ")
            f.write(f"Income: ${income}, Expenses: ${expense}, ")
            f.write(f"CF: ${income - expense}, Savings: ${savings}\n")
    
    print(f"Starting savings: ${data['assets'][0]['initialValue']}")
    print(f"Income: ${data['incomes'][0]['annualAmount']}, Total expenses: ~$38,000")
    print(f"First year personal loans: ${results['personalLoans'][0]}")
    print(f"Last year personal loans: ${results['personalLoans'][-1]}")
    return results

def test_exact_threshold():
    """Test with exactly the emergency fund threshold in savings."""
    print("\n===== Testing Exact Threshold =====")
    data = create_basic_test_input(initial_savings=10000)
    # Balanced budget but starting at exactly threshold
    calculator = FinancialCalculator.from_input_data(data)
    results = calculator.calculate_projection()
    print(f"Starting savings: ${data['assets'][0]['initialValue']}")
    print(f"Income: ${data['incomes'][0]['annualAmount']}, Total expenses: $25,000")
    print(f"First year personal loans: ${results['personalLoans'][0]}")
    print(f"Last year personal loans: ${results['personalLoans'][-1]}")
    return results

if __name__ == "__main__":
    print("Testing personal loan creation algorithm...")
    
    balanced = test_balanced_budget()
    negative = test_negative_cash_flow()
    emergency = test_emergency_fund_depletion()
    threshold = test_exact_threshold()
    
    print("\n===== Summary =====")
    print("Balanced Budget Test - Final Year Loans: $" + str(balanced['personalLoans'][-1]))
    print("Negative Cash Flow Test - Final Year Loans: $" + str(negative['personalLoans'][-1]))
    print("Emergency Fund Test - Final Year Loans: $" + str(emergency['personalLoans'][-1]))
    print("Exact Threshold Test - Final Year Loans: $" + str(threshold['personalLoans'][-1]))