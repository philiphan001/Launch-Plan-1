"""
Liability models for the financial calculator.
Represents different types of debts and loans.
"""

from typing import Optional, Dict
import math


class Liability:
    """Base class for all liabilities (debts and loans)."""
    
    def __init__(self, name: str, initial_balance: float, 
                 interest_rate: float = 0.05, term_years: int = 10):
        """
        Initialize a liability.
        
        Args:
            name: Liability name
            initial_balance: Initial balance of the liability
            interest_rate: Annual interest rate (e.g., 0.05 for 5%)
            term_years: Term length in years
        """
        self.name = name
        self.initial_balance = initial_balance
        self.interest_rate = interest_rate
        self.term_years = term_years
        self.balance_history = {0: initial_balance}  # Track balance over time
        self.payment_history = {}  # Track payments made over time
        
        # Calculate standard payment amount (amortized)
        if initial_balance > 0 and interest_rate > 0:
            # Monthly payment calculation (amortization formula)
            monthly_rate = interest_rate / 12
            num_payments = term_years * 12
            
            if monthly_rate > 0:
                self.monthly_payment = initial_balance * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
            else:
                # If interest rate is 0, simple division
                self.monthly_payment = initial_balance / num_payments
        else:
            self.monthly_payment = 0
    
    def get_balance(self, year: int) -> float:
        """
        Get the balance of the liability at a given year.
        
        Args:
            year: Year to get balance for
            
        Returns:
            Liability balance
        """
        if year in self.balance_history:
            return self.balance_history[year]
            
        # If year not in history, calculate from previous year
        prev_year = max(k for k in self.balance_history.keys() if k < year)
        balance = self.balance_history[prev_year]
        
        # Calculate for each year between prev_year and year
        for y in range(prev_year + 1, year + 1):
            balance = self._calculate_balance(balance, y)
            self.balance_history[y] = balance
        
        return balance
    
    def _calculate_balance(self, previous_balance: float, year: int) -> float:
        """
        Calculate the balance for a given year based on the previous balance.
        
        Args:
            previous_balance: Balance from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated balance
        """
        # Apply interest
        balance = previous_balance * (1 + self.interest_rate)
        
        # Apply standard payments (if any)
        annual_payment = self.monthly_payment * 12
        if year in self.payment_history:
            # Use actual payments made if recorded
            payment = self.payment_history.get(year, 0)
        else:
            # Use standard payment otherwise
            payment = min(annual_payment, balance)
        
        # Reduce balance by payment
        balance -= payment
        
        # Ensure balance is not negative
        return max(0, balance)
    
    def get_payment(self, year: int) -> float:
        """
        Get the annual payment amount for a given year.
        
        Args:
            year: Year to get payment for
            
        Returns:
            Annual payment amount
        """
        # If we've already calculated a balance for this year,
        # the payment is effectively limited by the balance
        if year in self.balance_history:
            previous_balance = self.get_balance(year - 1) if year > 0 else self.initial_balance
            return min(self.monthly_payment * 12, previous_balance * (1 + self.interest_rate))
        
        # Otherwise return the standard payment
        return self.monthly_payment * 12
    
    def make_payment(self, amount: float, year: int) -> None:
        """
        Make a payment towards the liability.
        
        Args:
            amount: Payment amount
            year: Year of payment
        """
        if year in self.payment_history:
            self.payment_history[year] += amount
        else:
            self.payment_history[year] = amount
        
        # If we've already calculated the balance for this year, update it
        if year in self.balance_history:
            current_balance = self.balance_history[year]
            self.balance_history[year] = max(0, current_balance - amount)


class Mortgage(Liability):
    """Mortgage loan, typically for a home purchase."""
    
    def __init__(self, name: str, initial_balance: float, 
                 interest_rate: float = 0.04, term_years: int = 30,
                 property_tax_rate: float = 0.01,
                 insurance_rate: float = 0.0035):
        """
        Initialize a mortgage.
        
        Args:
            name: Mortgage name
            initial_balance: Initial balance of the mortgage
            interest_rate: Annual interest rate (e.g., 0.04 for 4%)
            term_years: Term length in years
            property_tax_rate: Annual property tax rate as percentage of property value
            insurance_rate: Annual home insurance rate as percentage of property value
        """
        super().__init__(name, initial_balance, interest_rate, term_years)
        self.property_tax_rate = property_tax_rate
        self.insurance_rate = insurance_rate
        
        # Property value is estimated as 25% more than the initial loan balance
        # (assuming 20% down payment)
        self.initial_property_value = initial_balance * 1.25
        
        # Calculate additional monthly costs (property tax and insurance)
        annual_tax = self.initial_property_value * property_tax_rate
        annual_insurance = self.initial_property_value * insurance_rate
        self.monthly_tax_insurance = (annual_tax + annual_insurance) / 12
    
    def get_payment(self, year: int) -> float:
        """
        Get the total annual payment amount including principal, interest, taxes, and insurance.
        
        Args:
            year: Year to get payment for
            
        Returns:
            Annual payment amount
        """
        # Get base payment (principal + interest)
        base_payment = super().get_payment(year)
        
        # Add tax and insurance
        total_payment = base_payment + (self.monthly_tax_insurance * 12)
        
        return total_payment


class StudentLoan(Liability):
    """Student loan with potential deferment periods."""
    
    def __init__(self, name: str, initial_balance: float, 
                 interest_rate: float = 0.05, term_years: int = 10,
                 deferment_years: int = 0, subsidized: bool = False):
        """
        Initialize a student loan.
        
        Args:
            name: Student loan name
            initial_balance: Initial balance of the loan
            interest_rate: Annual interest rate (e.g., 0.05 for 5%)
            term_years: Term length in years
            deferment_years: Number of years payment is deferred
            subsidized: Whether interest is subsidized during deferment
        """
        super().__init__(name, initial_balance, interest_rate, term_years)
        self.deferment_years = deferment_years
        self.subsidized = subsidized
    
    def _calculate_balance(self, previous_balance: float, year: int) -> float:
        """
        Calculate student loan balance with potential deferment considerations.
        
        Args:
            previous_balance: Balance from the previous year
            year: Current year to calculate
            
        Returns:
            Calculated balance
        """
        # During deferment, handle differently
        if year <= self.deferment_years:
            if self.subsidized:
                # No interest accrues during deferment for subsidized loans
                return previous_balance
            else:
                # Interest accrues but no payments are made
                return previous_balance * (1 + self.interest_rate)
        
        # After deferment, regular payment calculation
        return super()._calculate_balance(previous_balance, year)
    
    def get_payment(self, year: int) -> float:
        """
        Get the annual payment amount for the student loan, considering deferment.
        
        Args:
            year: Year to get payment for
            
        Returns:
            Annual payment amount
        """
        # No payments during deferment
        if year <= self.deferment_years:
            return 0
        
        return super().get_payment(year)


class AutoLoan(Liability):
    """Auto loan for vehicle purchases."""
    
    def __init__(self, name: str, initial_balance: float, 
                 interest_rate: float = 0.06, term_years: int = 5):
        """
        Initialize an auto loan.
        
        Args:
            name: Auto loan name
            initial_balance: Initial balance of the loan
            interest_rate: Annual interest rate (e.g., 0.06 for 6%)
            term_years: Term length in years
        """
        super().__init__(name, initial_balance, interest_rate, term_years)
        
        # Usually there's a corresponding asset (the car)
        # The asset would be created separately as a DepreciableAsset
