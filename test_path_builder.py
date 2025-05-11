"""
Test script for verifying the PathBuilder functionality.
This test focuses on using the PathBuilder to create and compare different career paths.
"""

import json
import sys
from pathlib import Path

# Make sure we can import from the server/python directory
server_path = Path("server/python")
sys.path.append(str(server_path.absolute()))

from path_builder import create_path_comparison, EducationType

def test_path_builder():
    """Test the PathBuilder functionality."""
    # Create test input data with growth rates
    input_data = {
        "startAge": 18,
        "yearsToProject": 20,
        "initialSavings": 5000,
        "discountRate": 0.03,
        "taxFilingStatus": "single",
        "incomeGrowthRate": 0.03,
        "costOfLivingGrowthRate": 0.02,
        "educationCostGrowthRate": 0.04,
        "inflationRate": 0.02,
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
    
    # Create path builder
    builder = create_path_comparison(input_data)
    
    # Add immediate work path
    builder.add_immediate_work_path(
        occupation_id="software-engineer-entry",
        start_year=0
    )
    
    # Add 4-year college path
    builder.add_education_path(
        education_type=EducationType.FOUR_YEAR_COLLEGE,
        target_occupation_id="software-engineer",
        start_year=0,
        work_status="part-time",
        part_time_income=15000,
        base_education_cost=25000
    )
    
    # Add 2-year college path
    builder.add_education_path(
        education_type=EducationType.TWO_YEAR_COLLEGE,
        target_occupation_id="software-engineer-entry",
        start_year=0,
        work_status="part-time",
        part_time_income=12000,
        base_education_cost=15000
    )
    
    # Compare paths
    results = builder.compare_paths()
    
    # Print results for analysis
    print("\n=== Path Builder Comparison Results ===")
    
    for path_type, path_results in results.items():
        print(f"\n{path_results['title']}:")
        print(f"Total Income: ${path_results['totalIncome']:,.2f}")
        print(f"Total Expenses: ${path_results['totalExpenses']:,.2f}")
        print(f"Net Worth: ${path_results['netWorth']:,.2f}")
        print(f"Present Value of Earnings: ${path_results['presentValueOfEarnings']:,.2f}")
        
        # Print growth rates if available
        if 'growth_rates' in path_results:
            print("\nGrowth Rates:")
            for rate_type, rate in path_results['growth_rates'].items():
                print(f"{rate_type}: {rate:.1%}")
        
        # Print milestone timeline with future values
        print("\nMilestone Timeline:")
        for milestone in path_results['milestones']:
            year = milestone.get('year', 0)
            age = input_data['startAge'] + year
            income_change = milestone.get('income_change', 0)
            print(f"Year {year} (Age {age}): {milestone['title']}")
            if income_change:
                print(f"  Income: ${income_change:,.2f}")
            if milestone.get('type') == 'education':
                print(f"  Education Cost: ${milestone.get('educationCost', 0):,.2f}")
        
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
    four_year_path = results['education']  # First education path (4-year)
    two_year_path = [p for p in results.values() if p.get('education_type') == '2year_college'][0]
    
    # Immediate work should have higher early income
    assert immediate_work['yearlyBreakdown']['income'][0] > four_year_path['yearlyBreakdown']['income'][0], \
        "Immediate work path should have higher initial income"
    
    # 4-year path should have higher income after graduation than 2-year path
    four_year_grad_year = 4
    two_year_grad_year = 2
    assert four_year_path['yearlyBreakdown']['income'][four_year_grad_year] > \
           two_year_path['yearlyBreakdown']['income'][two_year_grad_year], \
        "4-year path should have higher income after graduation than 2-year path"
    
    # Verify future value calculations
    # Part-time income should grow each year during education
    four_year_part_time_incomes = [
        m['income_change'] for m in four_year_path['milestones']
        if m['type'] == 'job' and 'Part-time Work' in m['title']
    ]
    assert all(four_year_part_time_incomes[i] < four_year_part_time_incomes[i+1]
              for i in range(len(four_year_part_time_incomes)-1)), \
        "Part-time income should grow each year during education"
    
    # Education costs should be higher in later years
    four_year_education_cost = four_year_path['milestones'][0]['educationCost']
    two_year_education_cost = two_year_path['milestones'][0]['educationCost']
    assert four_year_education_cost > two_year_education_cost, \
        "4-year education should cost more than 2-year education"
    
    # Verify milestone structure
    assert len(immediate_work['milestones']) == 1, \
        "Immediate work path should have one milestone"
    assert len(four_year_path['milestones']) > len(two_year_path['milestones']), \
        "4-year path should have more milestones than 2-year path"
    
    print("\nAll assertions passed!")
    return True

if __name__ == "__main__":
    test_path_builder() 