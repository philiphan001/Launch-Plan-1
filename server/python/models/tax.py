"""
Tax Calculator Class for Financial Projections
"""

class TaxCalculator:
    def __init__(self, income, filing_status="single", zip_code=None, state=None):
        self.income = income
        self.filing_status = filing_status
        self.zip_code = zip_code
        self.state = state
        # State tax rates lookup table (simplified version)
        self.state_tax_rates = {
            'MA': 0.05,  # Massachusetts flat 5%
            'CA': 0.0950,  # California highest marginal rate
            'NY': 0.0685,  # New York highest marginal rate
            'TX': 0.0,  # Texas no income tax
            'FL': 0.0,  # Florida no income tax
            'WA': 0.0,  # Washington no income tax
            'NV': 0.0,  # Nevada no income tax
            'AK': 0.0,  # Alaska no income tax
            'WY': 0.0,  # Wyoming no income tax
            'SD': 0.0,  # South Dakota no income tax
            'NH': 0.05,  # New Hampshire (only on investment income, simplified)
            'TN': 0.0,  # Tennessee no income tax
            'IL': 0.0495,  # Illinois flat 4.95%
            'PA': 0.0307,  # Pennsylvania flat 3.07%
            'NJ': 0.1075,  # New Jersey highest marginal rate
            'CO': 0.0455,  # Colorado flat 4.55%
            'AZ': 0.045,  # Arizona highest marginal rate
            'OR': 0.099,  # Oregon highest marginal rate
            'MI': 0.0425,  # Michigan flat 4.25%
            'OH': 0.03990,  # Ohio highest marginal rate
            'GA': 0.0575,  # Georgia highest marginal rate
            'NC': 0.0475,  # North Carolina flat 4.75%
            'VA': 0.0575,  # Virginia highest marginal rate
            'MD': 0.0575,  # Maryland highest marginal rate
            'MO': 0.0495,  # Missouri highest marginal rate
            'WI': 0.0765,  # Wisconsin highest marginal rate
            'MN': 0.0985,  # Minnesota highest marginal rate
            'IN': 0.0323,  # Indiana flat 3.23%
            'KY': 0.045,   # Kentucky flat 4.5%
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
        state_rate = self.state_tax_rates.get(state_key, 0.05)  # Default to 5% if state not found
        
        # Apply a simplified calculation
        # In a real implementation, we would have progressive brackets for each state
        state_tax = self.income * state_rate
        
        return round(state_tax, 2)
        
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