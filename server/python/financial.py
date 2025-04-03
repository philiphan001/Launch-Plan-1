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
        
        # Set initial values
        for asset in self.assets:
            assets_yearly[0] += asset.get_value(0)
            
        for liability in self.liabilities:
            liabilities_yearly[0] += liability.get_balance(0)
            
        net_worth[0] = assets_yearly[0] - liabilities_yearly[0]
        
        # Calculate for each future year
        for year in years[1:]:
            # Income calculation
            year_income = 0
            for income_source in self.incomes:
                year_income += income_source.get_income(year)
            income_yearly[year] = year_income
            
            # Expense calculation
            year_expenses = 0
            for expense in self.expenditures:
                year_expenses += expense.get_expense(year)
            expenses_yearly[year] = year_expenses
            
            # Cash flow
            cash_flow_yearly[year] = year_income - year_expenses
            
            # Assets and liabilities
            year_assets = 0
            for asset in self.assets:
                # Update asset values based on cash flow if applicable
                if isinstance(asset, Investment) and cash_flow_yearly[year] > 0:
                    # Assume some of positive cash flow goes to investments
                    asset.add_contribution(cash_flow_yearly[year] * 0.2, year)  # 20% of positive cash flow
                year_assets += asset.get_value(year)
            assets_yearly[year] = year_assets
            
            year_liabilities = 0
            for liability in self.liabilities:
                # Make payments from cash flow
                if cash_flow_yearly[year] > 0:
                    liability.make_payment(min(liability.get_payment(year), cash_flow_yearly[year]), year)
                year_liabilities += liability.get_balance(year)
            liabilities_yearly[year] = year_liabilities
            
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
                            income_yearly[i] *= income_boost_factor
                
                elif milestone.get('type') == 'job':
                    # New job affects income
                    income_change = milestone.get('income_change', 0)
                    for i in range(milestone_year, self.years_to_project + 1):
                        income_yearly[i] += income_change
                
                elif milestone.get('type') == 'housing':
                    # Housing purchase affects assets and liabilities
                    if milestone.get('subtype') == 'purchase':
                        house_value = milestone.get('value', 0)
                        down_payment = milestone.get('down_payment', 0)
                        for i in range(milestone_year, self.years_to_project + 1):
                            assets_yearly[i] += house_value
                            liabilities_yearly[i] += (house_value - down_payment) * (1 - (i - milestone_year) * 0.03)  # Simple mortgage calculation
                            net_worth[i] = assets_yearly[i] - liabilities_yearly[i]
        
        # Compile results
        self.results = {
            'ages': ages,
            'netWorth': net_worth,
            'income': income_yearly,
            'expenses': expenses_yearly,
            'assets': assets_yearly,
            'liabilities': liabilities_yearly,
            'cashFlow': cash_flow_yearly,
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
        if 'expenditures' in input_data:
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
        
        # Add milestones
        if 'milestones' in input_data:
            for milestone in input_data['milestones']:
                calculator.add_milestone(milestone)
        
        return calculator
