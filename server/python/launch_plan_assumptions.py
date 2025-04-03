"""
Launch Plan Assumptions module for the FinancialFuture application.
This contains default assumptions used in financial calculations.
"""

# Housing assumptions
HOME_PURCHASE_RENT_REDUCTION = 1.0  # 100% reduction in rent when purchasing a home

# Transportation assumptions
CAR_PURCHASE_TRANSPORTATION_REDUCTION = 0.8  # 80% reduction in transportation expenses when buying a car

# Marriage assumptions
MARRIAGE_EXPENSE_INCREASE = 0.5  # 50% increase in general expenses after marriage

# Education assumptions
GRADUATE_SCHOOL_INCOME_INCREASE = 0.15  # 15% increase in income after graduate school

# Children assumptions
CHILD_EXPENSE_PER_YEAR = 10000  # Annual expense per child
CHILD_INITIAL_EXPENSE = 7500  # One-time expense when having a child

# Default expense allocations
DEFAULT_EXPENSE_ALLOCATIONS = {
    "housing": 0.30,  # 30% for housing (rent/mortgage)
    "transportation": 0.15,  # 15% for transportation
    "food": 0.15,  # 15% for food
    "healthcare": 0.10,  # 10% for healthcare
    "personal_insurance": 0.05,  # 5% for personal insurance
    "apparel": 0.04,  # 4% for apparel
    "services": 0.07,  # 7% for services
    "entertainment": 0.05,  # 5% for entertainment
    "other": 0.05,  # 5% for other expenses
    "discretionary": 0.04  # 4% for remaining discretionary spending (total is 100%)
}