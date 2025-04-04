"""
Financial calculator module for the FinancialFuture application.
This module contains the calculator class responsible for generating financial projections.
"""

import json
import logging
from typing import Dict, Any, List, Optional, Union, Callable

try:
    # First try direct imports (these will work when executed directly)
    from models.asset import Asset, DepreciableAsset, Investment
    from models.liability import Liability, Mortgage, StudentLoan, AutoLoan
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
    from server.python.models.liability import Liability, Mortgage, StudentLoan, AutoLoan
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
        income_yearly = [0] * (self.years_to_project + 1)
        expenses_yearly = [0] * (self.years_to_project + 1)
        cash_flow_yearly = [0] * (self.years_to_project + 1)
        
        # Track specific assets and liabilities
        home_value_yearly = [0] * (self.years_to_project + 1)
        car_value_yearly = [0] * (self.years_to_project + 1)
        mortgage_yearly = [0] * (self.years_to_project + 1)
        car_loan_yearly = [0] * (self.years_to_project + 1)
        student_loan_yearly = [0] * (self.years_to_project + 1)
        
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
            assets_yearly[0] += asset_value
            
            # Categorize assets
            if isinstance(asset, Investment) and (asset.name.lower().find('home') >= 0 or asset.name.lower().find('house') >= 0):
                home_value_yearly[0] += asset_value
            elif isinstance(asset, DepreciableAsset) and (asset.name.lower().find('car') >= 0 or asset.name.lower().find('vehicle') >= 0):
                car_value_yearly[0] += asset_value
        
        # Sum all liability balances for year 0
        for liability in self.liabilities:
            liability_balance = liability.get_balance(0)
            liabilities_yearly[0] += liability_balance
            
            # Categorize liabilities
            if isinstance(liability, Mortgage):
                mortgage_yearly[0] += liability_balance
            elif isinstance(liability, AutoLoan):
                car_loan_yearly[0] += liability_balance
            elif isinstance(liability, StudentLoan):
                student_loan_yearly[0] += liability_balance
        
        # Calculate initial net worth
        net_worth[0] = assets_yearly[0] - liabilities_yearly[0]
        
        # Project for each year
        for i in range(1, self.years_to_project + 1):
            # Age increases each year
            age = self.start_age + i
            
            # Calculate asset values for this year
            for asset in self.assets:
                asset_value = asset.get_value(i)
                assets_yearly[i] += asset_value
                
                # Categorize assets
                if isinstance(asset, Investment) and (asset.name.lower().find('home') >= 0 or asset.name.lower().find('house') >= 0):
                    home_value_yearly[i] += asset_value
                elif isinstance(asset, DepreciableAsset) and (asset.name.lower().find('car') >= 0 or asset.name.lower().find('vehicle') >= 0):
                    car_value_yearly[i] += asset_value
            
            # Calculate liability balances for this year
            for liability in self.liabilities:
                liability_balance = liability.get_balance(i)
                liabilities_yearly[i] += liability_balance
                
                # Categorize liabilities
                if isinstance(liability, Mortgage):
                    mortgage_yearly[i] += liability_balance
                elif isinstance(liability, AutoLoan):
                    car_loan_yearly[i] += liability_balance
                elif isinstance(liability, StudentLoan):
                    student_loan_yearly[i] += liability_balance
            
            # Calculate income for this year
            for income in self.incomes:
                income_amount = income.get_income(i)
                income_yearly[i] += income_amount
            
            # Calculate expenses for this year
            for expense in self.expenditures:
                expense_amount = expense.get_expense(i)
                expenses_yearly[i] += expense_amount
            
            # Calculate cash flow for this year
            cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
            
            # Calculate net worth for this year
            net_worth[i] = assets_yearly[i] - liabilities_yearly[i]
            
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
                        
                        # Apply wedding cost as a one-time expense
                        expenses_yearly[milestone_year] += wedding_cost
                        cash_flow_yearly[milestone_year] = income_yearly[milestone_year] - expenses_yearly[milestone_year]
                        
                        # Reduce savings/investments for the wedding cost
                        investment_reduced = False
                        for asset in self.assets:
                            if isinstance(asset, Investment) and not investment_reduced:
                                asset_value = asset.get_value(milestone_year)
                                if asset_value >= wedding_cost:
                                    # Reduce the investment by the wedding cost
                                    asset.value_history[milestone_year] = asset_value - wedding_cost
                                    investment_reduced = True
                        
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
                            net_worth[i] = assets_yearly[i] - liabilities_yearly[i]
                            
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
                        
                        with open('healthcare_debug.log', 'a') as f:
                            f.write(f"\nProcessing home purchase milestone in year {milestone_year}:\n")
                            f.write(f"- Home value: ${home_value}\n")
                            f.write(f"- Down payment: ${home_down_payment}\n")
                            f.write(f"- Mortgage loan: ${home_loan_principal}\n")
                            f.write(f"- Annual payment: ${home_annual_payment}\n")
                        
                        # Add home as an asset (appreciating at 3% annually)
                        # And add mortgage as a liability
                        mortgage_term = MORTGAGE_TERM_YEARS
                        mortgage_interest_rate = MORTGAGE_INTEREST_RATE
                        
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
                            assets_yearly[i] += appreciated_value
                            liabilities_yearly[i] += remaining_principal
                            
                            # Apply housing expense changes
                            # 1. Reduce base housing expenses (rent) after home purchase
                            housing_expense_reduction = int(housing_expenses_yearly[i] * home_rent_reduction)
                            housing_expenses_yearly[i] -= housing_expense_reduction
                            
                            # 2. Add mortgage payment to housing expenses
                            housing_expenses_yearly[i] += home_annual_payment
                            
                            # 3. Add mortgage payment to debt expenses
                            debt_expenses_yearly[i] += home_annual_payment
                            
                            # Log changes
                            with open('healthcare_debug.log', 'a') as f:
                                if i == milestone_year:  # Only log the first year to avoid excessive logging
                                    f.write(f"After home purchase:\n")
                                    f.write(f"- Reduced housing expenses (rent) by ${housing_expense_reduction}\n")
                                    f.write(f"- Added mortgage payment of ${home_annual_payment}\n")
                                    f.write(f"- Home value: ${appreciated_value}\n")
                                    f.write(f"- Mortgage principal: ${remaining_principal}\n")
                                    
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
                            net_worth[i] = assets_yearly[i] - liabilities_yearly[i]
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
                            
                            # Add car payment to expenses for the loan term
                            if loan_years_passed < loan_term:
                                expenses_yearly[i] += car_annual_payment
                                
                                # Add car payment to debt expenses category
                                debt_expenses_yearly[i] += car_annual_payment
                            
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
                            net_worth[i] = assets_yearly[i] - liabilities_yearly[i]
                            
                            # Update cash flow
                            cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
        
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
            
            # Liability breakdown
            'mortgage': mortgage_yearly,
            'carLoan': car_loan_yearly,
            'studentLoan': student_loan_yearly,
            
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
        
        Args:
            input_data: Dictionary with financial inputs
            
        Returns:
            Configured calculator instance
        """
        start_age = input_data.get('startAge', 25)
        years_to_project = input_data.get('yearsToProject', 10)
        calculator = cls(start_age, years_to_project)
        
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
            growth_rate = income_data.get('growthRate', 0.03)  # 3% annual growth
            start_year = income_data.get('startYear', 0)
            end_year = income_data.get('endYear', None)
            
            if income_type == 'salary':
                bonus_percent = income_data.get('bonus_percent', 0)
                income = SalaryIncome(name, annual_amount, growth_rate, start_year, end_year, bonus_percent)
            elif income_type == 'spouse':
                # Note: Spouse income is typically handled through milestones instead
                income = SpouseIncome(name, annual_amount, growth_rate, start_year, end_year)
            else:  # Default to generic income
                income = Income(name, annual_amount, growth_rate, start_year, end_year)
            
            calculator.add_income(income)
        
        # Debug empty the log file
        with open('healthcare_debug.log', 'w') as f:
            f.write("Starting financial calculation\n")
            
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
        
        return calculator