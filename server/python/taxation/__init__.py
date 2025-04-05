"""
Taxation package for income tax calculations.

This package provides the tools for calculating income taxes:
- Federal income taxes
- State income taxes (selected states)
- Payroll taxes (Social Security and Medicare)
"""
from .core import TaxBracket, TaxRule, ProgressiveTaxRule, FlatTaxRule, StandardDeduction, TaxJurisdiction
from .federal import FederalTaxCalculator
from .state import StateTaxCalculator
from .calculator import TaxCalculator