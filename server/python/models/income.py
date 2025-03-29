"""
Income models for the financial calculator.
Represents different types of income sources.
"""

from typing import Optional, Dict


class Income:
    """Base class for all income sources."""
    
    def __init__(self, name: str, annual_amount: float, 
                 growth_rate: float = 0.02, 
                 start_year: int = 0, end_year: Optional[int] = None):
        """
        Initialize an income source.
        
        Args:
            name: Income source name
            annual_amount: Annual income amount
            growth_rate: Annual growth rate (e.g., 0.02 for 2%)
            start_year: Year when income starts
            end_year: Year when income ends (None for indefinite)
        """
        self.name = name
        self.annual_amount = annual_amount
        self.growth_rate = growth_rate
        self.start_year = start_year
        self.end_year = end_year
        self.income_history = {}  # Track income over time
    
    def get_income(self, year: int) -> float:
        """
        Get the income amount for a given year.
        
        Args:
            year: Year to get income for
            
        Returns:
            Income amount (0 if outside start/end years)
        """
        # Check if year is within the valid range
        if year < self.start_year or (self.end_year is not None and year > self.end_year):
            return 0
        
        # If already computed, return from history
        if year in self.income_history:
            return self.income_history[year]
        
        # If not the first year, calculate from previous year
        if year > self.start_year:
            prev_year = max(y for y in range(self.start_year, year) 
                         if y in self.income_history) if self.income_history else self.start_year
            prev_amount = self.get_income(prev_year)
            
            # Apply growth for each year from prev_year to year
            amount = prev_amount
            for y in range(prev_year + 1, year + 1):
                amount = self._calculate_income(amount, y)
                self.income_history[y] = amount
            
            return amount
        
        # For the start year
        amount = self._calculate_income(self.annual_amount, year)
        self.income_history[year] = amount
        return amount
    
    def _calculate_income(self, previous_amount: float, year: int) -> float:
        """
        Calculate income for a given year based on the previous amount.
        
        Args:
            previous_amount: Income amount from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated income amount
        """
        # Default implementation applies growth rate
        return previous_amount * (1 + self.growth_rate)
    
    def update_income(self, year: int, new_amount: float) -> None:
        """
        Update the income amount for a specific year.
        
        Args:
            year: Year to update
            new_amount: New income amount
        """
        if year >= self.start_year and (self.end_year is None or year <= self.end_year):
            self.income_history[year] = new_amount


class SalaryIncome(Income):
    """Income from a salary or wages."""
    
    def __init__(self, name: str, annual_amount: float, 
                 growth_rate: float = 0.03, 
                 start_year: int = 0, end_year: Optional[int] = None,
                 bonus_percent: float = 0.0):
        """
        Initialize a salary income source.
        
        Args:
            name: Salary source name
            annual_amount: Annual salary amount
            growth_rate: Annual salary growth rate (e.g., 0.03 for 3%)
            start_year: Year when salary starts
            end_year: Year when salary ends (None for indefinite)
            bonus_percent: Annual bonus as percentage of salary
        """
        super().__init__(name, annual_amount, growth_rate, start_year, end_year)
        self.bonus_percent = bonus_percent
    
    def _calculate_income(self, previous_amount: float, year: int) -> float:
        """
        Calculate salary for a given year including potential bonus.
        
        Args:
            previous_amount: Salary from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated salary amount including bonus
        """
        # Apply standard growth
        base_salary = previous_amount * (1 + self.growth_rate)
        
        # Add bonus
        total_income = base_salary * (1 + self.bonus_percent)
        
        return total_income
    
    def get_base_salary(self, year: int) -> float:
        """
        Get the base salary amount without bonuses.
        
        Args:
            year: Year to get salary for
            
        Returns:
            Base salary amount
        """
        total_income = self.get_income(year)
        if total_income > 0:
            return total_income / (1 + self.bonus_percent)
        return 0


class SpouseIncome(Income):
    """Income from a spouse/partner."""
    
    def __init__(self, name: str, annual_amount: float, 
                 growth_rate: float = 0.03, 
                 start_year: int = 0, end_year: Optional[int] = None,
                 part_time_factor: float = 1.0):
        """
        Initialize a spouse income source.
        
        Args:
            name: Spouse income source name
            annual_amount: Annual income amount
            growth_rate: Annual income growth rate (e.g., 0.03 for 3%)
            start_year: Year when income starts
            end_year: Year when income ends (None for indefinite)
            part_time_factor: Factor for part-time work (1.0 is full-time)
        """
        super().__init__(name, annual_amount, growth_rate, start_year, end_year)
        self.part_time_factor = part_time_factor
        self.part_time_schedule = {}  # To track changes in part-time status
    
    def _calculate_income(self, previous_amount: float, year: int) -> float:
        """
        Calculate spouse income for a given year.
        
        Args:
            previous_amount: Income from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated income amount
        """
        # Apply standard growth
        full_time_income = previous_amount * (1 + self.growth_rate) / self.get_part_time_factor(year - 1)
        
        # Apply current part-time factor
        actual_income = full_time_income * self.get_part_time_factor(year)
        
        return actual_income
    
    def get_part_time_factor(self, year: int) -> float:
        """
        Get the part-time factor for a specific year.
        
        Args:
            year: Year to get factor for
            
        Returns:
            Part-time factor
        """
        return self.part_time_schedule.get(year, self.part_time_factor)
    
    def set_part_time_factor(self, year: int, factor: float) -> None:
        """
        Set the part-time factor for a specific year.
        
        Args:
            year: Year to set factor for
            factor: New part-time factor (0.0 to 1.0)
        """
        self.part_time_schedule[year] = max(0.0, min(1.0, factor))
        
        # Clear income_history for this and future years to force recalculation
        for y in list(self.income_history.keys()):
            if y >= year:
                del self.income_history[y]
