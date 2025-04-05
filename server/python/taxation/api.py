#!/usr/bin/env python3
"""
API interface for tax calculations.

This script provides a command-line interface for the tax calculator, intended to be called
from the Express server.
"""
import sys
import json
from typing import Dict, Any, List, Optional

from .calculator import TaxCalculator


def calculate_taxes(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate taxes based on input arguments.
    
    Args:
        args: Dictionary with calculation parameters
        
    Returns:
        Dict[str, Any]: Tax calculation results
    """
    # Extract parameters
    income = args.get("income", 0)
    filing_status = args.get("filingStatus", "single")
    state_code = args.get("stateCode")
    tax_year = args.get("taxYear", 2024)
    
    # Create calculator and perform calculation
    calculator = TaxCalculator()
    result = calculator.calculate_taxes(income, filing_status, state_code, tax_year)
    
    return result


def calculate_paycheck(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate paycheck details based on input arguments.
    
    Args:
        args: Dictionary with calculation parameters
        
    Returns:
        Dict[str, Any]: Paycheck calculation results
    """
    # Extract parameters
    annual_income = args.get("annualIncome", 0)
    pay_frequency = args.get("payFrequency", "biweekly")
    filing_status = args.get("filingStatus", "single")
    state_code = args.get("stateCode")
    tax_year = args.get("taxYear", 2024)
    allowances = args.get("allowances", 0)
    additional_withholding = args.get("additionalWithholding", 0)
    
    # Create calculator and perform calculation
    calculator = TaxCalculator()
    result = calculator.calculate_paycheck(
        annual_income, pay_frequency, filing_status, state_code,
        tax_year, allowances, additional_withholding
    )
    
    return result


def compare_states(args: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Compare taxes across different states.
    
    Args:
        args: Dictionary with comparison parameters
        
    Returns:
        Dict[str, Dict[str, Any]]: State comparison results
    """
    # Extract parameters
    income = args.get("income", 0)
    filing_status = args.get("filingStatus", "single")
    state_codes = args.get("stateCodes", ["CA", "TX", "NY", "IL"])
    tax_year = args.get("taxYear", 2024)
    
    # Create calculator and perform comparison
    calculator = TaxCalculator()
    result = calculator.compare_states(income, filing_status, state_codes, tax_year)
    
    return result


def main():
    """Main entry point for the script."""
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Invalid arguments. Usage: api.py <command> <json_args>"
        }))
        sys.exit(1)
    
    command = sys.argv[1]
    args_json = sys.argv[2]
    
    try:
        args = json.loads(args_json)
        
        if command == "calculate":
            result = calculate_taxes(args)
        elif command == "paycheck":
            result = calculate_paycheck(args)
        elif command == "compare-states":
            result = compare_states(args)
        else:
            result = {"error": f"Unknown command: {command}"}
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "error": "Calculation failed",
            "details": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()