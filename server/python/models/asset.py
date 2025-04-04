"""
Asset models for the financial calculator.
Represents different types of assets with varying behavior over time.
"""

from typing import Optional


class Asset:
    """Base class for all assets."""
    
    def __init__(self, name: str, initial_value: float):
        """
        Initialize an asset.
        
        Args:
            name: Asset name
            initial_value: Initial value of the asset
        """
        self.name = name
        self.initial_value = initial_value
        self.value_history = {0: initial_value}  # Track value over time
    
    def get_value(self, year: int) -> float:
        """
        Get the value of the asset at a given year.
        
        Args:
            year: Year to get value for
            
        Returns:
            Asset value
        """
        if year in self.value_history:
            return self.value_history[year]
            
        # If year not in history, calculate from previous year
        prev_year = max(k for k in self.value_history.keys() if k < year)
        value = self.value_history[prev_year]
        
        # Calculate for each year between prev_year and year
        for y in range(prev_year + 1, year + 1):
            value = self._calculate_value(value, y)
            self.value_history[y] = value
        
        return value
    
    def _calculate_value(self, previous_value: float, year: int) -> float:
        """
        Calculate the value for a given year based on the previous value.
        
        Args:
            previous_value: Value from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated value
        """
        # Default implementation assumes no change in value
        return previous_value
    
    def update_value(self, year: int, new_value: float) -> None:
        """
        Update the value of the asset for a specific year.
        
        Args:
            year: Year to update
            new_value: New value to set
        """
        self.value_history[year] = new_value
        
        # Clear future calculations so they'll be recalculated based on this new value
        # This ensures significant changes like home purchases affect future projections
        future_years = [y for y in self.value_history.keys() if y > year]
        for y in future_years:
            del self.value_history[y]


class DepreciableAsset(Asset):
    """Asset that depreciates over time, such as a car."""
    
    def __init__(self, name: str, initial_value: float, 
                 depreciation_rate: float = 0.1):
        """
        Initialize a depreciable asset.
        
        Args:
            name: Asset name
            initial_value: Initial value of the asset
            depreciation_rate: Annual rate of depreciation (e.g., 0.1 for 10%)
        """
        super().__init__(name, initial_value)
        self.depreciation_rate = depreciation_rate
    
    def _calculate_value(self, previous_value: float, year: int) -> float:
        """
        Calculate depreciated value.
        
        Args:
            previous_value: Value from the previous year
            year: Current year to calculate
            
        Returns:
            Depreciated value
        """
        return previous_value * (1 - self.depreciation_rate)


class Investment(Asset):
    """Asset that grows over time, such as retirement accounts or stocks."""
    
    def __init__(self, name: str, initial_value: float, 
                 growth_rate: float = 0.07, 
                 tax_rate: float = 0.15):
        """
        Initialize an investment asset.
        
        Args:
            name: Asset name
            initial_value: Initial value of the asset
            growth_rate: Annual growth rate (e.g., 0.07 for 7%)
            tax_rate: Tax rate on gains (e.g., 0.15 for 15%)
        """
        super().__init__(name, initial_value)
        self.growth_rate = growth_rate
        self.tax_rate = tax_rate
        self.contributions = {}  # Track contributions over time
    
    def _calculate_value(self, previous_value: float, year: int) -> float:
        """
        Calculate investment growth.
        
        Args:
            previous_value: Value from the previous year
            year: Current year to calculate
            
        Returns:
            Growth-adjusted value
        """
        # Apply growth
        value = previous_value * (1 + self.growth_rate)
        
        # Add any contributions for this year
        if year in self.contributions:
            value += self.contributions[year]
        
        return value
    
    def add_contribution(self, amount: float, year: int) -> None:
        """
        Add a contribution to the investment.
        
        Args:
            amount: Amount to contribute
            year: Year of contribution
        """
        if year in self.contributions:
            self.contributions[year] += amount
        else:
            self.contributions[year] = amount
        
        # If we've already calculated the value for this year, update it
        if year in self.value_history:
            self.value_history[year] += amount
    
    def withdraw(self, amount: float, year: int) -> float:
        """
        Withdraw funds from the investment.
        
        Args:
            amount: Amount to withdraw
            year: Year of withdrawal
            
        Returns:
            Actual amount withdrawn (may be less if insufficient funds)
        """
        current_value = self.get_value(year)
        withdrawal = min(amount, current_value)
        
        if withdrawal > 0:
            # Update the value after withdrawal
            self.value_history[year] = current_value - withdrawal
        
        return withdrawal
