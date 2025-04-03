#!/usr/bin/env python3
"""
Financial calculator script for the FinancialFuture application.
This is the main script that is called by the API to generate financial projections.
"""

import json
import sys
import os
from typing import Dict, Any, List, Optional

# Set the current directory to our path so we can use relative imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(os.path.dirname(current_dir)))

try:
    # First try direct imports (these will work when executed directly)
    from financial import FinancialCalculator
    from models.asset import Asset, DepreciableAsset, Investment
    from models.liability import Liability, Mortgage, StudentLoan, AutoLoan
    from models.income import Income, SalaryIncome, SpouseIncome
    from models.expenditure import Expenditure, Housing, Transportation, Living, Tax
    from data_loader import DataLoader
except ImportError:
    # Fallback to full imports (these will work when executed from parent directory)
    from server.python.financial import FinancialCalculator
    from server.python.models.asset import Asset, DepreciableAsset, Investment
    from server.python.models.liability import Liability, Mortgage, StudentLoan, AutoLoan
    from server.python.models.income import Income, SalaryIncome, SpouseIncome
    from server.python.models.expenditure import Expenditure, Housing, Transportation, Living, Tax
    from server.python.data_loader import DataLoader


def create_baseline_projection(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a baseline financial projection from input data.
    
    Args:
        input_data: Dictionary containing financial input parameters
        
    Returns:
        Dictionary with projection results
    """
    calculator = FinancialCalculator.from_input_data(input_data)
    result = calculator.calculate_projection()
    return result


def create_education_projection(input_data: Dict[str, Any], college_id: str, occupation_id: str) -> Dict[str, Any]:
    """
    Create a financial projection for an education path with a specific college and career.
    
    Args:
        input_data: Dictionary containing baseline financial input parameters
        college_id: ID of selected college
        occupation_id: ID of selected occupation
    
    Returns:
        Dictionary with education path projection results
    """
    # Load college and occupation data
    data_loader = DataLoader()
    college_data = data_loader.get_college_by_id(college_id)
    occupation_data = data_loader.get_occupation_by_id(occupation_id)
    
    if not college_data or not occupation_data:
        return {"error": "College or occupation not found"}
    
    # Create calculator with baseline data
    calculator = FinancialCalculator.from_input_data(input_data)
    
    # Set start age and projection years
    calculator.set_start_age(input_data.get("startAge", 18))
    calculator.set_projection_years(input_data.get("yearsToProject", 15))
    
    # Add college expenses and student loans
    annual_cost = college_data.get("tuition", 0) + college_data.get("roomAndBoard", 0)
    college_duration = 4  # Assume 4-year program
    loan_interest_rate = 0.05  # Example interest rate
    loan_term_years = 10  # Standard loan term
    
    # Determine how much will be paid by student loans vs. out of pocket
    loan_percentage = 0.7  # 70% covered by loans
    total_loan_amount = annual_cost * college_duration * loan_percentage
    
    # Add student loan
    student_loan = StudentLoan(
        name="Student Loan",
        initial_balance=total_loan_amount,
        interest_rate=loan_interest_rate,
        term_years=loan_term_years,
        deferment_years=college_duration,
        subsidized=False
    )
    calculator.add_liability(student_loan)
    
    # Add college expenses as expenditure
    college_expense = Expenditure(
        name="College Expenses",
        annual_amount=annual_cost * (1 - loan_percentage),  # Out of pocket portion
        inflation_rate=0.04  # College costs often rise faster than general inflation
    )
    calculator.add_expenditure(college_expense)
    
    # Add part-time job during college
    part_time_income = Income(
        name="Part-time Job",
        annual_amount=12000,  # $1000/month
        growth_rate=0.02,
        start_year=0,
        end_year=college_duration - 1
    )
    calculator.add_income(part_time_income)
    
    # Add career income after college
    starting_salary = occupation_data.get("salary", 50000)
    career_income = SalaryIncome(
        name=occupation_data.get("title", "Career"),
        annual_amount=starting_salary,
        growth_rate=0.04,  # Higher growth for career start
        start_year=college_duration,
        bonus_percent=0.05
    )
    calculator.add_income(career_income)
    
    # Add basic living expenses
    living_expense = Living(
        name="Living Expenses",
        annual_amount=15000,  # During college
        inflation_rate=0.02,
        lifestyle_factor=1.1  # Modest lifestyle inflation
    )
    calculator.add_expenditure(living_expense)
    
    # Add milestones
    calculator.add_milestone({
        "type": "education",
        "subtype": "college",
        "title": f"Graduate from {college_data.get('name', 'College')}",
        "year": college_duration,
        "description": "College graduation"
    })
    
    calculator.add_milestone({
        "type": "job",
        "title": f"Start career as {occupation_data.get('title', 'Professional')}",
        "year": college_duration,
        "income_change": starting_salary,
        "description": "Begin professional career"
    })
    
    # Calculate projection
    result = calculator.calculate_projection()
    
    # Add education-specific information to results
    result["educationPath"] = {
        "college": college_data,
        "occupation": occupation_data,
        "totalCollegeCost": annual_cost * college_duration,
        "studentLoanAmount": total_loan_amount,
        "graduationYear": college_duration,
        "estimatedStartingSalary": starting_salary
    }
    
    return result


def create_job_projection(input_data: Dict[str, Any], occupation_id: str) -> Dict[str, Any]:
    """
    Create a financial projection for immediately entering the workforce.
    
    Args:
        input_data: Dictionary containing baseline financial input parameters
        occupation_id: ID of selected occupation
    
    Returns:
        Dictionary with job path projection results
    """
    # Load occupation data
    data_loader = DataLoader()
    occupation_data = data_loader.get_occupation_by_id(occupation_id)
    
    if not occupation_data:
        return {"error": "Occupation not found"}
    
    # Create calculator with baseline data
    calculator = FinancialCalculator.from_input_data(input_data)
    
    # Set start age and projection years
    calculator.set_start_age(input_data.get("startAge", 18))
    calculator.set_projection_years(input_data.get("yearsToProject", 15))
    
    # Add entry-level job income (typically lower without degree)
    starting_salary = occupation_data.get("salary", 35000) * 0.7  # 70% of standard salary
    job_income = SalaryIncome(
        name=f"Entry-level {occupation_data.get('title', 'Job')}",
        annual_amount=starting_salary,
        growth_rate=0.02,  # Slower growth without degree
        start_year=0
    )
    calculator.add_income(job_income)
    
    # Add basic living expenses
    living_expense = Living(
        name="Living Expenses",
        annual_amount=15000,
        inflation_rate=0.02,
        lifestyle_factor=1.05  # Lower lifestyle factor
    )
    calculator.add_expenditure(living_expense)
    
    # Add car loan for transportation
    car_loan = AutoLoan(
        name="Car Loan",
        initial_balance=15000,
        interest_rate=0.06,
        term_years=5
    )
    calculator.add_liability(car_loan)
    
    # Add milestones
    calculator.add_milestone({
        "type": "job",
        "title": f"Start job as {occupation_data.get('title', 'Entry-level worker')}",
        "year": 0,
        "income_change": starting_salary,
        "description": "Begin working career"
    })
    
    calculator.add_milestone({
        "type": "job",
        "title": "Career advancement",
        "year": 5,
        "income_change": starting_salary * 0.2,  # 20% raise at year 5
        "description": "Career progression"
    })
    
    # Calculate projection
    result = calculator.calculate_projection()
    
    # Add job-specific information to results
    result["jobPath"] = {
        "occupation": occupation_data,
        "startingSalary": starting_salary,
        "projection5Year": starting_salary * (1.02 ** 5),  # 5-year salary projection
        "projection10Year": starting_salary * (1.02 ** 10)  # 10-year salary projection
    }
    
    return result


def create_military_projection(input_data: Dict[str, Any], branch: str, occupation_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a financial projection for military service.
    
    Args:
        input_data: Dictionary containing baseline financial input parameters
        branch: Military branch (e.g., "army", "navy")
        occupation_id: Optional ID of selected post-military occupation
    
    Returns:
        Dictionary with military path projection results
    """
    # Load occupation data if provided
    data_loader = DataLoader()
    occupation_data = None
    if occupation_id:
        occupation_data = data_loader.get_occupation_by_id(occupation_id)
    
    # Create calculator with baseline data
    calculator = FinancialCalculator.from_input_data(input_data)
    
    # Set start age and projection years
    calculator.set_start_age(input_data.get("startAge", 18))
    calculator.set_projection_years(input_data.get("yearsToProject", 15))
    
    # Military service details
    service_years = 4  # Standard enlistment
    military_pay_scale = {
        "army": 28000,
        "navy": 28000,
        "airforce": 28500,
        "marines": 27500,
        "coastguard": 29000,
        "spaceguard": 30000
    }
    
    # Base pay for selected branch (default to army if branch not found)
    base_pay = military_pay_scale.get(branch.lower(), 28000)
    
    # Add military income
    military_income = Income(
        name=f"{branch.capitalize()} Service",
        annual_amount=base_pay,
        growth_rate=0.025,  # Military pay growth
        start_year=0,
        end_year=service_years - 1
    )
    calculator.add_income(military_income)
    
    # Add GI Bill education benefit
    gi_bill_benefit = 25000  # Approximate annual value
    
    # Add post-military income (either civilian job or using GI Bill for education)
    post_military_start = service_years
    post_mil_salary = 55000  # Default post-military salary
    
    if occupation_data:
        # Transition to civilian career
        post_mil_salary = occupation_data.get("salary", 50000)
        
        # Military experience often leads to higher starting salaries
        post_mil_salary *= 1.1  # 10% premium for military experience
        
        career_income = SalaryIncome(
            name=occupation_data.get("title", "Civilian Career"),
            annual_amount=post_mil_salary,
            growth_rate=0.035,
            start_year=post_military_start
        )
        calculator.add_income(career_income)
    else:
        # Generic post-military career
        career_income = SalaryIncome(
            name="Post-Military Career",
            annual_amount=post_mil_salary,  # Using default salary
            growth_rate=0.03,
            start_year=post_military_start
        )
        calculator.add_income(career_income)
    
    # Minimal living expenses during service (most expenses covered)
    military_living = Living(
        name="Living Expenses (Military)",
        annual_amount=8000,  # Lower during service
        inflation_rate=0.02,
        lifestyle_factor=1.0
    )
    calculator.add_expenditure(military_living)
    
    # Post-military living expenses
    civilian_living = Living(
        name="Living Expenses (Civilian)",
        annual_amount=18000,  # Higher after service
        inflation_rate=0.02,
        lifestyle_factor=1.1
    )
    civilian_living.expense_history = {i: 0.0 for i in range(service_years)}
    for i in range(service_years, calculator.years_to_project + 1):
        civilian_living.expense_history[i] = float(18000 * (1.02 ** (i - service_years)))
    calculator.add_expenditure(civilian_living)
    
    # Add VA loan for home purchase after service
    va_loan = Mortgage(
        name="VA Home Loan",
        initial_balance=0,  # No loan initially
        interest_rate=0.035,  # Lower rate for VA loans
        term_years=30
    )
    calculator.add_liability(va_loan)
    
    # Add milestones
    calculator.add_milestone({
        "type": "military",
        "title": f"Join {branch.capitalize()}",
        "year": 0,
        "description": "Begin military service"
    })
    
    calculator.add_milestone({
        "type": "military",
        "title": f"Complete {branch.capitalize()} service",
        "year": service_years,
        "description": "Transition to civilian life"
    })
    
    # Post-service career milestone
    if occupation_data:
        calculator.add_milestone({
            "type": "job",
            "title": f"Start career as {occupation_data.get('title', 'Professional')}",
            "year": post_military_start,
            "income_change": post_mil_salary,
            "description": "Begin civilian career"
        })
    
    # VA home loan milestone
    calculator.add_milestone({
        "type": "housing",
        "subtype": "purchase",
        "title": "Purchase home with VA loan",
        "year": service_years + 2,
        "value": 250000,
        "down_payment": 12500,
        "description": "Home purchase using VA loan benefits"
    })
    
    # Calculate projection
    result = calculator.calculate_projection()
    
    # Add military-specific information to results
    result["militaryPath"] = {
        "branch": branch.capitalize(),
        "serviceYears": service_years,
        "basePay": base_pay,
        "giBillBenefit": gi_bill_benefit,
        "vaLoanEligible": True,
        "postServiceOccupation": occupation_data if occupation_data else {"title": "Civilian Career", "salary": 55000}
    }
    
    return result


def main() -> None:
    """
    Main function to process input from stdin and output results.
    """
    try:
        # Read input data from stdin
        input_data_str = sys.stdin.read()
        
        if not input_data_str:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
        
        # Parse JSON input
        try:
            input_data = json.loads(input_data_str)
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
            sys.exit(1)
        
        path_type = input_data.get("pathType", "baseline")
        
        if path_type == "education":
            college_id = input_data.get("collegeId")
            occupation_id = input_data.get("occupationId")
            if not college_id or not occupation_id:
                result = {"error": "College ID and occupation ID required for education path"}
            else:
                result = create_education_projection(input_data, college_id, occupation_id)
        
        elif path_type == "job":
            occupation_id = input_data.get("occupationId")
            if not occupation_id:
                result = {"error": "Occupation ID required for job path"}
            else:
                result = create_job_projection(input_data, occupation_id)
        
        elif path_type == "military":
            branch = input_data.get("militaryBranch", "army")
            occupation_id = input_data.get("occupationId")
            result = create_military_projection(input_data, branch, occupation_id)
        
        else:  # baseline or other
            result = create_baseline_projection(input_data)
        
        # Verify expense categories exist and have values
        for category in ['housing', 'transportation', 'food', 'healthcare', 'discretionary']:
            if category not in result or not result[category] or len(result[category]) == 0:
                # Create default expense breakdown based on total expenses
                if 'expenses' in result and result['expenses']:
                    if category not in result:
                        result[category] = []
                    
                    # Map different percentages for different categories
                    percentage = 0.3  # Default (housing, discretionary)
                    if category == 'transportation' or category == 'food':
                        percentage = 0.15
                    elif category == 'healthcare':
                        percentage = 0.1
                    
                    # Apply percentage to each year's expenses
                    for year_expense in result['expenses']:
                        result[category].append(float(year_expense) * percentage)
        
        print(json.dumps(result))
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
