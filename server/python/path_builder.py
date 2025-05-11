"""
PathBuilder class for creating and comparing different career paths.
This class uses the milestone system under the hood but provides a cleaner interface
for comparing different scenarios.
"""

from typing import List, Dict, Any, Optional
from financial_updated import FinancialCalculator
from enum import Enum

class EducationType(Enum):
    """Types of education paths available."""
    TWO_YEAR_COLLEGE = "2year_college"
    FOUR_YEAR_COLLEGE = "4year_college"
    VOCATIONAL = "vocational"
    MASTERS = "masters"
    DOCTORATE = "doctorate"
    PROFESSIONAL = "professional"

class PathBuilder:
    """Builder class for creating and comparing career paths."""
    
    # Default growth rates
    DEFAULT_INCOME_GROWTH = 0.03
    DEFAULT_COST_OF_LIVING_GROWTH = 0.02
    DEFAULT_EDUCATION_COST_GROWTH = 0.04
    DEFAULT_INFLATION = 0.02
    
    # Education multipliers
    EDUCATION_MULTIPLIERS = {
        EducationType.TWO_YEAR_COLLEGE: 1.15,  # 15% increase
        EducationType.FOUR_YEAR_COLLEGE: 1.30,  # 30% increase
        EducationType.VOCATIONAL: 1.20,        # 20% increase
        EducationType.MASTERS: 1.50,           # 50% increase
        EducationType.DOCTORATE: 1.80,         # 80% increase
        EducationType.PROFESSIONAL: 2.00       # 100% increase
    }
    
    def __init__(self, base_input_data: Dict[str, Any]):
        """
        Initialize the path builder.
        
        Args:
            base_input_data: Base input data for the calculator
        """
        self.base_input_data = base_input_data
        self.paths = []
        
        # Set growth rates from input data or use defaults
        self.income_growth = base_input_data.get('incomeGrowthRate', self.DEFAULT_INCOME_GROWTH)
        self.cost_of_living_growth = base_input_data.get('costOfLivingGrowthRate', self.DEFAULT_COST_OF_LIVING_GROWTH)
        self.education_cost_growth = base_input_data.get('educationCostGrowthRate', self.DEFAULT_EDUCATION_COST_GROWTH)
        self.inflation = base_input_data.get('inflationRate', self.DEFAULT_INFLATION)
    
    def _calculate_future_value(self, present_value: float, growth_rate: float, years: int) -> float:
        """
        Calculate future value using compound growth.
        
        Args:
            present_value: Current value
            growth_rate: Annual growth rate
            years: Number of years to project
            
        Returns:
            Future value
        """
        return present_value * (1 + growth_rate) ** years
    
    def _calculate_education_cost(self, base_cost: float, education_type: EducationType, start_year: int) -> float:
        """
        Calculate education cost with growth over time.
        
        Args:
            base_cost: Base annual education cost
            education_type: Type of education
            start_year: Year education starts
            
        Returns:
            Total education cost with growth
        """
        duration = self._get_education_duration(education_type)
        total_cost = 0
        
        for year in range(duration):
            # Calculate cost for each year with growth
            year_cost = self._calculate_future_value(
                base_cost,
                self.education_cost_growth,
                year
            )
            total_cost += year_cost
        
        return total_cost
    
    def _get_education_duration(self, education_type: EducationType) -> int:
        """Get duration in years for different education types."""
        duration_map = {
            EducationType.TWO_YEAR_COLLEGE: 2,
            EducationType.FOUR_YEAR_COLLEGE: 4,
            EducationType.VOCATIONAL: 2,
            EducationType.MASTERS: 2,
            EducationType.DOCTORATE: 4,
            EducationType.PROFESSIONAL: 3
        }
        return duration_map.get(education_type, 4)
    
    def add_immediate_work_path(self, 
                              occupation_id: str,
                              start_year: int = 0,
                              initial_salary: Optional[float] = None) -> 'PathBuilder':
        """
        Add an immediate work path.
        
        Args:
            occupation_id: ID of the occupation to start with
            start_year: Year to start working
            initial_salary: Optional override for initial salary
            
        Returns:
            Self for method chaining
        """
        # Get occupation data
        calculator = FinancialCalculator.from_input_data(self.base_input_data)
        occupation_data = calculator._get_occupation_data(occupation_id)
        
        if not occupation_data:
            raise ValueError(f"Occupation {occupation_id} not found")
        
        # Use provided salary or occupation's salary
        salary = initial_salary or occupation_data.get('salary', 0)
        
        # Create job milestone
        milestone = {
            'type': 'job',
            'title': f"Start as {occupation_data.get('title', 'Professional')}",
            'year': start_year,
            'income_change': salary,
            'occupation_id': occupation_id
        }
        
        self.paths.append({
            'type': 'immediate_work',
            'title': f"Start as {occupation_data.get('title', 'Professional')}",
            'milestones': [milestone],
            'start_year': start_year
        })
        
        return self
    
    def add_education_path(self,
                          education_type: EducationType,
                          target_occupation_id: str,
                          start_year: int = 0,
                          work_status: str = 'part-time',
                          part_time_income: Optional[float] = None,
                          base_education_cost: Optional[float] = None) -> 'PathBuilder':
        """
        Add an education path with future value calculations.
        
        Args:
            education_type: Type of education
            target_occupation_id: ID of the occupation to target after education
            start_year: Year to start education
            work_status: Work status during education (no, part-time, full-time)
            part_time_income: Base part-time income (will be adjusted for growth)
            base_education_cost: Base annual education cost (will be adjusted for growth)
            
        Returns:
            Self for method chaining
        """
        calculator = FinancialCalculator.from_input_data(self.base_input_data)
        
        # Get education duration
        duration = self._get_education_duration(education_type)
        
        # Get target occupation data
        occupation_data = calculator._get_occupation_data(target_occupation_id)
        if not occupation_data:
            raise ValueError(f"Occupation {target_occupation_id} not found")
        
        # Calculate total education cost with growth
        total_education_cost = self._calculate_education_cost(
            base_education_cost or calculator._get_education_cost(education_type.value),
            education_type,
            start_year
        )
        
        milestones = []
        
        # Add education milestone with future-valued costs
        education_milestone = {
            'type': 'education',
            'educationType': education_type.value,
            'year': start_year,
            'workStatus': work_status,
            'targetOccupation': target_occupation_id,
            'educationCost': total_education_cost,
            'duration': duration
        }
        milestones.append(education_milestone)
        
        # Add part-time work milestone if applicable, with future-valued income
        if work_status == 'part-time' and part_time_income:
            # Calculate future value of part-time income for each year
            for year in range(duration):
                future_income = self._calculate_future_value(
                    part_time_income,
                    self.income_growth,
                    year
                )
                work_milestone = {
                    'type': 'job',
                    'title': f'Part-time Work During Education (Year {year + 1})',
                    'year': start_year + year,
                    'income_change': future_income,
                    'end_year': start_year + year
                }
                milestones.append(work_milestone)
        
        # Calculate post-education income with education multiplier and growth
        base_salary = occupation_data.get('salary', 0)
        education_multiplier = self.EDUCATION_MULTIPLIERS[education_type]
        years_to_graduation = duration
        
        # Calculate future value of post-education income
        future_salary = self._calculate_future_value(
            base_salary * education_multiplier,
            self.income_growth,
            years_to_graduation
        )
        
        # Add post-education job milestone
        post_education_milestone = {
            'type': 'job',
            'title': f"Start as {occupation_data.get('title', 'Professional')}",
            'year': start_year + duration,
            'income_change': future_salary,
            'occupation_id': target_occupation_id,
            'growth_rate': self.income_growth  # Include growth rate for future calculations
        }
        milestones.append(post_education_milestone)
        
        self.paths.append({
            'type': 'education',
            'title': f"{education_type.value.replace('_', ' ').title()} to {occupation_data.get('title', 'Professional')}",
            'milestones': milestones,
            'start_year': start_year,
            'duration': duration,
            'education_type': education_type.value,
            'growth_rates': {
                'income': self.income_growth,
                'cost_of_living': self.cost_of_living_growth,
                'education_cost': self.education_cost_growth,
                'inflation': self.inflation
            }
        })
        
        return self
    
    def compare_paths(self) -> Dict[str, Any]:
        """
        Compare all added paths.
        
        Returns:
            Dictionary containing comparison results for each path
        """
        comparison_results = {}
        
        for path in self.paths:
            # Create calculator for this path
            calculator = FinancialCalculator.from_input_data(self.base_input_data)
            
            # Add all milestones for this path
            for milestone in path['milestones']:
                calculator.add_milestone(milestone)
            
            # Calculate projection
            results = calculator.calculate_projection()
            
            # Calculate key metrics
            total_income = sum(results.get('income', []))
            total_expenses = sum(results.get('expenses', []))
            net_worth = results.get('netWorth', [])[-1] if results.get('netWorth') else 0
            
            # Calculate present value of earnings
            present_value = calculator._calculate_present_value_of_earnings(
                results.get('income', []),
                self.base_input_data.get('discountRate', 0.03)
            )
            
            comparison_results[path['type']] = {
                'title': path['title'],
                'totalIncome': total_income,
                'totalExpenses': total_expenses,
                'netWorth': net_worth,
                'presentValueOfEarnings': present_value,
                'yearlyBreakdown': results,
                'milestones': path['milestones']
            }
        
        return comparison_results

def create_path_comparison(input_data: Dict[str, Any]) -> PathBuilder:
    """
    Create a new path builder instance.
    
    Args:
        input_data: Base input data for the calculator
        
    Returns:
        New PathBuilder instance
    """
    return PathBuilder(input_data) 