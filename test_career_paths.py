"""
Test script for verifying career path comparison functionality.
This test focuses on comparing different career paths (immediate work vs education)
and their financial implications.
"""

import json
import sys
from pathlib import Path

# Make sure we can import from the server/python directory
server_path = Path("server/python")
sys.path.append(str(server_path.absolute()))

from financial_updated import FinancialCalculator

def test_career_path_comparison():
    """Test comparison of different career paths."""
    # Create test input data
    input_data = {
        "startAge": 18,
        "yearsToProject": 20,
        "initialSavings": 5000,
        "discountRate": 0.03,
        "taxFilingStatus": "single",
        "careersData": [
            {
                "id": "software-engineer",
                "title": "Software Engineer",
                "salary": 80000,
                "salaryMedian": 80000,
                "education": "bachelors"
            },
            {
                "id": "software-engineer-entry",
                "title": "Junior Software Developer",
                "salary": 45000,
                "salaryMedian": 45000,
                "education": "none"
            }
        ]
    }
    
    # Create calculator instance
    calculator = FinancialCalculator.from_input_data(input_data)
    
    # Define paths to compare
    paths = [
        {
            "type": "immediate_work",
            "startYear": 0,
            "workStatus": "full-time",
            "initialIncome": 45000,  # Starting as junior developer
            "targetOccupation": "software-engineer-entry"
        },
        {
            "type": "education",
            "startYear": 0,
            "duration": 4,
            "educationType": "4year_college",
            "workStatus": "part-time",
            "partTimeIncome": 15000,
            "educationCost": 25000,
            "targetOccupation": "software-engineer"
        }
    ]
    
    # Run comparison
    results = calculator.compare_career_paths(paths)
    
    # Print results for analysis
    print("\n=== Career Path Comparison Results ===")
    
    for path_type, path_results in results.items():
        print(f"\n{path_type.upper()} PATH:")
        print(f"Total Income: ${path_results['totalIncome']:,.2f}")
        print(f"Total Expenses: ${path_results['totalExpenses']:,.2f}")
        print(f"Net Worth: ${path_results['netWorth']:,.2f}")
        print(f"Present Value of Earnings: ${path_results['presentValueOfEarnings']:,.2f}")
        
        # Print yearly breakdown for first few years
        yearly = path_results['yearlyBreakdown']
        print("\nFirst 5 Years Breakdown:")
        for year in range(5):
            age = input_data['startAge'] + year
            income = yearly.get('income', [])[year] if year < len(yearly.get('income', [])) else 0
            expenses = yearly.get('expenses', [])[year] if year < len(yearly.get('expenses', [])) else 0
            print(f"Year {year} (Age {age}): Income=${income:,.2f}, Expenses=${expenses:,.2f}")
    
    # Verify key aspects
    immediate_work = results['immediate_work']
    education_path = results['education']
    
    # Immediate work should have higher early income
    assert immediate_work['yearlyBreakdown']['income'][0] > education_path['yearlyBreakdown']['income'][0], \
        "Immediate work path should have higher initial income"
    
    # Education path should have higher income after graduation
    graduation_year = 4  # 4 years of college
    assert education_path['yearlyBreakdown']['income'][graduation_year] > \
           immediate_work['yearlyBreakdown']['income'][graduation_year], \
        "Education path should have higher income after graduation"
    
    # Education path should have higher expenses during education years
    education_expenses = sum(education_path['yearlyBreakdown']['expenses'][:graduation_year])
    work_expenses = sum(immediate_work['yearlyBreakdown']['expenses'][:graduation_year])
    assert education_expenses > work_expenses, \
        "Education path should have higher expenses during education years"
    
    print("\nAll assertions passed!")
    return True

if __name__ == "__main__":
    test_career_path_comparison() 