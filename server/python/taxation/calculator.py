"""
Main tax calculator module.

This module provides the main interface for tax calculations, combining federal and state taxes.
"""
from typing import Dict, List, Optional, Tuple, Any
import json

from .core import TaxJurisdiction
from .federal import FederalTaxCalculator
from .state import StateTaxCalculator


class TaxCalculator:
    """
    Main tax calculator that combines federal and state tax calculations.
    """
    
    def __init__(self):
        """Initialize with federal and state tax calculators."""
        self.federal_calculator = FederalTaxCalculator()
        self.state_calculator = StateTaxCalculator()
        self.tax_year = 2024
    
    def set_tax_year(self, year: int) -> None:
        """Set the tax year for all calculations."""
        self.tax_year = year
        self.federal_calculator.set_tax_year(year)
        self.state_calculator.set_tax_year(year)
    
    def calculate_taxes(self, income: float, filing_status: str,
                         state_code: Optional[str] = None, tax_year: int = 2024) -> Dict[str, Any]:
        """
        Calculate complete tax breakdown including federal and state taxes.
        
        Args:
            income: Gross income
            filing_status: Filing status (single, married_joint, married_separate, head_of_household)
            state_code: Two-letter state code (optional, defaults to None which skips state tax calc)
            tax_year: Tax year (currently only 2024 is supported)
            
        Returns:
            Dict[str, Any]: Dictionary with complete tax breakdown
        """
        # Calculate federal taxes
        federal_tax_info = self.federal_calculator.calculate_total_tax(income, filing_status, tax_year)
        
        # Calculate state taxes if state_code is provided
        state_tax = 0.0
        state_marginal_rate = 0.0
        state_effective_rate = 0.0
        
        if state_code:
            state_tax = self.state_calculator.calculate_tax(
                income, filing_status, tax_year, state_code
            )
            state_marginal_rate = self.state_calculator.get_marginal_rate(
                income, filing_status, tax_year, state_code
            )
            state_effective_rate = self.state_calculator.get_effective_rate(
                income, filing_status, tax_year, state_code
            )
        
        # Calculate total tax
        total_tax = federal_tax_info["total_tax"] + state_tax
        
        # Calculate take-home pay
        take_home_pay = income - total_tax
        
        # Calculate effective tax rates
        total_effective_rate = total_tax / income if income > 0 else 0
        
        # Return comprehensive tax breakdown
        return {
            "income": round(income, 2),
            "federal": {
                "income_tax": round(federal_tax_info["income_tax"], 2),
                "social_security": round(federal_tax_info["social_security"], 2),
                "medicare": round(federal_tax_info["medicare"], 2),
                "total": round(federal_tax_info["total_tax"], 2),
                "marginal_rate": round(self.federal_calculator.get_marginal_rate(income, filing_status, tax_year) * 100, 2),
                "effective_rate": round(federal_tax_info["effective_rate"] * 100, 2)
            },
            "state": {
                "state_code": state_code,
                "tax": round(state_tax, 2),
                "marginal_rate": round(state_marginal_rate * 100, 2),
                "effective_rate": round(state_effective_rate * 100, 2)
            },
            "total_tax": round(total_tax, 2),
            "take_home_pay": round(take_home_pay, 2),
            "effective_tax_rate": round(total_effective_rate * 100, 2),
            "filing_status": filing_status,
            "tax_year": tax_year
        }
    
    def calculate_paycheck(self, annual_income: float, pay_frequency: str, 
                          filing_status: str, state_code: Optional[str] = None,
                          tax_year: int = 2024, allowances: int = 0,
                          additional_withholding: float = 0) -> Dict[str, Any]:
        """
        Calculate paycheck details including tax withholding.
        
        Args:
            annual_income: Annual gross income
            pay_frequency: Pay frequency (weekly, biweekly, semimonthly, monthly)
            filing_status: Filing status
            state_code: Two-letter state code (optional)
            tax_year: Tax year
            allowances: Number of allowances for withholding calculation
            additional_withholding: Additional withholding amount per paycheck
            
        Returns:
            Dict[str, Any]: Dictionary with paycheck details
        """
        # Calculate the number of pay periods per year
        pay_periods = {
            "weekly": 52,
            "biweekly": 26,
            "semimonthly": 24,
            "monthly": 12
        }
        
        if pay_frequency not in pay_periods:
            raise ValueError(f"Unknown pay frequency: {pay_frequency}")
        
        periods = pay_periods[pay_frequency]
        
        # Calculate gross pay per period
        gross_pay = annual_income / periods
        
        # Calculate estimated annual taxes
        annual_taxes = self.calculate_taxes(annual_income, filing_status, state_code, tax_year)
        
        # Estimate tax withholding per paycheck
        federal_withholding = annual_taxes["federal"]["income_tax"] / periods
        state_withholding = annual_taxes["state"]["tax"] / periods
        social_security = annual_taxes["federal"]["social_security"] / periods
        medicare = annual_taxes["federal"]["medicare"] / periods
        
        # Apply additional withholding
        federal_withholding += additional_withholding
        
        # Calculate total withholding and net pay
        total_withholding = federal_withholding + state_withholding + social_security + medicare
        net_pay = gross_pay - total_withholding
        
        return {
            "gross_pay": round(gross_pay, 2),
            "pay_frequency": pay_frequency,
            "pay_periods_per_year": periods,
            "federal_withholding": round(federal_withholding, 2),
            "state_withholding": round(state_withholding, 2),
            "social_security": round(social_security, 2),
            "medicare": round(medicare, 2),
            "total_withholding": round(total_withholding, 2),
            "net_pay": round(net_pay, 2),
            "annual_net_pay": round(net_pay * periods, 2)
        }
    
    def compare_states(self, income: float, filing_status: str, 
                      state_codes: List[str], tax_year: int = 2024) -> Dict[str, Dict[str, Any]]:
        """
        Compare tax burden across different states.
        
        Args:
            income: Gross income
            filing_status: Filing status
            state_codes: List of state codes to compare
            tax_year: Tax year
            
        Returns:
            Dict[str, Dict[str, Any]]: Dictionary with tax comparison by state
        """
        result = {}
        
        for state_code in state_codes:
            # Calculate taxes for this state
            tax_info = self.calculate_taxes(income, filing_status, state_code, tax_year)
            
            # Add to results
            result[state_code] = {
                "state_tax": tax_info["state"]["tax"],
                "total_tax": tax_info["total_tax"],
                "take_home_pay": tax_info["take_home_pay"],
                "effective_tax_rate": tax_info["effective_tax_rate"]
            }
        
        return result