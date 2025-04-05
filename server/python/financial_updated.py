"""
Financial calculator module for the FinancialFuture application.
This module contains the calculator class responsible for generating financial projections.
"""

# Default milestone month (assuming milestones occur mid-year)
milestone_month = 6

import json
import logging
from typing import Dict, Any, List, Optional, Union, Callable

try:
    # First try direct imports (these will work when executed directly)
    from models.asset import Asset, DepreciableAsset, Investment
    from models.liability import Liability, Mortgage, StudentLoan, AutoLoan, PersonalLoan
    from models.income import Income, SalaryIncome, SpouseIncome
    from models.expenditure import Expenditure, Housing, Transportation, Living, Tax
    from launch_plan_assumptions import (
        HOME_PURCHASE_RENT_REDUCTION, CAR_PURCHASE_TRANSPORTATION_REDUCTION,
        MARRIAGE_EXPENSE_INCREASE, GRADUATE_SCHOOL_INCOME_INCREASE,
        CHILD_EXPENSE_PER_YEAR, CHILD_INITIAL_EXPENSE, DEFAULT_EXPENSE_ALLOCATIONS,
        HEALTHCARE_INFLATION_RATE, TRANSPORTATION_INFLATION_RATE,
        CAR_REPLACEMENT_YEARS, CAR_REPLACEMENT_COST, CAR_AUTO_REPLACE,
        CAR_LOAN_TERM, CAR_LOAN_INTEREST_RATE,
        MORTGAGE_TERM_YEARS, MORTGAGE_INTEREST_RATE
    )
except ImportError:
    # Fallback to full imports (these will work when executed from parent directory)
    from server.python.models.asset import Asset, DepreciableAsset, Investment
    from server.python.models.liability import Liability, Mortgage, StudentLoan, AutoLoan, PersonalLoan
    from server.python.models.income import Income, SalaryIncome, SpouseIncome
    from server.python.models.expenditure import Expenditure, Housing, Transportation, Living, Tax
    from server.python.launch_plan_assumptions import (
        HOME_PURCHASE_RENT_REDUCTION,
        MORTGAGE_TERM_YEARS,
        MORTGAGE_INTEREST_RATE,
        CAR_PURCHASE_TRANSPORTATION_REDUCTION,
        MARRIAGE_EXPENSE_INCREASE, GRADUATE_SCHOOL_INCOME_INCREASE,
        CHILD_EXPENSE_PER_YEAR, CHILD_INITIAL_EXPENSE, DEFAULT_EXPENSE_ALLOCATIONS,
        HEALTHCARE_INFLATION_RATE, TRANSPORTATION_INFLATION_RATE,
        CAR_REPLACEMENT_YEARS, CAR_REPLACEMENT_COST, CAR_AUTO_REPLACE,
        CAR_LOAN_TERM, CAR_LOAN_INTEREST_RATE
    )


class FinancialCalculator:
    """Financial calculator for generating projections."""
    
    def __init__(self, start_age: int = 25, years_to_project: int = 10):
        """
        Initialize a financial calculator.
        
        Args:
            start_age: Starting age for projections
            years_to_project: Number of years to project forward
        """
        self.start_age = start_age
        self.years_to_project = years_to_project
        self.assets: List[Asset] = []
        self.liabilities: List[Liability] = []
        self.incomes: List[Income] = []
        self.expenditures: List[Expenditure] = []
        self.milestones: List[Dict[str, Any]] = []
        self.results: Dict[str, Any] = {}
        
    def set_start_age(self, start_age: int) -> None:
        """
        Set the starting age for projections.
        
        Args:
            start_age: Starting age
        """
        self.start_age = start_age
    
    def set_projection_years(self, years: int) -> None:
        """
        Set the number of years to project.
        
        Args:
            years: Number of years
        """
        self.years_to_project = years
    
    def add_asset(self, asset: Asset) -> None:
        """
        Add an asset to the calculator.
        
        Args:
            asset: Asset to add
        """
        self.assets.append(asset)
    
    def add_liability(self, liability: Liability) -> None:
        """
        Add a liability to the calculator.
        
        Args:
            liability: Liability to add
        """
        self.liabilities.append(liability)
    
    def add_income(self, income: Income) -> None:
        """
        Add an income source to the calculator.
        
        Args:
            income: Income to add
        """
        self.incomes.append(income)
    
    def add_expenditure(self, expenditure: Expenditure) -> None:
        """
        Add an expenditure to the calculator.
        
        Args:
            expenditure: Expenditure to add
        """
        self.expenditures.append(expenditure)
    
    def add_milestone(self, milestone: Dict[str, Any]) -> None:
        """
        Add a milestone to the calculator.
        
        Args:
            milestone: Milestone to add
        """
        self.milestones.append(milestone)
    
    def calculate_projection(self) -> Dict[str, Any]:
        """
        Calculate financial projections.
        
        Returns:
            Dictionary with projection results
        """
        # Arrays to store yearly values
        ages = [self.start_age + i for i in range(self.years_to_project + 1)]
        
        # Main financial metrics
        net_worth = [0] * (self.years_to_project + 1)
        assets_yearly = [0] * (self.years_to_project + 1)
        liabilities_yearly = [0] * (self.years_to_project + 1)
        # Initialize an array to track all personal loans across years
        all_personal_loans = [0] * (self.years_to_project + 1)
        
        # Debug helper - output to healthcare log file
        with open('healthcare_debug.log', 'a') as f:
            f.write(f"\nStarting calculate_projection method\n")
        income_yearly = [0] * (self.years_to_project + 1)
        expenses_yearly = [0] * (self.years_to_project + 1)
        cash_flow_yearly = [0] * (self.years_to_project + 1)
        
        # Track specific assets and liabilities
        home_value_yearly = [0] * (self.years_to_project + 1)
        car_value_yearly = [0] * (self.years_to_project + 1)
        savings_value_yearly = [0] * (self.years_to_project + 1)  # Track savings values separately
        mortgage_yearly = [0] * (self.years_to_project + 1)
        car_loan_yearly = [0] * (self.years_to_project + 1)
        student_loan_yearly = [0] * (self.years_to_project + 1)
        all_personal_loans = [0] * (self.years_to_project + 1)  # New array to track all personal loans
        
        # Track expense categories
        # Base cost of living categories
        housing_expenses_yearly = [0] * (self.years_to_project + 1)
        transportation_expenses_yearly = [0] * (self.years_to_project + 1)
        food_expenses_yearly = [0] * (self.years_to_project + 1)
        healthcare_expenses_yearly = [0] * (self.years_to_project + 1)
        personal_insurance_expenses_yearly = [0] * (self.years_to_project + 1)
        apparel_expenses_yearly = [0] * (self.years_to_project + 1)
        services_expenses_yearly = [0] * (self.years_to_project + 1)
        entertainment_expenses_yearly = [0] * (self.years_to_project + 1)
        other_expenses_yearly = [0] * (self.years_to_project + 1)
        
        # Milestone-driven categories
        education_expenses_yearly = [0] * (self.years_to_project + 1)
        child_expenses_yearly = [0] * (self.years_to_project + 1)
        debt_expenses_yearly = [0] * (self.years_to_project + 1)
        discretionary_expenses_yearly = [0] * (self.years_to_project + 1)
        
        # Calculate year 0 (starting point) values without any income or expenses
        # This allows us to track just the initial assets and liabilities before 
        # incomes and expenses start in year 1
        
        # Sum all asset values for year 0
        for asset in self.assets:
            asset_value = asset.get_value(0)
            assets_yearly[0] += int(asset_value)
            
            # Categorize assets
            if isinstance(asset, Investment) and (asset.name.lower().find('home') >= 0 or asset.name.lower().find('house') >= 0):
                home_value_yearly[0] += int(asset_value)
            elif isinstance(asset, DepreciableAsset) and (asset.name.lower().find('car') >= 0 or asset.name.lower().find('vehicle') >= 0):
                car_value_yearly[0] += int(asset_value)
            elif isinstance(asset, Investment) and asset.name.lower().find('savings') >= 0:
                # Track savings specifically
                # Use direct assignment for year 0 just like we do for later years
                savings_value_yearly[0] = int(asset_value)
        
        # Sum all liability balances for year 0
        for liability in self.liabilities:
            liability_balance = liability.get_balance(0)
            liability_balance_int = int(liability_balance)
            liabilities_yearly[0] += liability_balance_int
            
            # Categorize liabilities
            if isinstance(liability, Mortgage):
                mortgage_yearly[0] += int(liability_balance)
            elif isinstance(liability, AutoLoan):
                car_loan_yearly[0] += int(liability_balance)
            elif isinstance(liability, StudentLoan):
                student_loan_yearly[0] += int(liability_balance)
        
        # Calculate initial net worth
        # No personal loans at the start, so we don't need to include all_personal_loans[0]
        net_worth[0] = int(assets_yearly[0] - liabilities_yearly[0])
        # Initialize all_personal_loans to empty array for year 0
        all_personal_loans[0] = 0
        
        # Project for each year
        for i in range(1, self.years_to_project + 1):
            # Age increases each year
            age = self.start_age + i
            
            # Calculate asset values for this year
            for asset in self.assets:
                asset_value = asset.get_value(i)
                assets_yearly[i] += int(asset_value)
                
                # Categorize assets
                if isinstance(asset, Investment) and (asset.name.lower().find('home') >= 0 or asset.name.lower().find('house') >= 0):
                    home_value_yearly[i] += int(asset_value)
                elif isinstance(asset, DepreciableAsset) and (asset.name.lower().find('car') >= 0 or asset.name.lower().find('vehicle') >= 0):
                    car_value_yearly[i] += int(asset_value)
                elif isinstance(asset, Investment) and asset.name.lower().find('savings') >= 0:
                    # Track savings specifically
                    # Use direct assignment instead of += to avoid double counting
                    # This ensures reductions from previous years are preserved
                    
                    # CRITICAL FIX: Check if there was a milestone reduction that made this negative
                    # and preserve the negative value instead of using the asset's calculated value
                    if i > 0 and savings_value_yearly[i-1] < 0:
                        # If previous year was negative, grow/reduce from that negative value
                        # instead of using the asset's calculated value which might be wrong
                        asset_value = min(asset_value, savings_value_yearly[i-1] * (1 + asset.growth_rate))
                        
                        # Write debug info to validate this logic
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nCRITICAL FIX - Year {i} savings after negative in previous year:\n")
                            f.write(f"  Previous year value: ${savings_value_yearly[i-1]}\n")
                            f.write(f"  Asset's calculated value: ${asset.get_value(i)}\n")
                            f.write(f"  Growth factor: {(1 + asset.growth_rate)}\n")
                            f.write(f"  Growth-adjusted previous value: ${savings_value_yearly[i-1] * (1 + asset.growth_rate)}\n")
                            f.write(f"  Setting savings_value_yearly[{i}] = ${asset_value}\n")
                    
                    savings_value_yearly[i] = int(asset_value)
            
            # Calculate liability balances for this year
            for liability in self.liabilities:
                liability_balance = liability.get_balance(i)
                liabilities_yearly[i] += int(liability_balance)
                
                # Categorize liabilities
                if isinstance(liability, Mortgage):
                    mortgage_balance_int = int(liability_balance)
                    mortgage_yearly[i] += mortgage_balance_int
                elif isinstance(liability, AutoLoan):
                    car_loan_yearly[i] += int(liability_balance)
                elif isinstance(liability, StudentLoan):
                    student_loan_yearly[i] += int(liability_balance)
            
            # Calculate income for this year
            for income in self.incomes:
                income_amount = income.get_income(i)
                income_yearly[i] += int(income_amount)
            
            # Calculate expenses for this year
            for expense in self.expenditures:
                expense_amount = expense.get_expense(i)
                expenses_yearly[i] += int(expense_amount)
            
            # Calculate cash flow for this year
            cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
            
            # Calculate net worth for this year including any personal loans
            # Add personal loan value from tracking array to net worth calculation
            net_worth[i] = assets_yearly[i] - (liabilities_yearly[i] + all_personal_loans[i])
            
            # Calculate expense categories for this year
            # Base cost of living categories
            year_housing = 0
            year_transportation = 0
            year_food = 0
            year_healthcare = 0
            year_personal_insurance = 0
            year_apparel = 0
            year_services = 0
            year_entertainment = 0
            year_other = 0
            
            # Milestone-driven categories
            year_education = 0
            year_childcare = 0
            year_debt = 0
            year_discretionary = 0
            
            for expense in self.expenditures:
                expense_amount = int(expense.get_expense(i))
                
                # Categorize expenses by type
                expense_name = expense.name.lower()
                
                # First check if it's a healthcare expense - this needs to be checked before
                # other categories to avoid double counting
                is_healthcare = 'health' in expense_name or 'medical' in expense_name
                
                # Debug this expense
                with open('healthcare_debug.log', 'a') as f:
                    f.write(f"Processing expense: name={expense.name}, type={type(expense).__name__}, amount={expense_amount}\n")
                    if is_healthcare:
                        f.write(f"IDENTIFIED as healthcare based on name: {expense_name}\n")
                
                # Base cost of living categories
                if is_healthcare:
                    # Healthcare expenses must be identified first
                    with open('healthcare_debug.log', 'a') as f:
                        f.write(f"[FIXED] Found healthcare expense: {expense.name}, amount: {expense_amount}\n")
                        f.write(f"Type: {type(expense).__name__}, dict: {expense.__dict__}\n")
                    year_healthcare += expense_amount
                    with open('healthcare_debug.log', 'a') as f:
                        f.write(f"Updated year_healthcare total: {year_healthcare}\n")
                elif isinstance(expense, Housing) or expense_name.find('housing') >= 0 or expense_name.find('rent') >= 0 or expense_name.find('mortgage') >= 0:
                    year_housing += expense_amount
                    with open('healthcare_debug.log', 'a') as f:
                        f.write(f"Categorized as housing, adding to year_housing: {year_housing}\n")
                elif isinstance(expense, Transportation) or expense_name.find('transport') >= 0 or expense_name.find('car') >= 0:
                    year_transportation += expense_amount
                    with open('healthcare_debug.log', 'a') as f:
                        f.write(f"Categorized as transportation, adding to year_transportation: {year_transportation}\n")
                elif expense_name.find('food') >= 0:
                    year_food += expense_amount
                    with open('healthcare_debug.log', 'a') as f:
                        f.write(f"Categorized as food, adding to year_food: {year_food}\n")
                elif expense_name.find('insurance') >= 0 and (expense_name.find('personal') >= 0 or expense_name.find('life') >= 0):
                    year_personal_insurance += expense_amount
                elif expense_name.find('apparel') >= 0 or expense_name.find('clothing') >= 0:
                    year_apparel += expense_amount
                elif expense_name.find('service') >= 0 or expense_name.find('utilities') >= 0:
                    year_services += expense_amount
                elif expense_name.find('entertainment') >= 0 or expense_name.find('recreation') >= 0:
                    year_entertainment += expense_amount
                
                # Milestone-driven categories
                elif expense_name.find('education') >= 0 or expense_name.find('college') >= 0 or expense_name.find('school') >= 0:
                    year_education += expense_amount
                elif expense_name.find('child') >= 0 or expense_name.find('daycare') >= 0:
                    year_childcare += expense_amount
                elif expense_name.find('debt') >= 0 or expense_name.find('loan') >= 0:
                    year_debt += expense_amount
                elif expense_name.find('discretionary') >= 0 or expense_name.find('leisure') >= 0:
                    year_discretionary += expense_amount
                else:
                    # Default to other expenses for anything not specifically categorized
                    year_other += expense_amount
            
            # Update expense category arrays
            housing_expenses_yearly[i] = year_housing
            transportation_expenses_yearly[i] = year_transportation
            food_expenses_yearly[i] = year_food
            healthcare_expenses_yearly[i] = year_healthcare
            personal_insurance_expenses_yearly[i] = year_personal_insurance
            apparel_expenses_yearly[i] = year_apparel
            services_expenses_yearly[i] = year_services
            entertainment_expenses_yearly[i] = year_entertainment
            other_expenses_yearly[i] = year_other
            
            # Milestone-driven categories
            education_expenses_yearly[i] = year_education
            child_expenses_yearly[i] = year_childcare
            debt_expenses_yearly[i] = year_debt
            discretionary_expenses_yearly[i] = year_discretionary
        
        # Process milestones
        if self.milestones:
            # Create a simpler array of just the years for each milestone
            milestone_years = {}
            for milestone in self.milestones:
                year = milestone.get('year', 0)
                if year in milestone_years:
                    milestone_years[year].append(milestone)
                else:
                    milestone_years[year] = [milestone]
            
            # Process each milestone in chronological order
            for year in sorted(milestone_years.keys()):
                if year > self.years_to_project:
                    continue  # Skip milestones beyond our projection period
                
                milestone_year = int(year)
                
                for milestone in milestone_years[year]:
                    if milestone.get('type') == 'marriage':
                        # Marriage affects income, expenses, and potentially assets/liabilities
                        spouse_income = int(milestone.get('spouse_income', milestone.get('spouseIncome', 0)))
                        spouse_assets = int(milestone.get('spouse_assets', milestone.get('spouseAssets', 0)))
                        spouse_liabilities = int(milestone.get('spouse_liabilities', milestone.get('spouseLiabilities', 0)))
                        wedding_cost = int(milestone.get('wedding_cost', milestone.get('weddingCost', 10000)))
                        
                        # Apply the one-time expense (wedding cost) to the milestone year
                        # This is consistent with our handling of down payments for home and car
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nApplying one-time wedding cost of ${wedding_cost} in year {milestone_year}\n")
                            f.write(f"Assets before wedding cost: ${assets_yearly[milestone_year]}\n")
                        
                        # Reduce assets by the wedding cost (for milestone year only)
                        assets_yearly[milestone_year] -= wedding_cost
                        
                        # CRITICAL FIX: Rather than just reducing savings for the milestone year,
                        # allow the savings value to go negative to properly track the impact
                        current_savings = savings_value_yearly[milestone_year]
                        savings_value_yearly[milestone_year] = current_savings - wedding_cost
                        
                        # Also reduce cash flow by the wedding cost for this year
                        cash_flow_yearly[milestone_year] -= wedding_cost
                        
                        # CRITICAL FIX: Update the investment asset value in our asset collection
                        # This ensures the reduction in savings persists to future years
                        savings_asset = None
                        
                        # Find the first investment asset (savings)
                        for asset in self.assets:
                            if isinstance(asset, Investment) and 'savings' in asset.name.lower():
                                savings_asset = asset
                                break
                        
                        # If we found a savings asset, permanently reduce its value
                        if savings_asset:
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"Found savings asset: {savings_asset.name}\n")
                                f.write(f"Original value at year {milestone_year}: ${savings_asset.get_value(milestone_year)}\n")
                                
                                # Debug - show current projected values for all years
                                f.write("\nSavings values before wedding expense:\n")
                                f.write("Savings_value_yearly array values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_value_yearly[yr]}\n")
                                
                                f.write("\nSavings asset's calculated values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_asset.get_value(yr)}\n")
                            
                            # Get current value and reduce by wedding cost
                            current_value = savings_asset.get_value(milestone_year)
                            new_value = max(0, current_value - wedding_cost)
                            
                            # Update the value for this year and all future years will be based on this reduced amount
                            savings_asset.update_value(milestone_year, new_value)
                            
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"Updated savings asset value: ${new_value}\n")
                                f.write(f"New value verification: ${savings_asset.get_value(milestone_year)}\n")
                                
                                # Debug - show updated projected values for all years
                                f.write("\nSavings values after wedding expense:\n")
                                f.write("Updated savings_value_yearly array values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_value_yearly[yr]}\n")
                                
                                f.write("\nUpdated savings asset's calculated values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_asset.get_value(yr)}\n")
                        else:
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"WARNING: Could not find a savings asset to update for wedding cost!\n")
                        
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"Assets after wedding cost: ${assets_yearly[milestone_year]}\n")
                            f.write(f"Cash flow reduced by wedding cost: ${cash_flow_yearly[milestone_year]}\n")
                        
                        # Add spouse income to our income projection
                        for i in range(milestone_year, self.years_to_project + 1):
                            # Apply annual growth to spouse income (using same rate as primary income)
                            spouse_income_for_year = int(spouse_income * (1.03 ** (i - milestone_year)))  # Convert to int to fix type error
                            income_yearly[i] += spouse_income_for_year
                        
                        # Add spouse assets and liabilities to net worth
                        for i in range(milestone_year, self.years_to_project + 1):
                            assets_yearly[i] += int(spouse_assets)
                            # Calculate liability reduction and convert to int
                            reduced_liability = int(spouse_liabilities * max(0, 1 - (i - milestone_year) * 0.1))
                            liabilities_yearly[i] += reduced_liability  # Simple reduction of liabilities over time
                            net_worth[i] = assets_yearly[i] - (liabilities_yearly[i] + all_personal_loans[i])
                            
                            # Increase general expenses due to marriage
                            # Only apply to expenses after the wedding year (to avoid double counting wedding costs)
                            if i > milestone_year:
                                # Find non-housing, non-transportation expenses and increase them by specified percentage
                                for expense in self.expenditures:
                                    if not isinstance(expense, Housing) and not isinstance(expense, Transportation):
                                        # Increase general expenses according to marriage assumption
                                        expense.expense_history[i] = expense.expense_history.get(i, expense.annual_amount) * (1 + MARRIAGE_EXPENSE_INCREASE)
                                
                                # Recalculate total expenses and categories for this year
                                year_expenses = 0
                                
                                # Base cost of living categories
                                year_housing = 0
                                year_transportation = 0
                                year_food = 0
                                year_healthcare = 0
                                year_personal_insurance = 0
                                year_apparel = 0
                                year_services = 0
                                year_entertainment = 0
                                year_other = 0
                                
                                # Milestone-driven categories
                                year_education = 0
                                year_childcare = 0
                                year_debt = 0
                                year_discretionary = 0
                                
                                for expense in self.expenditures:
                                    expense_amount = int(expense.get_expense(i))
                                    year_expenses += expense_amount
                                    
                                    # Categorize expenses by type
                                    expense_name = expense.name.lower()
                                    
                                    # First check if it's a healthcare expense - check before other categories
                                    is_healthcare = 'health' in expense_name or 'medical' in expense_name
                                    
                                    # Base cost of living categories
                                    if is_healthcare:
                                        # Healthcare expenses must be identified first to avoid double counting
                                        with open('healthcare_debug.log', 'a') as f:
                                            f.write(f"[FIXED-MARRIAGE] Found healthcare expense: {expense.name}, amount: {expense_amount}\n")
                                            f.write(f"Type: {type(expense).__name__}, dict: {expense.__dict__}\n")
                                        year_healthcare += expense_amount
                                        with open('healthcare_debug.log', 'a') as f:
                                            f.write(f"Marriage milestone: Updated year_healthcare total: {year_healthcare}\n")
                                    elif isinstance(expense, Housing) or expense_name.find('housing') >= 0 or expense_name.find('rent') >= 0 or expense_name.find('mortgage') >= 0:
                                        year_housing += expense_amount
                                    elif isinstance(expense, Transportation) or expense_name.find('transport') >= 0 or expense_name.find('car') >= 0:
                                        year_transportation += expense_amount
                                    elif expense_name.find('food') >= 0:
                                        year_food += expense_amount
                                    elif expense_name.find('insurance') >= 0 and (expense_name.find('personal') >= 0 or expense_name.find('life') >= 0):
                                        year_personal_insurance += expense_amount
                                    elif expense_name.find('apparel') >= 0 or expense_name.find('clothing') >= 0:
                                        year_apparel += expense_amount
                                    elif expense_name.find('service') >= 0 or expense_name.find('utilities') >= 0:
                                        year_services += expense_amount
                                    elif expense_name.find('entertainment') >= 0 or expense_name.find('recreation') >= 0:
                                        year_entertainment += expense_amount
                                    
                                    # Milestone-driven categories
                                    elif expense_name.find('education') >= 0 or expense_name.find('college') >= 0 or expense_name.find('school') >= 0:
                                        year_education += expense_amount
                                    elif expense_name.find('child') >= 0 or expense_name.find('daycare') >= 0:
                                        year_childcare += expense_amount
                                    elif expense_name.find('debt') >= 0 or expense_name.find('loan') >= 0:
                                        year_debt += expense_amount
                                    elif expense_name.find('discretionary') >= 0 or expense_name.find('leisure') >= 0:
                                        year_discretionary += expense_amount
                                    else:
                                        # Default to other expenses for anything not specifically categorized
                                        year_other += expense_amount
                                    
                                expenses_yearly[i] = year_expenses
                                
                                # Base cost of living categories
                                housing_expenses_yearly[i] = year_housing
                                transportation_expenses_yearly[i] = year_transportation
                                food_expenses_yearly[i] = year_food
                                healthcare_expenses_yearly[i] = year_healthcare
                                personal_insurance_expenses_yearly[i] = year_personal_insurance
                                apparel_expenses_yearly[i] = year_apparel
                                services_expenses_yearly[i] = year_services
                                entertainment_expenses_yearly[i] = year_entertainment
                                other_expenses_yearly[i] = year_other
                                
                                # Milestone-driven categories
                                education_expenses_yearly[i] = year_education
                                child_expenses_yearly[i] = year_childcare
                                debt_expenses_yearly[i] = year_debt
                                discretionary_expenses_yearly[i] = year_discretionary
                                
                                cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
                
                    elif milestone.get('type') == 'housing' or milestone.get('type') == 'home':
                        # Process home purchase milestone
                        home_value = int(milestone.get('home_value', milestone.get('homeValue', 300000)))
                        home_down_payment = int(milestone.get('home_down_payment', milestone.get('homeDownPayment', 60000)))
                        home_loan_principal = home_value - home_down_payment
                        home_monthly_payment = int(milestone.get('home_monthly_payment', milestone.get('homeMonthlyPayment', 1800)))
                        home_annual_payment = home_monthly_payment * 12
                        
                        # Get home purchase rent reduction factor from imported assumptions
                        home_rent_reduction = HOME_PURCHASE_RENT_REDUCTION
                        
                        # No need to create artificial rent expense - we'll work with whatever housing expenses already exist
                        # Simply log the current housing expenses for debugging
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nCurrent housing expenses before home purchase:\n")
                            for i in range(1, self.years_to_project + 1):
                                f.write(f"Year {i}: ${housing_expenses_yearly[i]}\n")
                        
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nProcessing home purchase milestone in year {milestone_year}:\n")
                            f.write(f"- Home value: ${home_value}\n")
                            f.write(f"- Down payment: ${home_down_payment}\n")
                            f.write(f"- Mortgage loan: ${home_loan_principal}\n")
                            f.write(f"- Annual payment: ${home_annual_payment}\n")
                            f.write(f"- Current housing expenses: {[housing_expenses_yearly[y] for y in range(milestone_year, min(milestone_year+3, self.years_to_project+1))]}\n")
                            f.write(f"- Rent reduction factor: {home_rent_reduction*100}%\n")
                        
                        # Add home as an asset (appreciating at 3% annually)
                        # And add mortgage as a liability
                        mortgage_term = MORTGAGE_TERM_YEARS
                        mortgage_interest_rate = MORTGAGE_INTEREST_RATE
                        
                        # Apply the one-time expense (down payment) to the milestone year
                        # Reduce assets (savings/investments) to account for home down payment
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nApplying one-time home down payment expense of ${home_down_payment} in year {milestone_year}\n")
                            f.write(f"Assets before down payment: ${assets_yearly[milestone_year]}\n")
                        
                        # Reduce assets by the down payment amount (for milestone year only)
                        assets_yearly[milestone_year] -= home_down_payment
                        
                        # NEW APPROACH: Don't allow savings to go negative. Instead, create a personal loan
                        # for any amount that exceeds available savings
                        current_savings = savings_value_yearly[milestone_year]
                        available_savings_for_down_payment = max(0, current_savings)
                        
                        # Calculate how much of the down payment can be covered by savings
                        savings_portion = min(available_savings_for_down_payment, home_down_payment)
                        
                        # Calculate loan amount needed if savings doesn't cover full down payment
                        loan_needed = max(0, home_down_payment - savings_portion)
                        
                        # Log details of available savings and potential personal loan
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nChecking savings availability for home down payment:\n")
                            f.write(f"- Available savings: ${available_savings_for_down_payment}\n")
                            f.write(f"- Down payment needed: ${home_down_payment}\n")
                            f.write(f"- Savings portion: ${savings_portion}\n")
                            f.write(f"- Loan needed: ${loan_needed}\n")
                        
                        # Only reduce savings by what's available
                        savings_value_yearly[milestone_year] = current_savings - savings_portion
                        
                        # Create a personal loan if needed
                        if loan_needed > 0:
                            # Use assumption values for personal loan term and rate
                            # Default to 5 years and 8% if not specified
                            personal_loan_term = 5  # years
                            personal_loan_rate = 0.08  # 8%
                            
                            # Calculate monthly payment for the personal loan
                            # Formula: P * (r/12) * (1+r/12)^(n*12) / ((1+r/12)^(n*12) - 1)
                            monthly_rate = personal_loan_rate / 12
                            num_payments = personal_loan_term * 12
                            monthly_payment = loan_needed * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
                            
                            # Create a personal loan object for home down payment
                            # Assuming the loan starts in June (month 6)
                            personal_loan = PersonalLoan(
                                name="Home Down Payment Loan",
                                initial_balance=loan_needed,
                                interest_rate=personal_loan_rate,
                                term_years=personal_loan_term,
                                milestone_year=milestone_year,
                                milestone_month=6  # Assume loan starts mid-year
                            )
                            
                            # Add the personal loan to the calculator's liabilities
                            self.add_liability(personal_loan)
                            
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"\nCreating personal loan for home down payment:\n")
                                f.write(f"- Loan amount: ${loan_needed}\n")
                                f.write(f"- Term: {personal_loan_term} years\n")
                                f.write(f"- Rate: {personal_loan_rate * 100}%\n")
                                f.write(f"- Monthly payment: ${personal_loan.monthly_payment:.2f}\n")
                            
                            # Track the loan balance for all future years
                            for year in range(milestone_year, self.years_to_project + 1):
                                # Get the loan balance for this year
                                loan_balance = personal_loan.get_balance(year)
                                
                                # Add to all_personal_loans array for net worth calculation
                                loan_balance_int = int(loan_balance)
                                all_personal_loans[year] += loan_balance_int
                                
                                # Add the loan payment to debt expenses
                                payment = personal_loan.get_payment(year)
                                payment_int = int(payment)
                                debt_expenses_yearly[year] += payment_int
                        
                        # Update cash flow by the actual savings withdrawal
                        cash_flow_yearly[milestone_year] -= savings_portion
                        
                        # CRITICAL FIX: Update the investment asset value in our asset collection
                        # This ensures the reduction in savings persists to future years
                        savings_asset = None
                        
                        # Find the first investment asset (savings)
                        for asset in self.assets:
                            if isinstance(asset, Investment) and 'savings' in asset.name.lower():
                                savings_asset = asset
                                break
                        
                        # If we found a savings asset, permanently reduce its value
                        if savings_asset:
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"Found savings asset: {savings_asset.name}\n")
                                f.write(f"Original value at year {milestone_year}: ${savings_asset.get_value(milestone_year)}\n")
                                
                                # Debug - show current projected values for all years
                                f.write("\nSavings values before home purchase:\n")
                                f.write("Savings_value_yearly array values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_value_yearly[yr]}\n")
                                
                                f.write("\nSavings asset's calculated values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_asset.get_value(yr)}\n")
                            
                            # Get current value and reduce by down payment
                            current_value = savings_asset.get_value(milestone_year)
                            new_value = max(0, current_value - home_down_payment)
                            
                            # Update the value for this year and all future years will be based on this reduced amount
                            savings_asset.update_value(milestone_year, new_value)
                            
                            # CRITICAL FIX: Also update the savings_value_yearly array to match the asset
                            # This ensures both tracking systems are in sync
                            for yr in range(milestone_year, self.years_to_project + 1):
                                savings_value_yearly[yr] = int(savings_asset.get_value(yr))
                            
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"Updated savings asset value: ${new_value}\n")
                                f.write(f"New value verification: ${savings_asset.get_value(milestone_year)}\n")
                                f.write(f"Updated savings_value_yearly[{milestone_year}] = {savings_value_yearly[milestone_year]}\n")
                                
                                # Debug - show updated projected values for all years
                                f.write("\nSavings values after home purchase:\n")
                                f.write("Updated savings_value_yearly array values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_value_yearly[yr]}\n")
                                
                                f.write("\nUpdated savings asset's calculated values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_asset.get_value(yr)}\n")
                        else:
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"WARNING: Could not find a savings asset to update for home down payment!\n")
                        
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"Assets after down payment: ${assets_yearly[milestone_year]}\n")
                            f.write(f"Cash flow reduced by down payment: ${cash_flow_yearly[milestone_year]}\n")
                        
                        for i in range(milestone_year, self.years_to_project + 1):
                            # Home appreciates at 3% per year
                            years_owned = i - milestone_year
                            appreciated_value = int(home_value * ((1 + 0.03) ** years_owned))
                            
                            # Only calculate remaining principal if within loan term
                            if years_owned < mortgage_term:
                                # Calculate proper amortization for level payment loan
                                r = mortgage_interest_rate / 12  # Monthly rate
                                n = mortgage_term * 12  # Total payments (months)
                                
                                # Calculate monthly payment (P&I only)
                                # Formula: P = L[c(1+c)^n]/[(1+c)^n-1]
                                monthly_payment = (home_loan_principal * r * pow(1 + r, n)) / (pow(1 + r, n) - 1)
                                
                                # Calculate remaining principal after years_owned
                                remaining_principal = home_loan_principal
                                for _ in range(years_owned * 12):  # Convert years to months
                                    interest = remaining_principal * r
                                    principal_reduction = monthly_payment - interest
                                    remaining_principal -= principal_reduction
                                
                                remaining_principal = int(max(0, remaining_principal))
                            else:
                                # Loan is fully paid off
                                remaining_principal = 0
                            
                            # Update tracking arrays for home and mortgage
                            home_value_yearly[i] += appreciated_value
                            mortgage_yearly[i] += remaining_principal
                            
                            # Update overall assets and liabilities 
                            # IMPORTANT: We need to be careful not to double-count assets or liabilities
                            # The home value gets added to assets, and the mortgage to liabilities
                            # We track these separately to better understand asset composition
                            assets_yearly[i] += appreciated_value  
                            liabilities_yearly[i] += remaining_principal
                            
                            # CRITICAL FIX: Log home purchase impact on net worth
                            # This will help us diagnose negative net worth issues
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"\n[HOME PURCHASE IMPACT] Year {i}:\n")
                                f.write(f"  Home value added to assets: ${appreciated_value}\n")
                                f.write(f"  Mortgage added to liabilities: ${remaining_principal}\n")
                                f.write(f"  Net home impact on net worth: ${appreciated_value - remaining_principal}\n")
                                f.write(f"  Total assets: ${assets_yearly[i]}\n")
                                f.write(f"  Total liabilities: ${liabilities_yearly[i]}\n")
                                f.write(f"  Personal loans: ${all_personal_loans[i]}\n")
                                f.write(f"  Net worth calculation: ${assets_yearly[i]} - (${liabilities_yearly[i]} + ${all_personal_loans[i]}) = ${assets_yearly[i] - (liabilities_yearly[i] + all_personal_loans[i])}\n")
                            
                            # FIXED HOME PURCHASE IMPACT ON EXPENSES - NO DOUBLE COUNTING
                            
                            # 1. Store original housing expense for logging
                            old_housing_expense = housing_expenses_yearly[i]
                            
                            # 2. Calculate reduction amount based on HOME_PURCHASE_RENT_REDUCTION
                            #    This is the percentage of rent that goes away when buying a home
                            rent_reduction = int(old_housing_expense * home_rent_reduction)
                            
                            # 3. Apply the reduction (reduce rent by the specified percentage)
                            new_housing_expense = old_housing_expense - rent_reduction
                            
                            # 4. Add mortgage payment to debt expenses ONLY (not housing)
                            # We only put the remaining housing expense (if any) in housing category
                            housing_expenses_yearly[i] = new_housing_expense
                            
                            # 5. Add mortgage payment to debt expenses category for tracking
                            # This way it only appears once in the chart
                            debt_expenses_yearly[i] += home_annual_payment
                            
                            # 6. Log detailed changes
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"\n[FIXED HOME PURCHASE - NO DOUBLE COUNTING] Home purchase impact for year {i}:\n")
                                f.write(f"  Original housing expense (rent): ${old_housing_expense}\n")
                                f.write(f"  Rent reduction ({home_rent_reduction*100}%): -${rent_reduction}\n")
                                f.write(f"  Remaining housing expense: ${new_housing_expense}\n")
                                f.write(f"  Mortgage payment (added to debt category): ${home_annual_payment}\n")
                                f.write(f"  Home value: ${appreciated_value}\n")
                                f.write(f"  Mortgage principal: ${remaining_principal}\n")
                            
                            # Don't need additional logs as we're already logging above
                                    
                            # Update total expenses
                            expenses_yearly[i] = (
                                housing_expenses_yearly[i] +
                                transportation_expenses_yearly[i] +
                                food_expenses_yearly[i] +
                                healthcare_expenses_yearly[i] +
                                personal_insurance_expenses_yearly[i] +
                                apparel_expenses_yearly[i] +
                                services_expenses_yearly[i] +
                                entertainment_expenses_yearly[i] +
                                other_expenses_yearly[i] +
                                education_expenses_yearly[i] +
                                child_expenses_yearly[i] +
                                debt_expenses_yearly[i] +
                                discretionary_expenses_yearly[i]
                            )
                            
                            # Update net worth and cash flow
                            net_worth[i] = assets_yearly[i] - (liabilities_yearly[i] + all_personal_loans[i])
                            cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
                    
                    elif milestone.get('type') == 'car':
                        # Process car purchase milestone
                        car_value = int(milestone.get('car_value', milestone.get('carValue', 25000)))
                        car_down_payment = int(milestone.get('car_down_payment', milestone.get('carDownPayment', 5000)))
                        car_loan_principal = car_value - car_down_payment
                        car_monthly_payment = int(milestone.get('car_monthly_payment', milestone.get('carMonthlyPayment', 450)))
                        car_annual_payment = car_monthly_payment * 12
                        
                        # Get car purchase transportation reduction factor from imported assumptions
                        car_transportation_reduction = CAR_PURCHASE_TRANSPORTATION_REDUCTION
                        
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nProcessing car milestone in year {milestone_year}:\n")
                            f.write(f"- Car value: ${car_value}\n")
                            f.write(f"- Down payment: ${car_down_payment}\n")
                            f.write(f"- Car loan: ${car_loan_principal}\n")
                            f.write(f"- Annual payment: ${car_annual_payment}\n")
                            f.write(f"- Transportation reduction factor: {car_transportation_reduction}\n")
                            
                        # Apply the one-time expense (down payment) to the milestone year
                        # Reduce assets (savings/investments) to account for car down payment
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nApplying one-time car down payment expense of ${car_down_payment} in year {milestone_year}\n")
                            f.write(f"Assets before down payment: ${assets_yearly[milestone_year]}\n")
                        
                        # Reduce assets by the down payment amount (for milestone year only)
                        assets_yearly[milestone_year] -= car_down_payment
                        
                        # NEW APPROACH: Don't allow savings to go negative. Instead, create a personal loan
                        # for any amount that exceeds available savings
                        current_savings = savings_value_yearly[milestone_year]
                        available_savings_for_down_payment = max(0, current_savings)
                        
                        # Calculate how much of the down payment can be covered by savings
                        savings_portion = min(available_savings_for_down_payment, car_down_payment)
                        
                        # Calculate loan amount needed if savings doesn't cover full down payment
                        loan_needed = max(0, car_down_payment - savings_portion)
                        
                        # Log details of available savings and potential personal loan
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nChecking savings availability for car down payment:\n")
                            f.write(f"- Available savings: ${available_savings_for_down_payment}\n")
                            f.write(f"- Down payment needed: ${car_down_payment}\n")
                            f.write(f"- Savings portion: ${savings_portion}\n")
                            f.write(f"- Loan needed: ${loan_needed}\n")
                        
                        # Only reduce savings by what's available
                        savings_value_yearly[milestone_year] = current_savings - savings_portion
                        
                        # Create a personal loan if needed
                        if loan_needed > 0:
                            # Use assumption values for personal loan term and rate
                            # Default to 5 years and 8% if not specified
                            personal_loan_term = 5  # years
                            personal_loan_rate = 0.08  # 8%
                            
                            # Calculate monthly payment for the personal loan
                            # Formula: P * (r/12) * (1+r/12)^(n*12) / ((1+r/12)^(n*12) - 1)
                            monthly_rate = personal_loan_rate / 12
                            num_payments = personal_loan_term * 12
                            monthly_payment = loan_needed * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
                            
                            # Create a personal loan object for car down payment
                            # Assuming the loan starts in the same month as the milestone
                            personal_loan = PersonalLoan(
                                name="Car Down Payment Loan",
                                initial_balance=loan_needed,
                                interest_rate=personal_loan_rate,
                                term_years=personal_loan_term,
                                milestone_year=milestone_year,
                                milestone_month=6  # Assume loan starts mid-year
                            )
                            
                            # Add the personal loan to the calculator's liabilities
                            self.add_liability(personal_loan)
                            
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"\nCreating personal loan for car down payment:\n")
                                f.write(f"- Loan amount: ${loan_needed}\n")
                                f.write(f"- Term: {personal_loan_term} years\n")
                                f.write(f"- Rate: {personal_loan_rate * 100}%\n")
                                f.write(f"- Monthly payment: ${personal_loan.monthly_payment:.2f}\n")
                            
                            # Track the loan balance for all future years
                            for year in range(milestone_year, self.years_to_project + 1):
                                # Get the loan balance for this year
                                loan_balance = personal_loan.get_balance(year)
                                
                                # Add to all_personal_loans array for net worth calculation
                                all_personal_loans[year] += int(loan_balance)
                                
                                # Add the loan payment to debt expenses
                                payment = personal_loan.get_payment(year)
                                debt_expenses_yearly[year] += int(payment)
                        
                        # Update cash flow by the actual savings withdrawal
                        cash_flow_yearly[milestone_year] -= savings_portion
                        
                        # CRITICAL FIX: Update the investment asset value in our asset collection
                        # This ensures the reduction in savings persists to future years 
                        savings_asset = None
                        
                        # Find the first investment asset (savings)
                        for asset in self.assets:
                            if isinstance(asset, Investment) and 'savings' in asset.name.lower():
                                savings_asset = asset
                                break
                        
                        # If we found a savings asset, permanently reduce its value
                        if savings_asset:
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"Found savings asset: {savings_asset.name}\n")
                                f.write(f"Original value at year {milestone_year}: ${savings_asset.get_value(milestone_year)}\n")
                                
                                # Debug - show current projected values for all years
                                f.write("\nSavings values before car purchase:\n")
                                f.write("Savings_value_yearly array values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_value_yearly[yr]}\n")
                                
                                f.write("\nSavings asset's calculated values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_asset.get_value(yr)}\n")
                            
                            # Get current value and reduce by down payment
                            current_value = savings_asset.get_value(milestone_year)
                            new_value = max(0, current_value - car_down_payment)
                            
                            # Update the value for this year and all future years will be based on this reduced amount
                            savings_asset.update_value(milestone_year, new_value)
                            
                            # CRITICAL FIX: Also update the savings_value_yearly array to match the asset
                            # This ensures both tracking systems are in sync for car purchases
                            for yr in range(milestone_year, self.years_to_project + 1):
                                savings_value_yearly[yr] = int(savings_asset.get_value(yr))
                            
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"Updated savings asset value: ${new_value}\n") 
                                f.write(f"New value verification: ${savings_asset.get_value(milestone_year)}\n")
                                f.write(f"Updated savings_value_yearly[{milestone_year}] = {savings_value_yearly[milestone_year]}\n")
                                
                                # Debug - show updated projected values for all years
                                f.write("\nSavings values after car purchase:\n")
                                f.write("Updated savings_value_yearly array values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_value_yearly[yr]}\n")
                                
                                f.write("\nUpdated savings asset's calculated values:\n")
                                for yr in range(milestone_year, self.years_to_project + 1):
                                    f.write(f"Year {yr}: ${savings_asset.get_value(yr)}\n")
                        else:
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"WARNING: Could not find a savings asset to update for car down payment!\n")
                        
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"Assets after down payment: ${assets_yearly[milestone_year]}\n")
                            f.write(f"Cash flow reduced by down payment: ${cash_flow_yearly[milestone_year]}\n")
                        
                        # Add car asset and loan to financial tracking
                        for i in range(milestone_year, self.years_to_project + 1):
                            # Calculate car value with depreciation (15% per year)
                            years_owned = i - milestone_year
                            current_car_value = int(car_value * (0.85 ** years_owned))
                            
                            # Calculate loan balance based on simple amortization
                            # Use constants from launch_plan_assumptions.py
                            loan_term = CAR_LOAN_TERM  # From assumptions
                            loan_years_passed = min(years_owned, loan_term)  # Cap at loan term
                            car_interest_rate = CAR_LOAN_INTEREST_RATE  # From assumptions
                            
                            # Only calculate remaining principal if within loan term
                            if loan_years_passed < loan_term:
                                # Calculate proper amortization for level payment loan
                                r = car_interest_rate
                                n = loan_term  # Loan term from constants
                                payment = (car_loan_principal * r * pow(1 + r, n)) / (pow(1 + r, n) - 1)
                                
                                # Calculate remaining principal after loan_years_passed
                                remaining_principal = car_loan_principal
                                for _ in range(loan_years_passed):
                                    interest = remaining_principal * car_interest_rate
                                    principal_reduction = payment - interest
                                    remaining_principal -= principal_reduction
                                
                                current_car_loan = max(0, int(remaining_principal))
                            else:
                                current_car_loan = 0  # Loan is paid off
                            
                            # Update tracking arrays
                            car_value_yearly[i] = current_car_value
                            car_loan_yearly[i] = current_car_loan
                            
                            # Update total assets and liabilities
                            assets_yearly[i] += current_car_value
                            liabilities_yearly[i] += current_car_loan
                            
                            # CRITICAL FIX: Car transactions should not cause net worth to go negative
                            # Log the current net worth calculation details
                            with open('healthcare_debug.log', 'a') as f:
                                f.write(f"\n[CAR PURCHASE IMPACT] Year {i}:\n")
                                f.write(f"  Car value added to assets: ${current_car_value}\n")
                                f.write(f"  Car loan added to liabilities: ${current_car_loan}\n")
                                f.write(f"  Net car impact on net worth: ${current_car_value - current_car_loan}\n")
                                f.write(f"  Total assets: ${assets_yearly[i]}\n")
                                f.write(f"  Total liabilities: ${liabilities_yearly[i]}\n")
                                f.write(f"  Personal loans: ${all_personal_loans[i]}\n")
                                f.write(f"  Net worth calculation: ${assets_yearly[i]} - (${liabilities_yearly[i]} + ${all_personal_loans[i]}) = ${assets_yearly[i] - (liabilities_yearly[i] + all_personal_loans[i])}\n")
                            
                            # Add car payment to debt expenses category (don't modify expenses_yearly directly)
                            if loan_years_passed < loan_term:
                                # Add car payment to debt expenses category
                                debt_expenses_yearly[i] += car_annual_payment
                                
                                # Note: We will recompute expenses_yearly at the end based on all categories
                            
                            # Apply transportation expense reduction while the car is owned
                            # This reduces other transport costs like public transit
                            # For all years that the user owns a car (from milestone_year onward)
                            if i >= milestone_year:
                                # First, check if we've already applied a reduction for this year
                                # (in case of multiple cars)
                                reduction_already_applied = False
                                # TODO: In the future, we could track which years have reductions applied
                                
                                if not reduction_already_applied:
                                    # Find any transportation expenses and apply the reduction
                                    for expenditure in self.expenditures:
                                        if (isinstance(expenditure, Transportation) or 
                                            expenditure.name.lower().find('transport') >= 0 or 
                                            expenditure.name.lower().find('transit') >= 0):
                                            # Get current value for this year
                                            current_transport = expenditure.get_expense(i)
                                            # Apply reduction
                                            reduced_transport = current_transport * (1.0 - car_transportation_reduction)
                                            
                                            # Update expense for this year in our tracking array
                                            with open('healthcare_debug.log', 'a') as f:
                                                if i == milestone_year:  # Only log the first year to avoid excessive logging
                                                    f.write(f"Reducing transportation expense '{expenditure.name}' from ${current_transport} to ${reduced_transport}\n")
                                                    f.write(f"This reduction will apply for all future years while the car is owned\n")
                                            
                                            # We can't directly modify the expense amount in the expenditure object
                                            # So instead, we'll adjust the transportation_expenses_yearly array
                                            # Convert to int since we're storing integers
                                            transportation_expenses_yearly[i] = int(transportation_expenses_yearly[i] * (1.0 - car_transportation_reduction))
                                        
                            # Update net worth (assets - liabilities)
                            net_worth[i] = assets_yearly[i] - (liabilities_yearly[i] + all_personal_loans[i])
                            
                            # Recalculate total expenses for the year with all components
                            expenses_yearly[i] = (
                                housing_expenses_yearly[i] +
                                transportation_expenses_yearly[i] +
                                food_expenses_yearly[i] +
                                healthcare_expenses_yearly[i] +
                                personal_insurance_expenses_yearly[i] +
                                apparel_expenses_yearly[i] +
                                services_expenses_yearly[i] +
                                entertainment_expenses_yearly[i] +
                                other_expenses_yearly[i] +
                                education_expenses_yearly[i] +
                                child_expenses_yearly[i] +
                                debt_expenses_yearly[i] +
                                discretionary_expenses_yearly[i]
                            )
                            
                            # Update cash flow
                            cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
                            
                            # CRITICAL FIX: Apply positive cash flow to savings
                            # This ensures that when people earn more than they spend,
                            # the excess money goes into their savings
                            if i > 0 and cash_flow_yearly[i] > 0:
                                # Find the savings asset to update with positive cash flow
                                savings_asset = None
                                for asset in self.assets:
                                    if isinstance(asset, Investment) and 'savings' in asset.name.lower():
                                        savings_asset = asset
                                        break
                                        
                                if savings_asset:
                                    with open('healthcare_debug.log', 'a') as f:
                                        f.write(f"\n[SAVINGS UPDATE FROM CASH FLOW] Year {i}:\n")
                                        f.write(f"  Current savings value: ${savings_asset.get_value(i)}\n")
                                        f.write(f"  Positive cash flow: ${cash_flow_yearly[i]}\n")
                                    
                                    # Add positive cash flow as a contribution to savings
                                    savings_asset.add_contribution(cash_flow_yearly[i], i)
                                    
                                    # Update the savings value array to match
                                    savings_value_yearly[i] = int(round(savings_asset.get_value(i)))
                                    
                                    with open('healthcare_debug.log', 'a') as f:
                                        f.write(f"  Updated savings value: ${savings_asset.get_value(i)}\n")
                                        f.write(f"  Updated savings_value_yearly[{i}] = {savings_value_yearly[i]}\n")
        
        # CRITICAL FIX FOR MILESTONE SAVINGS TRACKING
        # After all milestones are processed, ensure that the savings values are properly synced
        # This guarantees that savings_value_yearly matches the actually calculated savings asset values
        # Find the savings asset
        savings_asset = None
        for asset in self.assets:
            if isinstance(asset, Investment) and 'savings' in asset.name.lower():
                savings_asset = asset
                break
                
        if savings_asset:
            with open('healthcare_debug.log', 'a') as f:
                f.write("\n\n=== SYNCHRONIZING SAVINGS ARRAYS AFTER ALL MILESTONES ===\n")
                
                # Log the current values
                f.write("Current values before sync:\n")
                for yr in range(0, self.years_to_project + 1):
                    f.write(f"Year {yr}: Array=${savings_value_yearly[yr]}, Asset=${savings_asset.get_value(yr)}\n")
                
                # Sync all values from the savings asset to the array
                for yr in range(0, self.years_to_project + 1):
                    asset_value = savings_asset.get_value(yr)
                    savings_value_yearly[yr] = int(round(asset_value))
                    
                    # COMPLETELY REDONE ASSET AND NET WORTH CALCULATION
                    # This is the critical fix to ensure all assets (including home/car) are included
                    
                    # Step 1: Get all standard asset values from asset objects
                    standard_assets_value = 0
                    for a in self.assets:
                        if a != savings_asset:
                            standard_assets_value += a.get_value(yr)
                    
                    # Step 2: Add properly synchronized savings value
                    standard_assets_value += asset_value
                    
                    # Step 3: Add home and car values explicitly
                    # Note: These values were calculated and stored in their respective arrays
                    # during the milestone processing
                    total_asset_value = standard_assets_value + home_value_yearly[yr] + car_value_yearly[yr]
                    
                    # Step 4: Update assets_yearly with COMPLETE asset value
                    assets_yearly[yr] = int(total_asset_value)
                    
                    # Step 5: Log the components for debugging
                    with open('healthcare_debug.log', 'a') as debug_f:
                        debug_f.write(f"\nYear {yr} ASSET COMPOSITION:\n")
                        debug_f.write(f"  Standard assets: ${standard_assets_value}\n")
                        debug_f.write(f"  Home value: ${home_value_yearly[yr]}\n")
                        debug_f.write(f"  Car value: ${car_value_yearly[yr]}\n")
                        debug_f.write(f"  TOTAL ASSETS: ${total_asset_value}\n")
                        debug_f.write(f"  Total liabilities: ${liabilities_yearly[yr] + all_personal_loans[yr]}\n")
                    
                    # Step 6: Recalculate net worth with complete assets
                    net_worth[yr] = assets_yearly[yr] - (liabilities_yearly[yr] + all_personal_loans[yr])
                    
                    # CRITICAL FIX: Log detailed net worth calculation
                    with open('healthcare_debug.log', 'a') as networth_f:
                        networth_f.write(f"\n[DETAILED NET WORTH] Year {yr}:\n")
                        networth_f.write(f"  Assets: ${assets_yearly[yr]}\n")
                        networth_f.write(f"  Liabilities: ${liabilities_yearly[yr]}\n")
                        networth_f.write(f"  Personal Loans: ${all_personal_loans[yr]}\n")
                        networth_f.write(f"  Net Worth = ${assets_yearly[yr]} - (${liabilities_yearly[yr]} + ${all_personal_loans[yr]}) = ${net_worth[yr]}\n")
                        
                        # Add cash flow info
                        if yr > 0:
                            networth_f.write(f"  Cash Flow (year {yr}): ${cash_flow_yearly[yr]}\n")
                            networth_f.write(f"  Previous Net Worth (year {yr-1}): ${net_worth[yr-1]}\n")
                            networth_f.write(f"  Net Worth Increase/Decrease: ${net_worth[yr] - net_worth[yr-1]}\n")
                
                # Log the updated values
                f.write("\nUpdated values after sync:\n")
                for yr in range(0, self.years_to_project + 1):
                    f.write(f"Year {yr}: Array=${savings_value_yearly[yr]}, Asset=${savings_asset.get_value(yr)}\n")
                
                f.write("\nUpdated assets and net worth:\n")
                for yr in range(0, self.years_to_project + 1):
                    f.write(f"Year {yr}: Assets=${assets_yearly[yr]}, NetWorth=${net_worth[yr]}\n")
        
        # Debug healthcare expenses before adding to results
        with open('healthcare_debug.log', 'a') as f:
            f.write(f"\nBefore adding to results:\n")
            f.write(f"- All healthcare expenses by year: {healthcare_expenses_yearly}\n")
            f.write(f"- Individual expense values in year 1:\n")
            
            # For each expense, check if it's healthcare and log year 1 value
            for expense in self.expenditures:
                expense_name = expense.name.lower()
                if 'health' in expense_name or 'medical' in expense_name:
                    try:
                        year1_expense = expense.get_expense(1) 
                        f.write(f"  * {expense.name}: {year1_expense}\n")
                        f.write(f"  * Type: {type(expense).__name__}, dict: {expense.__dict__}\n")
                        f.write(f"  * Expense name lowercase: '{expense_name}'\n")
                        f.write(f"  * In year 1, healthcare_expenses_yearly should include {year1_expense}\n")
                    except Exception as e:
                        f.write(f"  * ERROR getting expense for {expense.name}: {str(e)}\n")
            
            # Directly overwrite the healthcare expenses with the actual calculated values
            # This is a temporary fix to ensure healthcare expenses are properly reflected
            if len(self.expenditures) > 0:
                for i in range(1, self.years_to_project + 1):
                    for expense in self.expenditures:
                        expense_name = expense.name.lower()
                        if 'health' in expense_name or 'medical' in expense_name:
                            try:
                                healthcare_expenses_yearly[i] = int(expense.get_expense(i))
                                f.write(f"Manually set healthcare_expenses_yearly[{i}] = {healthcare_expenses_yearly[i]}\n")
                            except Exception as e:
                                f.write(f"ERROR manually setting healthcare_expenses_yearly[{i}]: {str(e)}\n")
                                
            f.write(f"After manual correction: {healthcare_expenses_yearly}\n")
            
        # Debug savings value tracking before compiling results
        with open('healthcare_debug.log', 'a') as f:
            f.write("\n\n=== SAVINGS VALUES FOR EACH YEAR (FINAL VALUES) ===\n")
            for i in range(self.years_to_project + 1):
                f.write(f"Year {i}: ${savings_value_yearly[i]}\n")
            
            # Find the savings asset and print its values as well
            savings_asset = None
            for asset in self.assets:
                if isinstance(asset, Investment) and 'savings' in asset.name.lower():
                    savings_asset = asset
                    break
            
            if savings_asset:
                f.write("\n=== SAVINGS ASSET VALUES FROM CLASS (FINAL VALUES) ===\n")
                for i in range(self.years_to_project + 1):
                    f.write(f"Year {i}: ${savings_asset.get_value(i)}\n")
            else:
                f.write("\nNo savings asset found to compare against savings_value_yearly array\n")

        # Compile results
        self.results = {
            'ages': ages,
            'netWorth': net_worth,
            'income': income_yearly,
            'expenses': expenses_yearly,
            'assets': assets_yearly,
            'liabilities': liabilities_yearly,
            'cashFlow': cash_flow_yearly,
            
            # Asset breakdown
            'homeValue': home_value_yearly,
            'carValue': car_value_yearly,
            'savingsValue': savings_value_yearly,  # Add explicit savings tracking
            
            # Liability breakdown
            'mortgage': mortgage_yearly,
            'carLoan': car_loan_yearly,
            'studentLoan': student_loan_yearly,
            'personalLoans': all_personal_loans,
            
            # Base cost of living categories
            'housing': housing_expenses_yearly,
            'transportation': transportation_expenses_yearly,
            'food': food_expenses_yearly,
            'healthcare': healthcare_expenses_yearly,
            'personalInsurance': personal_insurance_expenses_yearly,
            'apparel': apparel_expenses_yearly,
            'services': services_expenses_yearly,
            'entertainment': entertainment_expenses_yearly,
            'other': other_expenses_yearly,
            
            # Milestone-driven categories
            'education': education_expenses_yearly,
            'childcare': child_expenses_yearly,
            'debt': debt_expenses_yearly,
            'discretionary': discretionary_expenses_yearly,
            
            'milestones': self.milestones
        }
        
        return self.results
    
    def to_json(self) -> str:
        """Convert calculation results to JSON string."""
        return json.dumps(self.results)
    
    @classmethod
    def from_input_data(cls, input_data: Dict[str, Any]) -> 'FinancialCalculator':
        """
        Create a calculator from input data.
        
        This method supports location-based adjustments via the 'costOfLivingFactor' parameter.
        When provided, this factor (typically in the range of 0.7-1.3) affects:
        1. Income amounts - adjusted directly in this method (higher factor = higher income)
        2. Expense amounts - should be pre-adjusted by the frontend before sending to this calculator
        
        The factor represents the relative cost of living in the user's location:
        - Values > 1.0 indicate higher-cost areas (e.g., 1.2 = 20% higher than average)
        - Values < 1.0 indicate lower-cost areas (e.g., 0.8 = 20% lower than average)
        
        Args:
            input_data: Dictionary with financial inputs including 'costOfLivingFactor' if available
            
        Returns:
            Configured calculator instance
        """
        start_age = input_data.get('startAge', 25)
        years_to_project = input_data.get('yearsToProject', 10)
        calculator = cls(start_age, years_to_project)
        
        # Extract cost of living factor if present 
        # This factor adjusts income based on location data from the frontend
        cost_of_living_factor = input_data.get('costOfLivingFactor', 1.0)
        
        # Log the cost of living factor for debugging
        with open('healthcare_debug.log', 'w') as f:
            f.write(f"Starting financial calculation with costOfLivingFactor: {cost_of_living_factor}\n")
        
        # Add assets
        for asset_data in input_data.get('assets', []):
            asset_type = asset_data.get('type', 'investment')
            name = asset_data.get('name', f'Asset {asset_type}')
            initial_value = asset_data.get('initialValue', 0)
            
            if asset_type == 'depreciable' or asset_type == 'car':
                depreciation_rate = asset_data.get('depreciationRate', 0.15)  # 15% annual depreciation
                asset = DepreciableAsset(name, initial_value, depreciation_rate)
            else:  # Default to investment asset
                growth_rate = asset_data.get('growthRate', 0.03)  # 3% annual growth
                asset = Investment(name, initial_value, growth_rate)
            
            calculator.add_asset(asset)
        
        # Add liabilities
        for liability_data in input_data.get('liabilities', []):
            liability_type = liability_data.get('type', 'generic')
            name = liability_data.get('name', f'Liability {liability_type}')
            initial_balance = liability_data.get('initialBalance', 0)
            interest_rate = liability_data.get('interestRate', 0.05)  # 5% interest rate
            term_years = liability_data.get('termYears', 10)
            
            if liability_type == 'mortgage':
                property_value = liability_data.get('propertyValue', initial_balance * 1.25)
                liability = Mortgage(name, initial_balance, interest_rate, term_years, property_value)
            elif liability_type == 'studentLoan':
                deferment_years = liability_data.get('defermentYears', 0)
                subsidized = liability_data.get('subsidized', False)
                liability = StudentLoan(name, initial_balance, interest_rate, term_years, deferment_years, subsidized)
            elif liability_type == 'autoLoan' or liability_type == 'carLoan':
                vehicle_value = liability_data.get('vehicleValue', initial_balance * 1.1)
                liability = AutoLoan(name, initial_balance, interest_rate, term_years, vehicle_value)
            else:  # Default to generic liability
                liability = Liability(name, initial_balance, interest_rate, term_years)
            
            calculator.add_liability(liability)
        
        # Add incomes
        for income_data in input_data.get('incomes', []):
            income_type = income_data.get('type', 'salary')
            name = income_data.get('name', f'Income {income_type}')
            annual_amount = income_data.get('annualAmount', 0)
            
            # Apply the cost of living factor to income amount
            # This adjusts income based on location
            # Higher factor (>1.0) for expensive areas means higher income
            # Lower factor (<1.0) for less expensive areas means lower income
            location_adjusted_amount = annual_amount * cost_of_living_factor
            
            # Log the adjustment for debugging
            with open('healthcare_debug.log', 'a') as f:
                f.write(f"Income adjustment: {name} - original: ${annual_amount} → adjusted: ${location_adjusted_amount:.2f} (factor: {cost_of_living_factor})\n")
            
            growth_rate = income_data.get('growthRate', 0.03)  # 3% annual growth
            start_year = income_data.get('startYear', 0)
            end_year = income_data.get('endYear', None)
            
            if income_type == 'salary':
                bonus_percent = income_data.get('bonus_percent', 0)
                # Use location-adjusted amount instead of original annual_amount
                income = SalaryIncome(name, location_adjusted_amount, growth_rate, start_year, end_year, bonus_percent)
            elif income_type == 'spouse':
                # Note: Spouse income is typically handled through milestones instead
                # Use location-adjusted amount instead of original annual_amount
                income = SpouseIncome(name, location_adjusted_amount, growth_rate, start_year, end_year)
            else:  # Default to generic income
                # Use location-adjusted amount instead of original annual_amount
                income = Income(name, location_adjusted_amount, growth_rate, start_year, end_year)
            
            calculator.add_income(income)
        
        # Add more detailed income adjustments to the log
        with open('healthcare_debug.log', 'a') as f:
            f.write("\nAdding expenditures after income adjustments...\n")
            
        # Add expenditures
        for expenditure_data in input_data.get('expenditures', []):
            expenditure_type = expenditure_data.get('type', 'living')
            name = expenditure_data.get('name', f'Expense {expenditure_type}')
            annual_amount = expenditure_data.get('annualAmount', 0)
            inflation_rate = expenditure_data.get('inflationRate', 0.02)  # 2% annual inflation
            
            # Debug healthcare expenses
            is_healthcare = ('health' in name.lower() or 'medical' in name.lower())
            is_transportation = ('transport' in name.lower() or 'car' in name.lower() or expenditure_type == 'transportation')
            
            if is_healthcare:
                with open('healthcare_debug.log', 'a') as f:
                    f.write(f"Processing healthcare expenditure: {name}\n")
                    f.write(f"Type: {expenditure_type}, Annual Amount: {annual_amount}, Using HEALTHCARE_INFLATION_RATE: {HEALTHCARE_INFLATION_RATE}\n")
                # Use the healthcare inflation rate constant for healthcare expenses
                inflation_rate = HEALTHCARE_INFLATION_RATE
            
            if is_transportation and expenditure_type != 'transportation':
                # For transportation-named expenses that aren't explicitly typed as transportation
                with open('healthcare_debug.log', 'a') as f:
                    f.write(f"Processing transportation expenditure: {name}\n")
                    f.write(f"Type: {expenditure_type}, Annual Amount: {annual_amount}, Using TRANSPORTATION_INFLATION_RATE: {TRANSPORTATION_INFLATION_RATE}\n")
                # Use the transportation inflation rate constant
                inflation_rate = TRANSPORTATION_INFLATION_RATE
            
            if expenditure_type == 'housing':
                is_rent = 'rent' in name.lower()
                expenditure = Housing(name, annual_amount, inflation_rate, is_rent)
            elif expenditure_type == 'transportation':
                # Use our new constants for transportation expenses
                car_replacement_years = expenditure_data.get('car_replacement_years', CAR_REPLACEMENT_YEARS)
                car_replacement_cost = expenditure_data.get('car_replacement_cost', CAR_REPLACEMENT_COST)
                auto_replace = expenditure_data.get('auto_replace', CAR_AUTO_REPLACE)
                # Use the transportation inflation rate constant
                inflation_rate = TRANSPORTATION_INFLATION_RATE
                expenditure = Transportation(name, annual_amount, inflation_rate, car_replacement_years, car_replacement_cost, auto_replace)
            elif expenditure_type == 'tax':
                tax_rate = expenditure_data.get('tax_rate', 0.25)
                income_sources = expenditure_data.get('income_sources', [])
                expenditure = Tax(name, annual_amount, tax_rate, income_sources)
            else:  # Default to living expenses
                lifestyle_factor = expenditure_data.get('lifestyle_factor', 1.0)
                expenditure = Living(name, annual_amount, inflation_rate, lifestyle_factor)
                
                # Special debug for healthcare expenses
                if is_healthcare:
                    with open('healthcare_debug.log', 'a') as f:
                        f.write(f"Created Living expense for healthcare: {name}, annual_amount={annual_amount}\n")
                        f.write(f"Expense type={type(expenditure).__name__}, expense={expenditure.annual_amount}\n")
                        f.write(f"Debugging object: {expenditure.__dict__}\n")
            
            calculator.add_expenditure(expenditure)
            
            # Check after adding expense
            if is_healthcare:
                with open('healthcare_debug.log', 'a') as f:
                    f.write(f"Added healthcare expense to calculator, count={len(calculator.expenditures)}\n")
                    for i, exp in enumerate(calculator.expenditures):
                        f.write(f"Expense {i}: name={exp.name}, amount={exp.annual_amount}, type={type(exp).__name__}\n")
                        
                    # Try getting expenses for a few years
                    f.write("\nTesting healthcare expense calculations:\n")
                    for year in range(1, 4):
                        expense_amount = expenditure.get_expense(year)
                        f.write(f"Year {year} expense = {expense_amount}\n")
        
        # Add milestones
        for milestone_data in input_data.get('milestones', []):
            calculator.add_milestone(milestone_data)
          
        # Add debug logging
        with open('healthcare_debug.log', 'a') as f:
            f.write(f"\nFinancial calculator created from input data\n")
            
        # Just return the calculator object - don't run calculation here
        # The caller will run calculator.calculate_projection() as needed
        return calculator