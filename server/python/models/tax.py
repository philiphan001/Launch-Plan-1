"""
Tax Calculator Class for Financial Projections
"""

class TaxCalculator:
    def __init__(self, income, filing_status="single", zip_code=None, state=None):
        self.income = income
        self.filing_status = filing_status
        self.zip_code = zip_code
        self.state = state
        
        # State tax brackets for 2024 (progressive states)
        self.state_tax_brackets = {
            'CA': {  # California
                'single': [
                    (0, 10099, 0.01),
                    (10099, 23942, 0.02),
                    (23942, 37788, 0.04),
                    (37788, 52455, 0.06),
                    (52455, 66295, 0.08),
                    (66295, 338639, 0.093),
                    (338639, 406364, 0.103),
                    (406364, 677275, 0.113),
                    (677275, float('inf'), 0.123)
                ],
                'married_joint': [
                    (0, 20198, 0.01),
                    (20198, 47884, 0.02),
                    (47884, 75576, 0.04),
                    (75576, 104910, 0.06),
                    (104910, 132590, 0.08),
                    (132590, 677278, 0.093),
                    (677278, 812728, 0.103),
                    (812728, 1354550, 0.113),
                    (1354550, float('inf'), 0.123)
                ]
            },
            'NY': {  # New York
                'single': [
                    (0, 8500, 0.04),
                    (8500, 11700, 0.045),
                    (11700, 13900, 0.0525),
                    (13900, 80650, 0.055),
                    (80650, 215400, 0.06),
                    (215400, 1077550, 0.0685),
                    (1077550, float('inf'), 0.0882)
                ],
                'married_joint': [
                    (0, 17150, 0.04),
                    (17150, 23600, 0.045),
                    (23600, 27900, 0.0525),
                    (27900, 161550, 0.055),
                    (161550, 323200, 0.06),
                    (323200, 2155350, 0.0685),
                    (2155350, float('inf'), 0.0882)
                ]
            },
            'NJ': {  # New Jersey
                'single': [
                    (0, 20000, 0.014),
                    (20000, 35000, 0.0175),
                    (35000, 40000, 0.035),
                    (40000, 75000, 0.05525),
                    (75000, 500000, 0.0637),
                    (500000, 1000000, 0.0897),
                    (1000000, float('inf'), 0.1075)
                ],
                'married_joint': [
                    (0, 20000, 0.014),
                    (20000, 50000, 0.0175),
                    (50000, 70000, 0.0245),
                    (70000, 80000, 0.035),
                    (80000, 150000, 0.05525),
                    (150000, 500000, 0.0637),
                    (500000, 1000000, 0.0897),
                    (1000000, float('inf'), 0.1075)
                ]
            },
            'OR': {  # Oregon
                'single': [
                    (0, 4050, 0.0475),
                    (4050, 10200, 0.0675),
                    (10200, 125000, 0.0875),
                    (125000, float('inf'), 0.099)
                ],
                'married_joint': [
                    (0, 8100, 0.0475),
                    (8100, 20400, 0.0675),
                    (20400, 250000, 0.0875),
                    (250000, float('inf'), 0.099)
                ]
            },
            'MN': {  # Minnesota
                'single': [
                    (0, 31500, 0.0535),
                    (31500, 103000, 0.068),
                    (103000, 193000, 0.0785),
                    (193000, float('inf'), 0.0985)
                ],
                'married_joint': [
                    (0, 46000, 0.0535),
                    (46000, 184000, 0.068),
                    (184000, 304000, 0.0785),
                    (304000, float('inf'), 0.0985)
                ]
            },
            'WI': {  # Wisconsin
                'single': [
                    (0, 13810, 0.0354),
                    (13810, 27630, 0.0465),
                    (27630, 304170, 0.0627),
                    (304170, float('inf'), 0.0765)
                ],
                'married_joint': [
                    (0, 18410, 0.0354),
                    (18410, 36830, 0.0465),
                    (36830, 405550, 0.0627),
                    (405550, float('inf'), 0.0765)
                ]
            }
        }
        
        # Flat rate states
        self.flat_rate_states = {
            'MA': 0.05,  # Massachusetts
            'IL': 0.0495,  # Illinois
            'PA': 0.0307,  # Pennsylvania
            'CO': 0.0455,  # Colorado
            'MI': 0.0425,  # Michigan
            'IN': 0.0323,  # Indiana
            'KY': 0.045,  # Kentucky
            'NC': 0.0475,  # North Carolina
            'UT': 0.0485,  # Utah
            'NH': 0.05  # New Hampshire (only on investment income)
        }
        
        # No income tax states
        self.no_tax_states = {
            'TX': 0.0,  # Texas
            'FL': 0.0,  # Florida
            'WA': 0.0,  # Washington
            'NV': 0.0,  # Nevada
            'AK': 0.0,  # Alaska
            'WY': 0.0,  # Wyoming
            'SD': 0.0,  # South Dakota
            'TN': 0.0  # Tennessee
        }
        
        # Federal tax brackets for 2024
        self.federal_tax_brackets = {
            'single': [
                (0, 11600, 0.10),
                (11600, 47150, 0.12),
                (47150, 100525, 0.22),
                (100525, 191950, 0.24),
                (191950, 243725, 0.32),
                (243725, 609350, 0.35),
                (609350, float('inf'), 0.37)
            ],
            'married_joint': [
                (0, 23200, 0.10),
                (23200, 94300, 0.12),
                (94300, 201050, 0.22),
                (201050, 383900, 0.24),
                (383900, 487450, 0.32),
                (487450, 731200, 0.35),
                (731200, float('inf'), 0.37)
            ],
            'married_separate': [
                (0, 11600, 0.10),
                (11600, 47150, 0.12),
                (47150, 100525, 0.22),
                (100525, 191950, 0.24),
                (191950, 243725, 0.32),
                (243725, 365600, 0.35),
                (365600, float('inf'), 0.37)
            ],
            'head_of_household': [
                (0, 15700, 0.10),
                (15700, 59850, 0.12),
                (59850, 95350, 0.22),
                (95350, 182100, 0.24),
                (182100, 231250, 0.32),
                (231250, 609350, 0.35),
                (609350, float('inf'), 0.37)
            ]
        }
        
        # Default standard deductions for 2024
        self.standard_deductions = {
            'single': 13850,
            'married_joint': 27700,
            'married_separate': 13850,
            'head_of_household': 20800
        }
        
    def calculate_fica(self):
        """Calculate FICA taxes (Social Security and Medicare)"""
        ss_wage_base = 155100  # 2024 Social Security wage base
        ss_tax = min(self.income, ss_wage_base) * 0.062
        medicare_tax = self.income * 0.0145
        
        # Additional Medicare Tax for high earners
        if self.filing_status == 'married_joint' and self.income > 250000:
            medicare_tax += (self.income - 250000) * 0.009
        elif self.filing_status == 'married_separate' and self.income > 125000:
            medicare_tax += (self.income - 125000) * 0.009
        elif self.income > 200000:
            medicare_tax += (self.income - 200000) * 0.009
            
        return round(ss_tax + medicare_tax, 2)
    
    def calculate_federal_tax(self, standard_deduction=None, additional_deductions=0, tax_credits=0):
        """Calculate federal income tax based on filing status and income"""
        if standard_deduction is None:
            standard_deduction = self.standard_deductions.get(self.filing_status, 13850)
            
        # Calculate taxable income
        taxable_income = max(0, self.income - standard_deduction - additional_deductions)
        
        # Calculate tax based on brackets
        brackets = self.federal_tax_brackets.get(self.filing_status, self.federal_tax_brackets['single'])
        tax = 0
        
        for i, (lower, upper, rate) in enumerate(brackets):
            if taxable_income > lower:
                bracket_income = min(taxable_income, upper) - lower
                tax += bracket_income * rate
            if taxable_income <= upper:
                break
                
        # Apply tax credits
        tax = max(0, tax - tax_credits)
        
        # Calculate marginal tax rate
        marginal_rate = 0
        for lower, upper, rate in brackets:
            if lower < taxable_income <= upper:
                marginal_rate = rate
                break
            elif taxable_income > upper:
                marginal_rate = rate
        
        # Calculate effective tax rate
        effective_rate = tax / self.income if self.income > 0 else 0
        
        return {
            "tax": round(tax, 2),
            "taxable_income": round(taxable_income, 2),
            "marginal_rate": marginal_rate,
            "effective_rate": effective_rate
        }
    
    def calculate_state_tax(self):
        """Calculate state income tax based on state and income"""
        # Lookup state by zip code if needed
        if self.state is None and self.zip_code is not None:
            self.state = self._get_state_from_zip(self.zip_code)
            
        # Get state tax rate with a safe default if state is None
        state_key = self.state if self.state is not None else "MA"  # Default to MA if state is None
        
        # Check if state has progressive tax brackets
        if state_key in self.state_tax_brackets:
            # Get the appropriate brackets for filing status
            brackets = self.state_tax_brackets[state_key].get(self.filing_status, 
                                                           self.state_tax_brackets[state_key]['single'])
            tax = 0
            
            # Calculate tax using progressive brackets
            for lower, upper, rate in brackets:
                if self.income > lower:
                    bracket_income = min(self.income, upper) - lower
                    tax += bracket_income * rate
                if self.income <= upper:
                    break
            
            return round(tax, 2)
        
        # Check if state has flat rate
        elif state_key in self.flat_rate_states:
            return round(self.income * self.flat_rate_states[state_key], 2)
        
        # Check if state has no income tax
        elif state_key in self.no_tax_states:
            return 0
        
        # Default to Massachusetts rate if state not found
        return round(self.income * 0.05, 2)
        
    def _get_state_from_zip(self, zip_code):
        """Look up state from zip code based on common ranges"""
        # This is a simplified mapping of zip code ranges to states
        if not zip_code or not isinstance(zip_code, str):
            return "MA"  # Default to Massachusetts
        
        # Ensure zip_code is a string
        zip_code_str = str(zip_code)
        
        # Get first 3 digits if possible
        zip_prefix = zip_code_str[:3] if len(zip_code_str) >= 3 else zip_code_str
        
        try:
            zip_prefix_int = int(zip_prefix)
            
            # Very simplified zip code to state mapping (first 3 digits)
            if 10 <= zip_prefix_int <= 27:
                return "MA"  # Massachusetts
            elif 900 <= zip_prefix_int <= 961:
                return "CA"  # California
            elif 100 <= zip_prefix_int <= 149:
                return "NY"  # New York
            elif 750 <= zip_prefix_int <= 799:
                return "TX"  # Texas
            elif 300 <= zip_prefix_int <= 319:
                return "GA"  # Georgia
            elif 320 <= zip_prefix_int <= 339:
                return "FL"  # Florida
            elif 730 <= zip_prefix_int <= 749:
                return "OK"  # Oklahoma
            elif 600 <= zip_prefix_int <= 629:
                return "IL"  # Illinois
            elif 980 <= zip_prefix_int <= 994:
                return "WA"  # Washington
            elif 270 <= zip_prefix_int <= 289:
                return "MI"  # Michigan
            else:
                return "MA"  # Default to Massachusetts
        except ValueError:
            return "MA"  # Default to Massachusetts
        
    def calculate_all_taxes(self, standard_deduction=None, additional_deductions=0, tax_credits=0):
        """Calculate all taxes and return a breakdown"""
        fica_tax = self.calculate_fica()
        federal_result = self.calculate_federal_tax(standard_deduction, additional_deductions, tax_credits)
        federal_tax = federal_result["tax"]
        state_tax = self.calculate_state_tax()
        
        total_tax = fica_tax + federal_tax + state_tax
        
        return {
            "fica_tax": fica_tax,
            "federal_tax": federal_tax,
            "state_tax": state_tax,
            "total_tax": total_tax,
            "federal_marginal_rate": federal_result["marginal_rate"],
            "federal_effective_rate": federal_result["effective_rate"],
            "effective_tax_rate": total_tax / self.income if self.income > 0 else 0
        }