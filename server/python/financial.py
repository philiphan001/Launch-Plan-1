"""
Financial core module for the FinancialFuture application.
This serves as the main entry point for financial calculations.
"""

import json
import os
from typing import Dict, List, Any, Optional

from server.python.models.asset import Asset, DepreciableAsset, Investment
from server.python.models.liability import Liability, Mortgage, StudentLoan, AutoLoan
from server.python.models.income import Income, SalaryIncome, SpouseIncome
from server.python.models.expenditure import Expenditure, Housing, Transportation, Living, Tax
from server.python.launch_plan_assumptions import (
    HOME_PURCHASE_RENT_REDUCTION,
    CAR_PURCHASE_TRANSPORTATION_REDUCTION,
    MARRIAGE_EXPENSE_INCREASE,
    GRADUATE_SCHOOL_INCOME_INCREASE,
    CHILD_EXPENSE_PER_YEAR,
    CHILD_INITIAL_EXPENSE,
    DEFAULT_EXPENSE_ALLOCATIONS
)

class FinancialCalculator:
    """
    Core financial calculator class that manages the overall financial projections.
    """
    def __init__(self):
        self.assets: List[Asset] = []
        self.liabilities: List[Liability] = []
        self.incomes: List[Income] = []
        self.expenditures: List[Expenditure] = []
        self.results: Dict[str, Any] = {}
        self.years_to_project: int = 10
        self.start_age: int = 18
        self.milestones: List[Dict[str, Any]] = []
        
    def add_asset(self, asset: Asset) -> None:
        """Add an asset to the financial calculator."""
        self.assets.append(asset)
        
    def add_liability(self, liability: Liability) -> None:
        """Add a liability to the financial calculator."""
        self.liabilities.append(liability)
        
    def add_income(self, income: Income) -> None:
        """Add an income source to the financial calculator."""
        self.incomes.append(income)
        
    def add_expenditure(self, expenditure: Expenditure) -> None:
        """Add an expenditure to the financial calculator."""
        self.expenditures.append(expenditure)
        
    def add_milestone(self, milestone: Dict[str, Any]) -> None:
        """Add a life milestone to the financial calculator."""
        self.milestones.append(milestone)
        
    def set_projection_years(self, years: int) -> None:
        """Set the number of years to project."""
        self.years_to_project = years
        
    def set_start_age(self, age: int) -> None:
        """Set the starting age for the projection."""
        self.start_age = age
        
    def calculate_projection(self) -> Dict[str, Any]:
        """
        Calculate the full financial projection based on all inputs.
        Returns a dictionary with projection data.
        """
        # Initialize yearly arrays
        years = range(self.years_to_project + 1)  # +1 to include the starting year
        ages = [self.start_age + year for year in years]
        net_worth = [0] * (self.years_to_project + 1)
        income_yearly = [0] * (self.years_to_project + 1)
        expenses_yearly = [0] * (self.years_to_project + 1)
        assets_yearly = [0] * (self.years_to_project + 1)
        liabilities_yearly = [0] * (self.years_to_project + 1)
        cash_flow_yearly = [0] * (self.years_to_project + 1)
        
        # Initialize asset breakdown arrays
        car_value_yearly = [0] * (self.years_to_project + 1)
        home_value_yearly = [0] * (self.years_to_project + 1)
        
        # Initialize liability breakdown arrays
        car_loan_yearly = [0] * (self.years_to_project + 1)
        mortgage_yearly = [0] * (self.years_to_project + 1)
        student_loan_yearly = [0] * (self.years_to_project + 1)
        
        # Initialize expense category breakdown arrays
        # Base cost of living categories (from location_cost_of_living table)
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
        
        # Set initial values
        for asset in self.assets:
            asset_value = int(asset.get_value(0))
            assets_yearly[0] += asset_value
            
            # Categorize assets by type
            if isinstance(asset, DepreciableAsset) and asset.name.lower().find('car') >= 0:
                car_value_yearly[0] += asset_value
            elif asset.name.lower().find('home') >= 0 or asset.name.lower().find('house') >= 0:
                home_value_yearly[0] += asset_value
            
        for liability in self.liabilities:
            liability_balance = int(liability.get_balance(0))
            liabilities_yearly[0] += liability_balance
            
            # Categorize liabilities by type
            if isinstance(liability, AutoLoan) or liability.name.lower().find('car') >= 0:
                car_loan_yearly[0] += liability_balance
            elif isinstance(liability, Mortgage) or liability.name.lower().find('mortgage') >= 0 or liability.name.lower().find('home') >= 0:
                mortgage_yearly[0] += liability_balance
            elif isinstance(liability, StudentLoan) or liability.name.lower().find('student') >= 0 or liability.name.lower().find('education') >= 0:
                student_loan_yearly[0] += liability_balance
            
        net_worth[0] = assets_yearly[0] - liabilities_yearly[0]
        
        # Calculate for each future year
        for year in years[1:]:
            # Income calculation
            year_income = 0
            for income_source in self.incomes:
                year_income += int(income_source.get_income(year))
            income_yearly[year] = year_income
            
            # Expense calculation with categorization
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
                expense_amount = int(expense.get_expense(year))
                year_expenses += expense_amount
                
                # Categorize expenses by type
                expense_name = expense.name.lower()
                
                # Base cost of living categories
                if isinstance(expense, Housing) or expense_name.find('housing') >= 0 or expense_name.find('rent') >= 0 or expense_name.find('mortgage') >= 0:
                    year_housing += expense_amount
                elif isinstance(expense, Transportation) or expense_name.find('transport') >= 0 or expense_name.find('car') >= 0:
                    year_transportation += expense_amount
                elif expense_name.find('food') >= 0:
                    year_food += expense_amount
                elif expense_name.find('health') >= 0 or expense_name.find('medical') >= 0:
                    year_healthcare += expense_amount
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
                    # Default to other expenses
                    year_other += expense_amount
                    
            expenses_yearly[year] = year_expenses
            
            # Base cost of living categories
            housing_expenses_yearly[year] = year_housing
            transportation_expenses_yearly[year] = year_transportation
            food_expenses_yearly[year] = year_food
            healthcare_expenses_yearly[year] = year_healthcare
            personal_insurance_expenses_yearly[year] = year_personal_insurance
            apparel_expenses_yearly[year] = year_apparel
            services_expenses_yearly[year] = year_services
            entertainment_expenses_yearly[year] = year_entertainment
            other_expenses_yearly[year] = year_other
            
            # Milestone-driven categories
            education_expenses_yearly[year] = year_education
            child_expenses_yearly[year] = year_childcare
            debt_expenses_yearly[year] = year_debt
            discretionary_expenses_yearly[year] = year_discretionary
            
            # Cash flow
            cash_flow_yearly[year] = year_income - year_expenses
            
            # Assets and liabilities
            year_assets = 0
            year_car_value = 0
            year_home_value = 0
            
            for asset in self.assets:
                # Update asset values based on cash flow if applicable
                if isinstance(asset, Investment) and cash_flow_yearly[year] > 0:
                    # Assume some of positive cash flow goes to investments
                    contribution_amount = int(cash_flow_yearly[year] * 0.2)  # 20% of positive cash flow
                    asset.add_contribution(contribution_amount, year)
                
                asset_value = int(asset.get_value(year))
                year_assets += asset_value
                
                # Categorize assets by type
                if isinstance(asset, DepreciableAsset) and asset.name.lower().find('car') >= 0:
                    year_car_value += asset_value
                elif asset.name.lower().find('home') >= 0 or asset.name.lower().find('house') >= 0:
                    year_home_value += asset_value
            
            assets_yearly[year] = year_assets
            car_value_yearly[year] = year_car_value
            home_value_yearly[year] = year_home_value
            
            year_liabilities = 0
            year_car_loan = 0
            year_mortgage = 0
            year_student_loan = 0
            
            for liability in self.liabilities:
                # Make payments from cash flow
                if cash_flow_yearly[year] > 0:
                    payment = int(min(liability.get_payment(year), cash_flow_yearly[year]))
                    liability.make_payment(payment, year)
                
                liability_balance = int(liability.get_balance(year))
                year_liabilities += liability_balance
                
                # Categorize liabilities by type
                if isinstance(liability, AutoLoan) or liability.name.lower().find('car') >= 0:
                    year_car_loan += liability_balance
                elif isinstance(liability, Mortgage) or liability.name.lower().find('mortgage') >= 0 or liability.name.lower().find('home') >= 0:
                    year_mortgage += liability_balance
                elif isinstance(liability, StudentLoan) or liability.name.lower().find('student') >= 0 or liability.name.lower().find('education') >= 0:
                    year_student_loan += liability_balance
            
            liabilities_yearly[year] = year_liabilities
            car_loan_yearly[year] = year_car_loan
            mortgage_yearly[year] = year_mortgage
            student_loan_yearly[year] = year_student_loan
            
            # Net worth
            net_worth[year] = assets_yearly[year] - liabilities_yearly[year]
            
        # Apply milestone effects
        for milestone in self.milestones:
            milestone_year = milestone.get('year', 0)
            if milestone_year < len(years):
                if milestone.get('type') == 'education':
                    # Education typically adds debt but increases income potential
                    if milestone.get('subtype') == 'college':
                        # Adjust future income
                        income_boost_factor = 1.5  # Example: 50% income boost post-college
                        for i in range(milestone_year + 4, self.years_to_project + 1):  # +4 years of college
                            income_yearly[i] = int(income_yearly[i] * income_boost_factor)
                
                elif milestone.get('type') == 'job':
                    # New job affects income
                    income_change = milestone.get('income_change', 0)
                    for i in range(milestone_year, self.years_to_project + 1):
                        income_yearly[i] += int(income_change)
                
                elif milestone.get('type') == 'marriage':
                    # Marriage adds spouse income, assets, and liabilities, but also has wedding costs
                    spouse_income = milestone.get('spouseIncome', 0)
                    spouse_assets = milestone.get('spouseAssets', 0)
                    spouse_liabilities = milestone.get('spouseLiabilities', 0)
                    wedding_cost = milestone.get('weddingCost', 20000)  # Default wedding cost if not specified
                    
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
                                
                                # Base cost of living categories
                                if isinstance(expense, Housing) or expense_name.find('housing') >= 0 or expense_name.find('rent') >= 0 or expense_name.find('mortgage') >= 0:
                                    year_housing += expense_amount
                                elif isinstance(expense, Transportation) or expense_name.find('transport') >= 0 or expense_name.find('car') >= 0:
                                    year_transportation += expense_amount
                                elif expense_name.find('food') >= 0:
                                    year_food += expense_amount
                                elif expense_name.find('health') >= 0 or expense_name.find('medical') >= 0:
                                    year_healthcare += expense_amount
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
                                    # Default to other expenses
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
                    # Housing/Home purchase affects assets and liabilities
                    house_value = int(milestone.get('value', milestone.get('homeValue', 0)))
                    down_payment = int(milestone.get('down_payment', milestone.get('homeDownPayment', 0)))
                    
                    # Apply down payment as one-time expense that reduces cash flow in the purchase year
                    expenses_yearly[milestone_year] += down_payment
                    cash_flow_yearly[milestone_year] = income_yearly[milestone_year] - expenses_yearly[milestone_year]
                    
                    # Adjust savings/investments due to down payment (find investment assets and reduce them)
                    investment_reduced = False
                    for asset in self.assets:
                        if isinstance(asset, Investment) and not investment_reduced:
                            asset_value = asset.get_value(milestone_year)
                            if asset_value >= down_payment:
                                # Reduce the investment by the down payment amount
                                asset.value_history[milestone_year] = asset_value - down_payment
                                investment_reduced = True
                    
                    # Find and turn off rent expenses since the user now owns a home
                    for expense in self.expenditures:
                        if isinstance(expense, Housing) or expense.name.lower().find('rent') >= 0:
                            # Set rent expense to zero for all years after home purchase
                            for i in range(milestone_year, self.years_to_project + 1):
                                expense.expense_history[i] = expense.expense_history.get(i, expense.annual_amount) * (1 - HOME_PURCHASE_RENT_REDUCTION)
                    
                    for i in range(milestone_year, self.years_to_project + 1):
                        assets_yearly[i] += house_value
                        home_value_yearly[i] += house_value
                        
                        # Calculate remaining mortgage and convert to int
                        remaining_mortgage = int((house_value - down_payment) * max(0, 1 - (i - milestone_year) * 0.03))
                        liabilities_yearly[i] += remaining_mortgage
                        mortgage_yearly[i] += remaining_mortgage  # Add to mortgage category
                        
                        # Update net worth
                        net_worth[i] = assets_yearly[i] - liabilities_yearly[i]
                        
                        # Recalculate total expenses and categories for this year since we've modified housing expenses
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
                            if isinstance(expense, Housing) or expense.name.lower().find('housing') >= 0 or expense.name.lower().find('rent') >= 0 or expense.name.lower().find('mortgage') >= 0:
                                year_housing += expense_amount
                            elif isinstance(expense, Transportation) or expense.name.lower().find('transport') >= 0 or expense.name.lower().find('car') >= 0:
                                year_transportation += expense_amount
                            elif expense.name.lower().find('food') >= 0:
                                year_food += expense_amount
                            elif expense.name.lower().find('health') >= 0 or expense.name.lower().find('medical') >= 0:
                                year_healthcare += expense_amount
                            elif expense.name.lower().find('education') >= 0 or expense.name.lower().find('college') >= 0 or expense.name.lower().find('school') >= 0:
                                year_education += expense_amount
                            elif expense.name.lower().find('child') >= 0 or expense.name.lower().find('daycare') >= 0:
                                year_childcare += expense_amount
                            elif expense.name.lower().find('debt') >= 0 or expense.name.lower().find('loan') >= 0:
                                year_debt += expense_amount
                            else:
                                # Default to discretionary for any other expenses
                                year_discretionary += expense_amount
                                
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
                
                elif milestone.get('type') == 'car':
                    # Car purchase affects assets (with depreciation) and liabilities
                    car_value = int(milestone.get('carValue', 0))
                    down_payment = int(milestone.get('carDownPayment', 0))
                    
                    # Apply down payment as a one-time expense in the purchase year
                    expenses_yearly[milestone_year] += down_payment
                    cash_flow_yearly[milestone_year] = income_yearly[milestone_year] - expenses_yearly[milestone_year]
                    
                    # Reduce savings/investments for the down payment
                    investment_reduced = False
                    for asset in self.assets:
                        if isinstance(asset, Investment) and not investment_reduced:
                            asset_value = asset.get_value(milestone_year)
                            if asset_value >= down_payment:
                                # Reduce the investment by the down payment amount
                                asset.value_history[milestone_year] = asset_value - down_payment
                                investment_reduced = True
                    
                    # Reduce transportation expenses when buying a car
                    for expense in self.expenditures:
                        if isinstance(expense, Transportation) or expense.name.lower().find('transport') >= 0:
                            # Reduce transportation expenses (like public transit, rideshares, etc.) when buying a car
                            for i in range(milestone_year, self.years_to_project + 1):
                                expense.expense_history[i] = expense.expense_history.get(i, expense.annual_amount) * (1 - CAR_PURCHASE_TRANSPORTATION_REDUCTION)
                    
                    for i in range(milestone_year, self.years_to_project + 1):
                        # Cars depreciate quickly (15% per year)
                        years_owned = i - milestone_year
                        # Calculate car value with depreciation
                        depreciated_value = int(car_value * max(0.1, 0.85 ** years_owned))  # Minimum 10% of value
                        assets_yearly[i] += depreciated_value
                        car_value_yearly[i] += depreciated_value  # Add to car value category
                        
                        # Car loan typically 5 years
                        if years_owned < 5:
                            # Calculate remaining car loan with payments and convert to int
                            car_loan_amount = int((car_value - down_payment) * (1 - years_owned / 5))
                            liabilities_yearly[i] += car_loan_amount
                            car_loan_yearly[i] += car_loan_amount  # Add to car loan category
                        
                        # Update net worth
                        net_worth[i] = assets_yearly[i] - liabilities_yearly[i]
                        
                        # Recalculate total expenses and categories for this year since we've modified transportation expenses
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
                            if isinstance(expense, Housing) or expense.name.lower().find('housing') >= 0 or expense.name.lower().find('rent') >= 0 or expense.name.lower().find('mortgage') >= 0:
                                year_housing += expense_amount
                            elif isinstance(expense, Transportation) or expense.name.lower().find('transport') >= 0 or expense.name.lower().find('car') >= 0:
                                year_transportation += expense_amount
                            elif expense.name.lower().find('food') >= 0:
                                year_food += expense_amount
                            elif expense.name.lower().find('health') >= 0 or expense.name.lower().find('medical') >= 0:
                                year_healthcare += expense_amount
                            elif expense.name.lower().find('education') >= 0 or expense.name.lower().find('college') >= 0 or expense.name.lower().find('school') >= 0:
                                year_education += expense_amount
                            elif expense.name.lower().find('child') >= 0 or expense.name.lower().find('daycare') >= 0:
                                year_childcare += expense_amount
                            elif expense.name.lower().find('debt') >= 0 or expense.name.lower().find('loan') >= 0:
                                year_debt += expense_amount
                            else:
                                # Default to discretionary for any other expenses
                                year_discretionary += expense_amount
                                
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
                
                elif milestone.get('type') == 'children':
                    # Children affect expenses
                    children_count = int(milestone.get('childrenCount', 1))
                    expense_per_child = int(milestone.get('childrenExpensePerYear', CHILD_EXPENSE_PER_YEAR))
                    initial_expense = int(milestone.get('initialExpense', CHILD_INITIAL_EXPENSE) * children_count)  # Birth/adoption costs, baby supplies, etc.
                    
                    # Apply initial one-time expense for having a child (medical costs, supplies, etc.)
                    expenses_yearly[milestone_year] += initial_expense
                    cash_flow_yearly[milestone_year] = income_yearly[milestone_year] - expenses_yearly[milestone_year]
                    
                    # Reduce savings/investments for the initial child-related expenses
                    investment_reduced = False
                    for asset in self.assets:
                        if isinstance(asset, Investment) and not investment_reduced:
                            asset_value = asset.get_value(milestone_year)
                            if asset_value >= initial_expense:
                                # Reduce the investment by the initial expense amount
                                asset.value_history[milestone_year] = asset_value - initial_expense
                                investment_reduced = True
                    
                    for i in range(milestone_year, self.years_to_project + 1):
                        # Add child expenses to yearly expenses
                        years_with_children = i - milestone_year
                        # Children costs increase with age
                        annual_child_expenses = int(children_count * expense_per_child * (1 + years_with_children * 0.03))
                        expenses_yearly[i] += annual_child_expenses
                        
                        # Update child expense category
                        child_expenses_yearly[i] += annual_child_expenses
                        
                        # Recalculate cash flow with new expenses
                        cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
                
                elif milestone.get('type') == 'education':
                    # Education affects expenses and possibly income
                    education_cost = int(milestone.get('educationCost', 30000))
                    
                    # Determine how much is paid from savings vs loans
                    payment_from_savings_percent = milestone.get('paymentFromSavings', 0.3)  # Default 30% from savings
                    upfront_payment = int(education_cost * payment_from_savings_percent)
                    
                    # Apply upfront payment as a one-time expense (first semester/year tuition)
                    expenses_yearly[milestone_year] += upfront_payment
                    cash_flow_yearly[milestone_year] = income_yearly[milestone_year] - expenses_yearly[milestone_year]
                    
                    # Reduce savings/investments for the education cost
                    investment_reduced = False
                    for asset in self.assets:
                        if isinstance(asset, Investment) and not investment_reduced:
                            asset_value = asset.get_value(milestone_year)
                            if asset_value >= upfront_payment:
                                # Reduce the investment by the upfront payment amount
                                asset.value_history[milestone_year] = asset_value - upfront_payment
                                investment_reduced = True
                    
                    # Education typically takes 2-4 years, we'll assume 4
                    yearly_payment = int((education_cost - upfront_payment) / 4)  # Remaining cost spread over 4 years
                    for i in range(milestone_year, min(milestone_year + 4, self.years_to_project + 1)):
                        # Add remaining education expenses
                        expenses_yearly[i] += yearly_payment
                        
                        # Update education expense category
                        education_expenses_yearly[i] += yearly_payment
                        
                        # Recalculate cash flow
                        cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
                    
                    # After education, increase income potential (starting from graduation year)
                    graduation_year = milestone_year + 4
                    if graduation_year <= self.years_to_project:
                        # Use the graduate school income increase constant
                        income_boost_factor = 1 + GRADUATE_SCHOOL_INCOME_INCREASE  # e.g. 15% increase
                        for i in range(graduation_year, self.years_to_project + 1):
                            # Apply income boost after graduation
                            income_yearly[i] = int(income_yearly[i] * income_boost_factor)
                            
                            # Recalculate cash flow with new income
                            cash_flow_yearly[i] = income_yearly[i] - expenses_yearly[i]
        
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
        Create a FinancialCalculator instance from input data.
        
        Args:
            input_data: Dictionary containing financial input parameters.
            
        Returns:
            Configured FinancialCalculator instance.
        """
        calculator = cls()
        
        # Set basic parameters
        calculator.set_start_age(input_data.get('startAge', 18))
        calculator.set_projection_years(input_data.get('yearsToProject', 10))
        
        # Add assets
        if 'assets' in input_data:
            for asset_data in input_data['assets']:
                asset_type = asset_data.get('type', '')
                if asset_type == 'depreciable':
                    asset = DepreciableAsset(
                        name=asset_data.get('name', ''),
                        initial_value=asset_data.get('initialValue', 0),
                        depreciation_rate=asset_data.get('depreciationRate', 0.1)
                    )
                elif asset_type == 'investment':
                    asset = Investment(
                        name=asset_data.get('name', ''),
                        initial_value=asset_data.get('initialValue', 0),
                        growth_rate=asset_data.get('growthRate', 0.07)
                    )
                else:
                    asset = Asset(
                        name=asset_data.get('name', ''),
                        initial_value=asset_data.get('initialValue', 0)
                    )
                calculator.add_asset(asset)
        
        # Add liabilities
        if 'liabilities' in input_data:
            for liability_data in input_data['liabilities']:
                liability_type = liability_data.get('type', '')
                if liability_type == 'mortgage':
                    liability = Mortgage(
                        name=liability_data.get('name', ''),
                        initial_balance=liability_data.get('initialBalance', 0),
                        interest_rate=liability_data.get('interestRate', 0.04),
                        term_years=liability_data.get('termYears', 30)
                    )
                elif liability_type == 'studentLoan':
                    liability = StudentLoan(
                        name=liability_data.get('name', ''),
                        initial_balance=liability_data.get('initialBalance', 0),
                        interest_rate=liability_data.get('interestRate', 0.05),
                        term_years=liability_data.get('termYears', 10)
                    )
                elif liability_type == 'autoLoan':
                    liability = AutoLoan(
                        name=liability_data.get('name', ''),
                        initial_balance=liability_data.get('initialBalance', 0),
                        interest_rate=liability_data.get('interestRate', 0.06),
                        term_years=liability_data.get('termYears', 5)
                    )
                else:
                    liability = Liability(
                        name=liability_data.get('name', ''),
                        initial_balance=liability_data.get('initialBalance', 0),
                        interest_rate=liability_data.get('interestRate', 0.05),
                        term_years=liability_data.get('termYears', 10)
                    )
                calculator.add_liability(liability)
        
        # Add income sources
        if 'incomes' in input_data:
            for income_data in input_data['incomes']:
                income_type = income_data.get('type', '')
                if income_type == 'salary':
                    income = SalaryIncome(
                        name=income_data.get('name', ''),
                        annual_amount=income_data.get('annualAmount', 0),
                        growth_rate=income_data.get('growthRate', 0.03),
                        start_year=income_data.get('startYear', 0),
                        end_year=income_data.get('endYear')
                    )
                elif income_type == 'spouse':
                    income = SpouseIncome(
                        name=income_data.get('name', ''),
                        annual_amount=income_data.get('annualAmount', 0),
                        growth_rate=income_data.get('growthRate', 0.03),
                        start_year=income_data.get('startYear', 0),
                        end_year=income_data.get('endYear')
                    )
                else:
                    income = Income(
                        name=income_data.get('name', ''),
                        annual_amount=income_data.get('annualAmount', 0),
                        growth_rate=income_data.get('growthRate', 0.02),
                        start_year=income_data.get('startYear', 0),
                        end_year=income_data.get('endYear')
                    )
                calculator.add_income(income)
        
        # Add expenditures
        # Handle expenditures - either from input data or auto-generate based on income
        if 'expenditures' in input_data and input_data['expenditures']:
            # Use provided expenditures if available
            for expenditure_data in input_data['expenditures']:
                expenditure_type = expenditure_data.get('type', '')
                if expenditure_type == 'housing':
                    expenditure = Housing(
                        name=expenditure_data.get('name', ''),
                        annual_amount=expenditure_data.get('annualAmount', 0),
                        inflation_rate=expenditure_data.get('inflationRate', 0.03)
                    )
                elif expenditure_type == 'transportation':
                    expenditure = Transportation(
                        name=expenditure_data.get('name', ''),
                        annual_amount=expenditure_data.get('annualAmount', 0),
                        inflation_rate=expenditure_data.get('inflationRate', 0.03)
                    )
                elif expenditure_type == 'living':
                    expenditure = Living(
                        name=expenditure_data.get('name', ''),
                        annual_amount=expenditure_data.get('annualAmount', 0),
                        inflation_rate=expenditure_data.get('inflationRate', 0.03)
                    )
                elif expenditure_type == 'tax':
                    expenditure = Tax(
                        name=expenditure_data.get('name', ''),
                        annual_amount=expenditure_data.get('annualAmount', 0),
                        tax_rate=expenditure_data.get('taxRate', 0.25)
                    )
                else:
                    expenditure = Expenditure(
                        name=expenditure_data.get('name', ''),
                        annual_amount=expenditure_data.get('annualAmount', 0),
                        inflation_rate=expenditure_data.get('inflationRate', 0.02)
                    )
                calculator.add_expenditure(expenditure)
        else:
            # Auto-generate expenditures based on income and default allocations
            # Calculate total income for year 0
            total_income = 0
            for income in calculator.incomes:
                total_income += income.get_income(0)
            
            # If we have income, create default expense categories
            if total_income > 0:
                # Housing expense
                housing_amount = total_income * DEFAULT_EXPENSE_ALLOCATIONS['housing']
                calculator.add_expenditure(Housing(
                    name="Rent/Housing",
                    annual_amount=housing_amount,
                    inflation_rate=0.03
                ))
                
                # Transportation expense
                transport_amount = total_income * DEFAULT_EXPENSE_ALLOCATIONS['transportation']
                calculator.add_expenditure(Transportation(
                    name="Transportation",
                    annual_amount=transport_amount,
                    inflation_rate=0.03
                ))
                
                # Food expense
                food_amount = total_income * DEFAULT_EXPENSE_ALLOCATIONS['food']
                calculator.add_expenditure(Living(
                    name="Food",
                    annual_amount=food_amount,
                    inflation_rate=0.03
                ))
                
                # Healthcare expense
                healthcare_amount = total_income * DEFAULT_EXPENSE_ALLOCATIONS['healthcare']
                calculator.add_expenditure(Living(
                    name="Healthcare",
                    annual_amount=healthcare_amount,
                    inflation_rate=0.04  # Healthcare costs rise faster than general inflation
                ))
                
                # Discretionary expense
                discretionary_amount = total_income * DEFAULT_EXPENSE_ALLOCATIONS['discretionary']
                calculator.add_expenditure(Expenditure(
                    name="Discretionary",
                    annual_amount=discretionary_amount,
                    inflation_rate=0.02
                ))
                
                # Default Tax (25% of income)
                calculator.add_expenditure(Tax(
                    name="Taxes",
                    annual_amount=total_income * 0.25,
                    tax_rate=0.25
                ))
        
        # Add milestones
        if 'milestones' in input_data:
            for milestone in input_data['milestones']:
                calculator.add_milestone(milestone)
        
        return calculator
