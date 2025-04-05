"""
Financial projection constants
"""

# Marriage milestone assumptions
MARRIAGE_EXPENSE_INCREASE = 0.20  # 20% increase in expenses after marriage

# Housing assumptions
HOME_PURCHASE_RENT_REDUCTION = 0.75  # 75% reduction in rent after home purchase
MORTGAGE_TERM_YEARS = 30  # Standard mortgage term
MORTGAGE_INTEREST_RATE = 0.065  # 6.5% mortgage interest rate

# Child assumptions
CHILD_ANNUAL_EXPENSE = 17000  # $17,000 per year per child
CHILD_EXPENSE_INCREASE_RATE = 0.04  # 4% annual increase in child expenses
CHILD_EXPENSE_PER_YEAR = 17000  # Same as CHILD_ANNUAL_EXPENSE
CHILD_INITIAL_EXPENSE = 10000  # Initial expense for child

# Education assumptions
EDUCATION_LOAN_TERM_YEARS = 10  # Standard education loan term
EDUCATION_LOAN_INTEREST_RATE = 0.055  # 5.5% education loan interest rate
GRADUATE_SCHOOL_INCOME_INCREASE = 0.30  # 30% income increase after graduate school

# Car assumptions
CAR_LOAN_TERM_YEARS = 5  # Standard car loan term
CAR_LOAN_INTEREST_RATE = 0.045  # 4.5% car loan interest rate
CAR_DEPRECIATION_RATE = 0.15  # 15% annual depreciation
CAR_PURCHASE_TRANSPORTATION_REDUCTION = 0.5  # 50% reduction in transportation expenses after car purchase
CAR_REPLACEMENT_YEARS = 10  # Replace car every 10 years
CAR_REPLACEMENT_COST = 25000  # Cost of replacement car
CAR_AUTO_REPLACE = True  # Auto-replace cars
CAR_LOAN_TERM = 5  # Used by some parts of the code instead of CAR_LOAN_TERM_YEARS

# Inflation rates
HEALTHCARE_INFLATION_RATE = 0.06  # 6% healthcare inflation
TRANSPORTATION_INFLATION_RATE = 0.03  # 3% transportation inflation

# Default expense allocations
DEFAULT_EXPENSE_ALLOCATIONS = {
    "housing": 0.30,  # 30% of income
    "transportation": 0.15,  # 15% of income
    "food": 0.12,  # 12% of income
    "healthcare": 0.08,  # 8% of income
    "personal_insurance": 0.05,  # 5% of income
    "apparel": 0.03,  # 3% of income
    "services": 0.06,  # 6% of income
    "entertainment": 0.05,  # 5% of income
    "other": 0.06  # 6% of income
}

# Tax assumptions
TAX_FILING_STATUS_OPTIONS = ["single", "married_joint", "married_separate", "head_of_household"]
DEFAULT_TAX_FILING_STATUS = "single"
DEFAULT_TAX_STANDARD_DEDUCTION_SINGLE = 13850  # 2024 standard deduction for single
DEFAULT_TAX_STANDARD_DEDUCTION_MARRIED = 27700  # 2024 standard deduction for married filing jointly
DEFAULT_TAX_ADDITIONAL_DEDUCTIONS = 0  # Default additional deductions
DEFAULT_TAX_CREDITS = 0  # Default tax credits
DEFAULT_RETIREMENT_CONTRIBUTION_RATE = 0.05  # Default 401k/IRA contribution rate (5%)