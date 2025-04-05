"""
Federal tax calculation module.

This module implements federal income tax calculations for the United States.
"""
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

from .core import TaxJurisdiction, TaxBracket, ProgressiveTaxRule, FlatTaxRule, StandardDeduction


class FederalTaxCalculator(TaxJurisdiction):
    """
    Federal tax calculator for the United States.
    
    This class calculates federal income tax based on income, filing status, and tax year.
    """
    
    # Federal tax brackets for 2024
    BRACKETS_2024 = {
        "single": [
            TaxBracket(0, 11600, 0.10),
            TaxBracket(11600, 47150, 0.12),
            TaxBracket(47150, 100525, 0.22),
            TaxBracket(100525, 191950, 0.24),
            TaxBracket(191950, 243725, 0.32),
            TaxBracket(243725, 609350, 0.35),
            TaxBracket(609350, None, 0.37)
        ],
        "married_joint": [
            TaxBracket(0, 23200, 0.10),
            TaxBracket(23200, 94300, 0.12),
            TaxBracket(94300, 201050, 0.22),
            TaxBracket(201050, 383900, 0.24),
            TaxBracket(383900, 487450, 0.32),
            TaxBracket(487450, 731200, 0.35),
            TaxBracket(731200, None, 0.37)
        ],
        "married_separate": [
            TaxBracket(0, 11600, 0.10),
            TaxBracket(11600, 47150, 0.12),
            TaxBracket(47150, 100525, 0.22),
            TaxBracket(100525, 191950, 0.24),
            TaxBracket(191950, 243725, 0.32),
            TaxBracket(243725, 365600, 0.35),
            TaxBracket(365600, None, 0.37)
        ],
        "head_of_household": [
            TaxBracket(0, 16550, 0.10),
            TaxBracket(16550, 63100, 0.12),
            TaxBracket(63100, 100500, 0.22),
            TaxBracket(100500, 191950, 0.24),
            TaxBracket(191950, 243700, 0.32),
            TaxBracket(243700, 609350, 0.35),
            TaxBracket(609350, None, 0.37)
        ]
    }
    
    # Standard deductions for 2024
    STANDARD_DEDUCTIONS_2024 = {
        "single": 14600,
        "married_joint": 29200,
        "married_separate": 14600,
        "head_of_household": 21900
    }
    
    # Payroll tax rates and thresholds for 2024
    SS_RATE_2024 = 0.062  # 6.2%
    SS_WAGE_BASE_2024 = 168600
    MEDICARE_RATE_2024 = 0.0145  # 1.45%
    MEDICARE_ADDITIONAL_RATE_2024 = 0.009  # 0.9% (Additional Medicare Tax)
    MEDICARE_ADDITIONAL_THRESHOLD_2024 = {
        "single": 200000,
        "married_joint": 250000,
        "married_separate": 125000,
        "head_of_household": 200000
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
    
    def calculate_tax(self, income: float, filing_status: str, tax_year: int = 2024) -> float:
        """
        Calculate federal income tax for a given income and filing status.
        
        Args:
            income: Gross income
            filing_status: Filing status (single, married_joint, married_separate, head_of_household)
            tax_year: Tax year (currently only 2024 is supported)
            
        Returns:
            float: The calculated federal income tax
        """
        if tax_year != 2024:
            raise ValueError(f"Tax year {tax_year} is not supported yet")
        
        # Verify filing status
        if filing_status not in self.BRACKETS_2024:
            raise ValueError(f"Unknown filing status: {filing_status}")
        
        # Apply standard deduction
        standard_deduction = self.STANDARD_DEDUCTIONS_2024[filing_status]
        taxable_income = max(0, income - standard_deduction)
        
        # Calculate tax based on brackets
        brackets = self.BRACKETS_2024[filing_status]
        tax_rule = ProgressiveTaxRule(brackets)
        
        return tax_rule.apply(taxable_income)
    
    def calculate_payroll_tax(self, income: float, filing_status: str, tax_year: int = 2024) -> Dict[str, float]:
        """
        Calculate payroll taxes (Social Security and Medicare).
        
        Args:
            income: Wage income
            filing_status: Filing status (impacts Additional Medicare Tax)
            tax_year: Tax year (currently only 2024 is supported)
            
        Returns:
            Dict[str, float]: Dictionary with social_security and medicare tax amounts
        """
        if tax_year != 2024:
            raise ValueError(f"Tax year {tax_year} is not supported yet")
        
        # Calculate Social Security tax (capped at wage base)
        ss_taxable_income = min(income, self.SS_WAGE_BASE_2024)
        social_security = ss_taxable_income * self.SS_RATE_2024
        
        # Calculate Medicare tax (includes additional tax for high-income individuals)
        medicare_base = income * self.MEDICARE_RATE_2024
        
        # Check if income is above the Additional Medicare Tax threshold
        if filing_status in self.MEDICARE_ADDITIONAL_THRESHOLD_2024:
            threshold = self.MEDICARE_ADDITIONAL_THRESHOLD_2024[filing_status]
            additional_income = max(0, income - threshold)
            additional_medicare = additional_income * self.MEDICARE_ADDITIONAL_RATE_2024
        else:
            additional_medicare = 0
        
        medicare = medicare_base + additional_medicare
        
        return {
            "social_security": social_security,
            "medicare": medicare
        }
    
    def get_marginal_rate(self, income: float, filing_status: str, tax_year: int = 2024) -> float:
        """
        Get the marginal federal income tax rate for a given income and filing status.
        
        Args:
            income: Gross income
            filing_status: Filing status (single, married_joint, married_separate, head_of_household)
            tax_year: Tax year (currently only 2024 is supported)
            
        Returns:
            float: The marginal tax rate as a decimal
        """
        if tax_year != 2024:
            raise ValueError(f"Tax year {tax_year} is not supported yet")
        
        # Verify filing status
        if filing_status not in self.BRACKETS_2024:
            raise ValueError(f"Unknown filing status: {filing_status}")
        
        # Apply standard deduction
        standard_deduction = self.STANDARD_DEDUCTIONS_2024[filing_status]
        taxable_income = max(0, income - standard_deduction)
        
        # Get marginal rate based on brackets
        brackets = self.BRACKETS_2024[filing_status]
        tax_rule = ProgressiveTaxRule(brackets)
        
        return tax_rule.get_marginal_rate(taxable_income)
    
    def get_effective_rate(self, income: float, filing_status: str, tax_year: int = 2024) -> float:
        """
        Get the effective federal income tax rate for a given income and filing status.
        
        Args:
            income: Gross income
            filing_status: Filing status (single, married_joint, married_separate, head_of_household)
            tax_year: Tax year (currently only 2024 is supported)
            
        Returns:
            float: The effective tax rate as a decimal
        """
        if income == 0:
            return 0.0
            
        tax = self.calculate_tax(income, filing_status, tax_year)
        return tax / income
    
    def calculate_total_tax(self, income: float, filing_status: str, tax_year: int = 2024) -> Dict[str, float]:
        """
        Calculate total federal taxes including income tax and payroll taxes.
        
        Args:
            income: Gross income
            filing_status: Filing status
            tax_year: Tax year (currently only 2024 is supported)
            
        Returns:
            Dict[str, float]: Dictionary with breakdown of various tax components
        """
        # Calculate income tax
        income_tax = self.calculate_tax(income, filing_status, tax_year)
        
        # Calculate payroll taxes
        payroll_taxes = self.calculate_payroll_tax(income, filing_status, tax_year)
        
        # Calculate effective tax rate
        total_tax = income_tax + payroll_taxes["social_security"] + payroll_taxes["medicare"]
        effective_rate = total_tax / income if income > 0 else 0
        
        return {
            "income_tax": income_tax,
            "social_security": payroll_taxes["social_security"],
            "medicare": payroll_taxes["medicare"],
            "total_tax": total_tax,
            "effective_rate": effective_rate
        }