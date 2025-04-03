"""
Expenditure models for the financial calculator.
Represents different types of expenses and costs.
"""

from typing import Optional, Dict, List


class Expenditure:
    """Base class for all expenditures (expenses/costs)."""
    
    def __init__(self, name: str, annual_amount: float, 
                 inflation_rate: float = 0.02):
        """
        Initialize an expenditure.
        
        Args:
            name: Expenditure name
            annual_amount: Annual expenditure amount
            inflation_rate: Annual inflation rate (e.g., 0.02 for 2%)
        """
        self.name = name
        self.annual_amount = annual_amount
        self.inflation_rate = inflation_rate
        self.expense_history = {0: annual_amount}  # Track expenses over time
    
    def get_expense(self, year: int) -> float:
        """
        Get the expense amount for a given year.
        
        Args:
            year: Year to get expense for
            
        Returns:
            Expense amount
        """
        if year in self.expense_history:
            return self.expense_history[year]
            
        # If year not in history, calculate from previous year
        prev_year = max(k for k in self.expense_history.keys() if k < year)
        expense = self.expense_history[prev_year]
        
        # Calculate for each year between prev_year and year
        for y in range(prev_year + 1, year + 1):
            expense = self._calculate_expense(expense, y)
            self.expense_history[y] = expense
        
        return expense
    
    def _calculate_expense(self, previous_expense: float, year: int) -> float:
        """
        Calculate the expense for a given year based on the previous expense.
        
        Args:
            previous_expense: Expense from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated expense amount
        """
        # Default implementation applies inflation
        return previous_expense * (1 + self.inflation_rate)
    
    def update_expense(self, year: int, new_amount: float) -> None:
        """
        Update the expense amount for a specific year.
        
        Args:
            year: Year to update
            new_amount: New expense amount
        """
        self.expense_history[year] = new_amount


class Housing(Expenditure):
    """Housing expenses including rent, utilities, etc."""
    
    def __init__(self, name: str, annual_amount: float, 
                 inflation_rate: float = 0.03,
                 is_rent: bool = True):
        """
        Initialize housing expenses.
        
        Args:
            name: Housing expense name
            annual_amount: Annual expense amount
            inflation_rate: Annual inflation rate (e.g., 0.03 for 3%)
            is_rent: Whether this is rent (True) or mortgage/ownership (False)
        """
        super().__init__(name, annual_amount, inflation_rate)
        self.is_rent = is_rent
        
        # Housing typically inflates faster than other expenses
        if is_rent:
            self.inflation_rate = max(inflation_rate, 0.03)
    
    def _calculate_expense(self, previous_expense: float, year: int) -> float:
        """
        Calculate housing expense for a given year.
        
        Args:
            previous_expense: Expense from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated expense amount
        """
        # Rent might have lease jumps every few years
        if self.is_rent and year % 2 == 0:  # Every 2 years, slightly larger increase
            return previous_expense * (1 + self.inflation_rate * 1.5)
        return previous_expense * (1 + self.inflation_rate)


class Transportation(Expenditure):
    """Transportation expenses including car, public transit, etc."""
    
    def __init__(self, name: str, annual_amount: float, 
                 inflation_rate: float = 0.03,
                 car_replacement_years: int = 7,
                 car_replacement_cost: float = 20000,
                 auto_replace: bool = True):
        """
        Initialize transportation expenses.
        
        Args:
            name: Transportation expense name
            annual_amount: Annual expense amount
            inflation_rate: Annual inflation rate (e.g., 0.03 for 3%)
            car_replacement_years: Years between car replacements
            car_replacement_cost: Cost of replacing car
            auto_replace: Whether to automatically replace the car on schedule
        """
        super().__init__(name, annual_amount, inflation_rate)
        self.car_replacement_years = car_replacement_years
        self.car_replacement_cost = car_replacement_cost
        self.auto_replace = auto_replace
        self.car_purchases = {}  # Track car purchases over time
    
    def _calculate_expense(self, previous_expense: float, year: int) -> float:
        """
        Calculate transportation expense for a given year.
        
        Args:
            previous_expense: Expense from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated expense amount
        """
        # Apply standard inflation
        base_expense = previous_expense * (1 + self.inflation_rate)
        
        # Check for car replacement only if auto-replace is enabled
        if (self.auto_replace and year > 0 and year % self.car_replacement_years == 0 and 
                year not in self.car_purchases):
            self.car_purchases[year] = self.car_replacement_cost * (1 + self.inflation_rate) ** (year // self.car_replacement_years)
            return base_expense + self.car_purchases[year]
        
        return base_expense
    
    def add_car_purchase(self, year: int, cost: float) -> None:
        """
        Add a car purchase for a specific year.
        
        Args:
            year: Year of car purchase
            cost: Cost of car
        """
        self.car_purchases[year] = cost
        
        # Update expense for this year if already calculated
        if year in self.expense_history:
            self.expense_history[year] += cost


class Living(Expenditure):
    """Living expenses including food, clothing, entertainment, etc."""
    
    def __init__(self, name: str, annual_amount: float, 
                 inflation_rate: float = 0.02,
                 lifestyle_factor: float = 1.0):
        """
        Initialize living expenses.
        
        Args:
            name: Living expense name
            annual_amount: Annual expense amount
            inflation_rate: Annual inflation rate (e.g., 0.02 for 2%)
            lifestyle_factor: Factor for lifestyle inflation (1.0 is baseline)
        """
        super().__init__(name, annual_amount, inflation_rate)
        self.lifestyle_factor = lifestyle_factor
        self.lifestyle_changes = {}  # Track changes in lifestyle over time
    
    def _calculate_expense(self, previous_expense: float, year: int) -> float:
        """
        Calculate living expense for a given year.
        
        Args:
            previous_expense: Expense from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated expense amount
        """
        # Apply standard inflation first
        base_expense = previous_expense * (1 + self.inflation_rate)
        
        # Apply lifestyle inflation if specified for this year
        if year in self.lifestyle_changes:
            lifestyle_change = self.lifestyle_changes[year]
            return base_expense * (1 + lifestyle_change)
        
        # Apply gradual lifestyle inflation based on factor
        if self.lifestyle_factor > 1.0:
            lifestyle_inflation = (self.lifestyle_factor - 1.0) / 10  # Spread over 10 years
            return base_expense * (1 + lifestyle_inflation)
        
        return base_expense
    
    def change_lifestyle(self, year: int, change_factor: float) -> None:
        """
        Record a lifestyle change for a specific year.
        
        Args:
            year: Year of lifestyle change
            change_factor: Factor to apply to expenses (positive or negative)
        """
        self.lifestyle_changes[year] = change_factor


class Tax(Expenditure):
    """Tax expenses including income tax, property tax, etc."""
    
    def __init__(self, name: str, annual_amount: float = 0, 
                 tax_rate: float = 0.25,
                 income_sources: Optional[List[str]] = None):
        """
        Initialize tax expenses.
        
        Args:
            name: Tax expense name
            annual_amount: Fixed annual tax amount
            tax_rate: Effective tax rate on income
            income_sources: List of income source names to track for taxation
        """
        super().__init__(name, annual_amount, inflation_rate=0)  # No inflation on fixed amount
        self.tax_rate = tax_rate
        self.income_sources = income_sources or []
        self.income_records = {}  # Track income by year for calculation
    
    def record_income(self, year: int, income: float, source: str = "") -> None:
        """
        Record income for tax calculation.
        
        Args:
            year: Year of income
            income: Income amount
            source: Source of income
        """
        if source in self.income_sources or not self.income_sources:
            if year in self.income_records:
                self.income_records[year] += income
            else:
                self.income_records[year] = income
    
    def _calculate_expense(self, previous_expense: float, year: int) -> float:
        """
        Calculate tax expense for a given year.
        
        Args:
            previous_expense: Tax from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated tax amount
        """
        # Add fixed tax amount
        tax_amount = self.annual_amount
        
        # Add income-based tax if income is recorded
        if year in self.income_records:
            tax_amount += self.income_records[year] * self.tax_rate
        
        return tax_amount
