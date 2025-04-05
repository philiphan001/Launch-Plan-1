"""
State tax calculation module.

This module implements state income tax calculations for selected US states.
"""
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import math

from .core import TaxJurisdiction, TaxBracket, ProgressiveTaxRule, FlatTaxRule, StandardDeduction


class StateTaxCalculator(TaxJurisdiction):
    """
    State tax calculator for selected US states.
    
    This class calculates state income tax based on income, filing status, and state.
    """
    
    # State tax data for 2024
    # Initial implementation for a few representative states
    
    # California - Progressive tax state with high rates
    CA_BRACKETS_2024 = {
        "single": [
            TaxBracket(0, 10412, 0.01),
            TaxBracket(10412, 24684, 0.02),
            TaxBracket(24684, 38959, 0.04),
            TaxBracket(38959, 54081, 0.06),
            TaxBracket(54081, 68350, 0.08),
            TaxBracket(68350, 349137, 0.093),
            TaxBracket(349137, 418961, 0.103),
            TaxBracket(418961, 698271, 0.113),
            TaxBracket(698271, None, 0.123)
        ],
        "married_joint": [
            TaxBracket(0, 20824, 0.01),
            TaxBracket(20824, 49368, 0.02),
            TaxBracket(49368, 77918, 0.04),
            TaxBracket(77918, 108162, 0.06),
            TaxBracket(108162, 136700, 0.08),
            TaxBracket(136700, 698272, 0.093),
            TaxBracket(698272, 837920, 0.103),
            TaxBracket(837920, 1396542, 0.113),
            TaxBracket(1396542, None, 0.123)
        ],
        "married_separate": [
            TaxBracket(0, 10412, 0.01),
            TaxBracket(10412, 24684, 0.02),
            TaxBracket(24684, 38959, 0.04),
            TaxBracket(38959, 54081, 0.06),
            TaxBracket(54081, 68350, 0.08),
            TaxBracket(68350, 349137, 0.093),
            TaxBracket(349137, 418961, 0.103),
            TaxBracket(418961, 698271, 0.113),
            TaxBracket(698271, None, 0.123)
        ],
        "head_of_household": [
            TaxBracket(0, 20888, 0.01),
            TaxBracket(20888, 49368, 0.02),
            TaxBracket(49368, 63938, 0.04),
            TaxBracket(63938, 79258, 0.06),
            TaxBracket(79258, 100089, 0.08),
            TaxBracket(100089, 508499, 0.093),
            TaxBracket(508499, 610580, 0.103),
            TaxBracket(610580, 1017180, 0.113),
            TaxBracket(1017180, None, 0.123)
        ]
    }
    
    # Illinois - Flat tax state (4.95%)
    IL_FLAT_RATE_2024 = 0.0495
    
    # Texas - No income tax
    TX_RATE_2024 = 0.0
    
    # New York - Progressive tax state
    NY_BRACKETS_2024 = {
        "single": [
            TaxBracket(0, 13900, 0.04),
            TaxBracket(13900, 21400, 0.045),
            TaxBracket(21400, 80650, 0.0525),
            TaxBracket(80650, 215400, 0.0585),
            TaxBracket(215400, 1077550, 0.0625),
            TaxBracket(1077550, 5000000, 0.068),
            TaxBracket(5000000, 25000000, 0.0965),
            TaxBracket(25000000, None, 0.103)
        ],
        "married_joint": [
            TaxBracket(0, 27900, 0.04),
            TaxBracket(27900, 42700, 0.045),
            TaxBracket(42700, 161550, 0.0525),
            TaxBracket(161550, 323200, 0.0585),
            TaxBracket(323200, 2155350, 0.0625),
            TaxBracket(2155350, 5000000, 0.068),
            TaxBracket(5000000, 25000000, 0.0965),
            TaxBracket(25000000, None, 0.103)
        ],
        "married_separate": [
            TaxBracket(0, 13900, 0.04),
            TaxBracket(13900, 21400, 0.045),
            TaxBracket(21400, 80650, 0.0525),
            TaxBracket(80650, 215400, 0.0585),
            TaxBracket(215400, 1077550, 0.0625),
            TaxBracket(1077550, 5000000, 0.068),
            TaxBracket(5000000, 25000000, 0.0965),
            TaxBracket(25000000, None, 0.103)
        ],
        "head_of_household": [
            TaxBracket(0, 20900, 0.04),
            TaxBracket(20900, 32200, 0.045),
            TaxBracket(32200, 107650, 0.0525),
            TaxBracket(107650, 269300, 0.0585),
            TaxBracket(269300, 1616450, 0.0625),
            TaxBracket(1616450, 5000000, 0.068),
            TaxBracket(5000000, 25000000, 0.0965),
            TaxBracket(25000000, None, 0.103)
        ]
    }
    
    # Standard deductions by state
    STANDARD_DEDUCTIONS_2024 = {
        "CA": {
            "single": 5363,
            "married_joint": 10726,
            "married_separate": 5363,
            "head_of_household": 10726
        },
        "NY": {
            "single": 8000,
            "married_joint": 16050,
            "married_separate": 8000,
            "head_of_household": 11200
        },
        "IL": {
            "single": 2450,
            "married_joint": 4900,
            "married_separate": 2450,
            "head_of_household": 2450
        },
        "TX": {
            "single": 0,  # No income tax
            "married_joint": 0,
            "married_separate": 0,
            "head_of_household": 0
        }
    }
    
    def __init__(self):
        """Initialize with default tax year of 2024."""
        self.tax_year = 2024
    
    def set_tax_year(self, year: int) -> None:
        """Set the tax year for calculations."""
        # Currently we only support 2024
        if year != 2024:
            raise ValueError(f"Tax year {year} is not supported yet")
        self.tax_year = year
    
    def calculate_tax(self, income: float, filing_status: str, tax_year: int = 2024, state_code: str = "CA") -> float:
        """
        Calculate state income tax for a given income, filing status, and state.
        
        Args:
            income: Gross income
            filing_status: Filing status (single, married_joint, married_separate, head_of_household)
            tax_year: Tax year (currently only 2024 is supported)
            state_code: Two-letter state code (CA, IL, NY, TX supported)
            
        Returns:
            float: The calculated state income tax
        """
        if tax_year != 2024:
            raise ValueError(f"Tax year {tax_year} is not supported yet")
        
        if state_code not in ["CA", "IL", "NY", "TX"]:
            raise ValueError(f"State {state_code} is not supported yet")
        
        # No state income tax for Texas
        if state_code == "TX":
            return 0.0
        
        # Apply standard deduction if available
        std_deduction = self.STANDARD_DEDUCTIONS_2024.get(state_code, {}).get(filing_status, 0)
        taxable_income = max(0, income - std_deduction)
        
        # Calculate state tax based on state rules
        if state_code == "CA":
            # Progressive tax state (California)
            if filing_status not in self.CA_BRACKETS_2024:
                raise ValueError(f"Unknown filing status for CA: {filing_status}")
            
            brackets = self.CA_BRACKETS_2024[filing_status]
            tax_rule = ProgressiveTaxRule(brackets)
            return tax_rule.apply(taxable_income)
            
        elif state_code == "IL":
            # Flat tax state (Illinois)
            tax_rule = FlatTaxRule(self.IL_FLAT_RATE_2024)
            return tax_rule.apply(taxable_income)
            
        elif state_code == "NY":
            # Progressive tax state (New York)
            if filing_status not in self.NY_BRACKETS_2024:
                raise ValueError(f"Unknown filing status for NY: {filing_status}")
            
            brackets = self.NY_BRACKETS_2024[filing_status]
            tax_rule = ProgressiveTaxRule(brackets)
            return tax_rule.apply(taxable_income)
        
        # Default return 0 (should never reach here with our validation)
        return 0.0
    
    def get_marginal_rate(self, income: float, filing_status: str, tax_year: int = 2024, state_code: str = "CA") -> float:
        """
        Get the marginal state income tax rate for a given income, filing status, and state.
        
        Args:
            income: Gross income
            filing_status: Filing status (single, married_joint, married_separate, head_of_household)
            tax_year: Tax year (currently only 2024 is supported)
            state_code: Two-letter state code (CA, IL, NY, TX supported)
            
        Returns:
            float: The marginal tax rate as a decimal
        """
        if tax_year != 2024:
            raise ValueError(f"Tax year {tax_year} is not supported yet")
        
        if state_code not in ["CA", "IL", "NY", "TX"]:
            raise ValueError(f"State {state_code} is not supported yet")
        
        # No state income tax for Texas
        if state_code == "TX":
            return 0.0
        
        # Apply standard deduction if available
        std_deduction = self.STANDARD_DEDUCTIONS_2024.get(state_code, {}).get(filing_status, 0)
        taxable_income = max(0, income - std_deduction)
        
        # Get marginal rate based on state rules
        if state_code == "CA":
            # Progressive tax state (California)
            if filing_status not in self.CA_BRACKETS_2024:
                raise ValueError(f"Unknown filing status for CA: {filing_status}")
            
            brackets = self.CA_BRACKETS_2024[filing_status]
            tax_rule = ProgressiveTaxRule(brackets)
            return tax_rule.get_marginal_rate(taxable_income)
            
        elif state_code == "IL":
            # Flat tax state (Illinois)
            return self.IL_FLAT_RATE_2024
            
        elif state_code == "NY":
            # Progressive tax state (New York)
            if filing_status not in self.NY_BRACKETS_2024:
                raise ValueError(f"Unknown filing status for NY: {filing_status}")
            
            brackets = self.NY_BRACKETS_2024[filing_status]
            tax_rule = ProgressiveTaxRule(brackets)
            return tax_rule.get_marginal_rate(taxable_income)
        
        # Default return 0 (should never reach here with our validation)
        return 0.0
    
    def get_effective_rate(self, income: float, filing_status: str, tax_year: int = 2024, state_code: str = "CA") -> float:
        """
        Get the effective state income tax rate for a given income, filing status, and state.
        
        Args:
            income: Gross income
            filing_status: Filing status (single, married_joint, married_separate, head_of_household)
            tax_year: Tax year (currently only 2024 is supported)
            state_code: Two-letter state code (CA, IL, NY, TX supported)
            
        Returns:
            float: The effective tax rate as a decimal
        """
        if income == 0:
            return 0.0
            
        tax = self.calculate_tax(income, filing_status, tax_year, state_code)
        return tax / income