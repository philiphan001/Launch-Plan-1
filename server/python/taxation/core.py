"""
Core tax calculation module.

This module provides the basic tax calculation structures and interfaces.
"""
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from abc import ABC, abstractmethod


@dataclass
class TaxBracket:
    """
    Tax bracket structure with lower and upper income thresholds and rate.
    
    Attributes:
        lower: Lower income threshold
        upper: Upper income threshold (None for unlimited)
        rate: Tax rate as a decimal
    """
    lower: float
    upper: Optional[float]
    rate: float


@dataclass
class StandardDeduction:
    """
    Standard deduction structure.
    
    Attributes:
        amount: Deduction amount
        filing_status: Filing status this deduction applies to
    """
    amount: float
    filing_status: str


class TaxRule(ABC):
    """
    Abstract tax rule interface.
    """
    
    @abstractmethod
    def apply(self, income: float) -> float:
        """
        Apply the tax rule to calculate tax on income.
        
        Args:
            income: Taxable income
            
        Returns:
            float: Calculated tax
        """
        pass
    
    @abstractmethod
    def get_marginal_rate(self, income: float) -> float:
        """
        Get the marginal tax rate for income.
        
        Args:
            income: Taxable income
            
        Returns:
            float: Marginal tax rate as a decimal
        """
        pass


class ProgressiveTaxRule(TaxRule):
    """
    Progressive tax calculation rule.
    
    This rule applies different rates to different portions of income.
    """
    
    def __init__(self, brackets: List[TaxBracket]):
        """
        Initialize with tax brackets.
        
        Args:
            brackets: List of tax brackets in ascending order
        """
        self.brackets = sorted(brackets, key=lambda b: b.lower)
    
    def apply(self, income: float) -> float:
        """
        Apply progressive tax calculation.
        
        Args:
            income: Taxable income
            
        Returns:
            float: Calculated tax
        """
        tax = 0.0
        
        for i, bracket in enumerate(self.brackets):
            # Skip brackets that don't apply
            if income <= bracket.lower:
                continue
            
            # Calculate the portion of income that falls in this bracket
            lower = bracket.lower
            upper = bracket.upper if bracket.upper is not None else float('inf')
            
            # If this is the last applicable bracket
            if income <= upper:
                tax += (income - lower) * bracket.rate
                break
                
            # Full bracket applies
            tax += (upper - lower) * bracket.rate
        
        return tax
    
    def get_marginal_rate(self, income: float) -> float:
        """
        Get the marginal tax rate for income.
        
        Args:
            income: Taxable income
            
        Returns:
            float: Marginal tax rate as a decimal
        """
        for bracket in reversed(self.brackets):
            if bracket.lower is not None and income >= bracket.lower:
                return bracket.rate
        
        # Default to lowest bracket rate
        return self.brackets[0].rate if self.brackets else 0.0


class FlatTaxRule(TaxRule):
    """
    Flat tax calculation rule.
    
    This rule applies the same rate to all income.
    """
    
    def __init__(self, rate: float):
        """
        Initialize with flat tax rate.
        
        Args:
            rate: Flat tax rate as a decimal
        """
        self.rate = rate
    
    def apply(self, income: float) -> float:
        """
        Apply flat tax calculation.
        
        Args:
            income: Taxable income
            
        Returns:
            float: Calculated tax
        """
        return income * self.rate
    
    def get_marginal_rate(self, income: float) -> float:
        """
        Get the marginal tax rate for income.
        
        For flat tax, the marginal rate is the same as the flat rate.
        
        Args:
            income: Taxable income
            
        Returns:
            float: Marginal tax rate as a decimal
        """
        return self.rate


class TaxJurisdiction(ABC):
    """
    Abstract tax jurisdiction interface.
    
    This interface defines the methods that all tax jurisdictions (federal, state, local) should implement.
    """
    
    @abstractmethod
    def calculate_tax(self, income: float, filing_status: str, tax_year: int) -> float:
        """
        Calculate tax for a given income, filing status, and tax year.
        
        Args:
            income: Gross income
            filing_status: Filing status
            tax_year: Tax year
            
        Returns:
            float: The calculated tax
        """
        pass
    
    @abstractmethod
    def get_marginal_rate(self, income: float, filing_status: str, tax_year: int) -> float:
        """
        Get the marginal tax rate for a given income, filing status, and tax year.
        
        Args:
            income: Gross income
            filing_status: Filing status
            tax_year: Tax year
            
        Returns:
            float: The marginal tax rate as a decimal
        """
        pass
    
    @abstractmethod
    def get_effective_rate(self, income: float, filing_status: str, tax_year: int) -> float:
        """
        Get the effective tax rate for a given income, filing status, and tax year.
        
        Args:
            income: Gross income
            filing_status: Filing status
            tax_year: Tax year
            
        Returns:
            float: The effective tax rate as a decimal
        """
        pass