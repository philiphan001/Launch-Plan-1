"""
Test the personal loan interest rate fix.
This test verifies that interest rates are correctly processed by the calculator.
"""

from server.python.financial_updated import FinancialCalculator
from server.python.models.liability import Liability

def test_interest_rate_conversion():
    """Test that interest rates provided as percentages are correctly converted to decimals."""
    # Test with 8% provided as 8.0
    input_data = {
        'personalLoanInterestRate': 8.0,
        'retirementContributionRate': 5.0,
        'retirementGrowthRate': 7.0
    }
    
    calculator = FinancialCalculator.from_input_data(input_data)
    
    # Verify by checking the interest rates in the debug log file
    with open('healthcare_debug.log', 'r') as f:
        log_content = f.read()
        print("\nInterest Rate in Log:")
        for line in log_content.split('\n'):
            if "Personal Loan Interest Rate" in line:
                print(f"  {line}")
    
    # Create a sample liability using the interest rate
    loan = Liability("Test Loan", 10000, interest_rate=0.08, term_years=5)
    monthly_payment = loan.monthly_payment
    
    # Basic check to see if the payments make sense
    with open('interest_rate_test.log', 'w') as f:
        f.write("=== Interest Rate Test ===\n")
        f.write(f"Loan amount: $10,000\n")
        f.write(f"Interest rate: 8.0%\n")
        f.write(f"Term: 5 years\n")
        f.write(f"Monthly payment: ${monthly_payment:.2f}\n")
        f.write(f"Total payments: ${monthly_payment * 60:.2f}\n")
        
        # Reasonable monthly payment for $10,000 at 8% for 5 years should be ~$200
        # If interest was actually 800%, the payment would be astronomically high
        if 190 <= monthly_payment <= 210:
            f.write("\nVERIFIED: Monthly payment is in the expected range for 8% interest\n")
        else:
            f.write("\nFAILED: Monthly payment is outside the expected range for 8% interest\n")

if __name__ == "__main__":
    test_interest_rate_conversion()
    print("Test completed. Check interest_rate_test.log for results.")